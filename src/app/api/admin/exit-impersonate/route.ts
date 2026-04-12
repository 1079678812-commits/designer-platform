import { NextRequest, NextResponse } from 'next/server'
import { setTokenCookie } from '@/lib/auth-jwt'

// POST /api/admin/exit-impersonate - Restore admin session
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { adminToken } = body

  if (!adminToken) {
    return NextResponse.json({ error: '缺少管理员凭证' }, { status: 400 })
  }

  const response = NextResponse.json({ success: true })
  response.headers.set('Set-Cookie', setTokenCookie(adminToken, 7 * 24 * 60 * 60))
  return response
}
