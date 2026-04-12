import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, clearTokenCookie } from '@/lib/auth-jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const tokenUser = getUserFromRequest(request)
  if (!tokenUser) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  // Fetch fresh user data from DB for avatar, title, etc.
  let dbUser = null
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: { id: true, name: true, email: true, role: true, title: true, avatar: true, status: true },
    })
  } catch {}

  const user = dbUser
    ? { userId: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role, title: dbUser.title, avatar: dbUser.avatar, status: dbUser.status }
    : tokenUser

  return NextResponse.json({ user })
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.headers.set('Set-Cookie', clearTokenCookie())
  return response
}
