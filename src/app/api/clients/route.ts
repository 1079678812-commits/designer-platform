import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const clients = await prisma.client.findMany({
      where: { designerId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ clients })
  } catch (err) { return NextResponse.json({ error: '获取客户列表失败' }, { status: 500 }) }
})

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { name, company, email, phone, type, logo } = body
    if (!name || !email) return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })

    const client = await prisma.client.create({
      data: { name, company: company || null, email, phone: phone || null, logo: logo || null, type: type || 'client', designerId: req.user.userId },
    })
    return NextResponse.json({ client }, { status: 201 })
  } catch (err) { return NextResponse.json({ error: '创建客户失败' }, { status: 500 }) }
})
