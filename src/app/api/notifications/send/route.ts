import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'
import { sendNotification, broadcastToUser } from '@/lib/notification-service'

// Test notification (for dev) + real send endpoint
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { title, content, type, sendEmail } = body

    if (!title || !content) {
      return NextResponse.json({ error: '缺少标题或内容' }, { status: 400 })
    }

    const notification = await sendNotification({
      userId: req.user.userId,
      title,
      content,
      type: type || 'system',
      sendEmail: sendEmail || false,
    })

    // Real-time push via WebSocket channel
    broadcastToUser(req.user.userId, {
      type: 'notification',
      data: notification,
    })

    return NextResponse.json({ success: true, notification })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '发送通知失败' }, { status: 500 })
  }
})
