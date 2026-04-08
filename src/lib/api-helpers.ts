import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function getSession() {
  try {
    const { verifyToken } = await import('./auth-jwt')
    const cookieStore = await cookies()
    const token = cookieStore.get('designer_token')?.value
    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        return {
          user: {
            id: payload.userId,
            name: payload.name,
            email: payload.email,
            role: payload.role,
          },
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
      }
    }
  } catch (error) {
    console.error('Session check failed:', error)
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
