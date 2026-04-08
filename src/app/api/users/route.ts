import { getSession, unauthorized, ok, error } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const user = await prisma.user.findUnique({
      where: { id: (session.user as Record<string, unknown>).id as string },
      select: { id: true, name: true, email: true, phone: true, avatar: true, role: true, title: true, bio: true, status: true, createdAt: true },
    })

    if (!user) return error('用户不存在', 404)
    return ok(user)
  } catch (err) {
    return error('获取用户信息失败')
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await request.json()
    const userId = (session.user as Record<string, unknown>).id as string

    // If updating password, hash it
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10)
    } else {
      delete body.password
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: body,
      select: { id: true, name: true, email: true, phone: true, avatar: true, role: true, title: true, bio: true, status: true },
    })

    return ok(user)
  } catch (err) {
    return error('更新用户信息失败')
  }
}
