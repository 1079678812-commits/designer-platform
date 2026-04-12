import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, setTokenCookie } from '@/lib/auth-jwt'
import { rateLimit } from '@/lib/rate-limit'
import { auditLog, getIpFromRequest } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = getIpFromRequest(request)
    const { allowed, remaining } = rateLimit(`login:${ip}`)
    if (!allowed) {
      return NextResponse.json({ error: '登录尝试过于频繁，请15分钟后重试' }, { status: 429 })
    }

    const body = await request.json()
    const { email, password, rememberMe } = body

    if (!email || !password) {
      return NextResponse.json({ error: '请输入邮箱和密码' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 })
    }

    if (user.status !== 'active') {
      return NextResponse.json({ error: '账户已被禁用' }, { status: 403 })
    }

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60 // 30 days or 7 days
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }, maxAge)

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, slug: user.slug },
    })

    response.headers.set('Set-Cookie', setTokenCookie(token, maxAge))

    await auditLog({ userId: user.id, action: 'login', resource: 'user', ip })

    return response
  } catch (error: any) {
    console.error('Login API error:', error)
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}
