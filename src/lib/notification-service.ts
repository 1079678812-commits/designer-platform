// Notification delivery service
// Supports: in-app, email, webhook (Feishu bot)
// WebSocket support for real-time push

import { prisma } from './prisma'
import { sendEmail, emailTemplates } from './email-service'

export type NotificationType = 'order' | 'payment' | 'contract' | 'system' | 'review'

interface CreateNotificationInput {
  userId: string
  title: string
  content: string
  type: NotificationType
  link?: string
  sendEmail?: boolean
}

export async function sendNotification(input: CreateNotificationInput) {
  // 1. Create in-app notification
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      content: input.content,
      type: input.type,
    },
  })

  // 2. Send email if requested
  if (input.sendEmail) {
    const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { email: true, name: true } })
    if (user) {
      await sendEmail({ to: user.email, subject: input.title, html: `<p>${input.content}</p>`, text: input.content })
    }
  }

  // 3. Send Feishu webhook if configured
  if (process.env.FEISHU_WEBHOOK_URL) {
    await sendFeishuWebhook(input)
  }

  return notification
}

async function sendFeishuWebhook(input: CreateNotificationInput) {
  const webhookUrl = process.env.FEISHU_WEBHOOK_URL
  if (!webhookUrl) return

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msg_type: 'interactive',
        card: {
          header: { title: { tag: 'plain_text', content: `🔔 ${input.title}` } },
          elements: [
            { tag: 'div', text: { tag: 'plain_text', content: input.content } },
          ],
        },
      }),
    })
  } catch (err) {
    console.error('Feishu webhook failed:', err)
  }
}

// WebSocket notification broadcaster (in-memory for dev, Redis pub/sub for production)
type WSClient = { userId: string; send: (data: any) => void }
const wsClients = new Map<string, Set<WSClient>>()

export function registerWSClient(userId: string, client: WSClient) {
  if (!wsClients.has(userId)) wsClients.set(userId, new Set())
  wsClients.get(userId)!.add(client)
  return () => { wsClients.get(userId)?.delete(client) }
}

export function broadcastToUser(userId: string, data: any) {
  const clients = wsClients.get(userId)
  if (clients) {
    const msg = JSON.stringify(data)
    clients.forEach(c => {
      try { c.send(msg) } catch {}
    })
  }
}
