import { getSession, unauthorized, created, error } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await request.json()
    const userId = (session.user as Record<string, unknown>).id as string

    if (!body.content || !body.receiverId) {
      return error('消息内容和接收者为必填项', 400)
    }

    const message = await prisma.message.create({
      data: {
        content: body.content,
        senderId: userId,
        receiverId: body.receiverId,
      },
    })

    return created(message)
  } catch (err) {
    return error('发送消息失败')
  }
}
