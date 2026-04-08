import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const where: any = { designerId: req.user.userId }
    if (status) where.status = status

    const contracts = await prisma.contract.findMany({
      where, include: { order: true }, orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ contracts })
  } catch (err) { return NextResponse.json({ error: '获取合同失败' }, { status: 500 }) }
})

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { title, description, amount, orderId } = body
    if (!title || !orderId || amount === undefined) return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })

    // 验证订单属于当前用户
    const order = await prisma.order.findFirst({ where: { id: orderId, designerId: req.user.userId } })
    if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 })

    const contract = await prisma.contract.create({
      data: { title, description, amount: Number(amount), orderId, designerId: req.user.userId },
    })
    return NextResponse.json({ contract }, { status: 201 })
  } catch (err) { return NextResponse.json({ error: '创建合同失败' }, { status: 500 }) }
})
