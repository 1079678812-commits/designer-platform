import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/auth/reset-password - Reset password with token
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, oldPassword, newPassword } = body

    if (!email || !oldPassword || !newPassword) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json({ error: '密码长度不能少于8位' }, { status: 400 })
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return NextResponse.json({ error: '密码需包含大小写字母和数字' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

    const valid = await bcrypt.compare(oldPassword, user.password)
    if (!valid) return NextResponse.json({ error: '原密码错误' }, { status: 400 })

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { email }, data: { password: hashed } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '重置密码失败' }, { status: 500 })
  }
}
