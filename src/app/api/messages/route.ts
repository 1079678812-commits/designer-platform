import { getSession, unauthorized, ok, error } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const userId = (session.user as Record<string, unknown>).id as string
    const { searchParams } = new URL(req.url)
    const partnerId = searchParams.get('partnerId')

    // If partnerId is provided, return messages with that partner
    if (partnerId) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
      })
      // Mark unread messages as read
      await prisma.message.updateMany({
        where: { senderId: partnerId, receiverId: userId, read: false },
        data: { read: true },
      })
      return ok(messages)
    }

    // Otherwise return conversation list
    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    })

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    })

    const partnerIds = new Set<string>()
    sentMessages.forEach(m => partnerIds.add(m.receiverId))
    receivedMessages.forEach(m => partnerIds.add(m.senderId))

    const partners = await prisma.user.findMany({
      where: { id: { in: Array.from(partnerIds) } },
      select: { id: true, name: true, email: true, avatar: true },
    })

    const conversations = await Promise.all(
      partners.map(async (partner) => {
        const messages = await prisma.message.findMany({
          where: {
            OR: [
              { senderId: userId, receiverId: partner.id },
              { senderId: partner.id, receiverId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        })

        const unreadCount = await prisma.message.count({
          where: { senderId: partner.id, receiverId: userId, read: false },
        })

        return { partner, lastMessage: messages[0] || null, unreadCount }
      })
    )

    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1
      if (!b.lastMessage) return -1
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    })

    return ok(conversations)
  } catch (err) {
    return error('获取消息列表失败')
  }
}
