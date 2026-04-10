import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const order = await prisma.order.findFirst({
      where: { id, designerId: req.user.userId },
      include: { client: true, service: true, items: { orderBy: { id: 'asc' } } },
    })
    if (!order) return NextResponse.json({ error: '未找到' }, { status: 404 })
    return NextResponse.json({ order })
  } catch (err) { return NextResponse.json({ error: '获取失败' }, { status: 500 }) }
})

export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const body = await req.json()
    const { items, designerIds, ...orderData } = body

    // Update order fields
    const order = await prisma.order.updateMany({
      where: { id, designerId: req.user.userId },
      data: orderData,
    })
    if (order.count === 0) return NextResponse.json({ error: '未找到' }, { status: 404 })

    // If items provided, replace them
    if (items !== undefined) {
      await prisma.orderItem.deleteMany({ where: { orderId: id } })
      if (items.length > 0) {
        await prisma.orderItem.createMany({
          data: items.map((it: any) => ({
            orderId: id,
            name: it.name,
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
            subtotal: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
          })),
        })
      }
    }

    // If designerIds provided, replace order designers
    if (designerIds !== undefined) {
      await prisma.orderDesigner.deleteMany({ where: { orderId: id } })
      if (designerIds.length > 0) {
        await prisma.orderDesigner.createMany({
          data: designerIds.map((sid: string) => ({ orderId: id, supplierId: sid })),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) { return NextResponse.json({ error: '更新失败' }, { status: 500 }) }
})

export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const order = await prisma.order.deleteMany({ where: { id, designerId: req.user.userId } })
    if (order.count === 0) return NextResponse.json({ error: '未找到' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) { return NextResponse.json({ error: '删除失败' }, { status: 500 }) }
})
