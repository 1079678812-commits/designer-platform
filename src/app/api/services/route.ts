import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const services = await prisma.service.findMany({
      where: { designerId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ services })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '获取服务列表失败' }, { status: 500 })
  }
})

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { name, description, category, price, status, tags } = body

    if (!name || !category || price === undefined) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        name, description, category, price: Number(price),
        status: status || 'draft', tags: tags || '[]',
        designerId: req.user.userId,
      },
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '创建服务失败' }, { status: 500 })
  }
})
