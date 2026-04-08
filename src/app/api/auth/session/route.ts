import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, clearTokenCookie } from '@/lib/auth-jwt'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  return NextResponse.json({ user })
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.headers.set('Set-Cookie', clearTokenCookie())
  return response
}
