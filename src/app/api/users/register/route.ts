import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken, setTokenCookie } from '@/lib/auth-jwt'

function generateSlug(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  const suffix = Math.random().toString(36).slice(2, 6)
  return base ? `${base}-${suffix}` : `designer-${suffix}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: '姓名、邮箱和密码为必填项' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: '密码至少8位' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: '该邮箱已被注册' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const slug = generateSlug(name)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'designer', slug },
      select: { id: true, name: true, email: true, role: true, slug: true },
    })

    // 注册后自动登录
    const token = signToken({ userId: user.id, email: user.email, name: user.name, role: user.role })
    const response = NextResponse.json({ success: true, user }, { status: 201 })
    response.headers.set('Set-Cookie', setTokenCookie(token))

    return response
  } catch (err: any) {
    console.error('Register error:', err)
    return NextResponse.json({ error: '注册失败' }, { status: 500 })
  }
}
