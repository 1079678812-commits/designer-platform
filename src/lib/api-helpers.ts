import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from './session'

export async function getSession() {
  // 先尝试NextAuth session
  const nextAuthSession = await auth()
  if (nextAuthSession?.user) {
    return nextAuthSession
  }
  
  // 尝试我们的自定义session
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session-id')?.value
    if (sessionId) {
      const session = verifySession(sessionId)
      if (session) {
        // 从数据库获取用户信息
        const { prisma } = await import('./prisma')
        const user = await prisma.user.findUnique({
          where: { id: session.userId }
        })
        if (user) {
          return {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
            expires: new Date(session.expires).toISOString(),
          }
        }
      }
    }
  } catch (error) {
    console.error('Custom session check failed:', error)
  }
  
  // 开发环境：返回模拟用户
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: returning mock user')
    return {
      user: {
        id: 'cmnikolxc0000o5fyla0f45ge',
        name: '设计师小王',
        email: 'designer@test.com',
        role: 'designer',
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
  }
  
  return null
}

export function unauthorized() {
  return NextResponse.json({ error: '未登录，请先登录' }, { status: 401 })
}

export function ok(data: unknown) {
  return NextResponse.json({ success: true, data })
}

export function created(data: unknown) {
  return NextResponse.json({ success: true, data }, { status: 201 })
}

export function error(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}
