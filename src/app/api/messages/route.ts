import { getSession, unauthorized, ok, error } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const userId = (session.user as Record<string, unknown>).id as string

    // Get conversation partners (unique users this user has exchanged messages with)
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

    // Get last message with each partner and unread count
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
          where: {
            senderId: partner.id,
            receiverId: userId,
            read: false,
          },
        })

        return {
          partner,
          lastMessage: messages[0] || null,
          unreadCount,
        }
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
