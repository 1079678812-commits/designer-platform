import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const where: any = { designerId: req.user.userId }
    if (status) where.status = status

    const orders = await prisma.order.findMany({
      where,
      include: {
        client: true,
        service: true,
        items: { orderBy: { id: 'asc' } },
        orderDesigners: { include: { supplier: { select: { id: true, name: true, logo: true, company: true } } } },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ orders })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '获取订单失败' }, { status: 500 })
  }
})

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { title, description, amount, clientId, serviceId, deadline, items, designerIds } = body

    if (!title || amount === undefined) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    const orderNo = `ORD${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    const order = await prisma.order.create({
      data: {
        orderNo, title, description, amount: Number(amount),
        clientId: clientId || null, serviceId: serviceId || null,
        deadline: deadline ? new Date(deadline) : null,
        designerId: req.user.userId,
        items: items && items.length > 0 ? {
          create: items.map((it: any) => ({
            name: it.name,
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
            subtotal: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
          }))
        } : undefined,
        orderDesigners: designerIds && designerIds.length > 0 ? {
          create: designerIds.map((sid: string) => ({ supplierId: sid }))
        } : undefined,
      },
      include: { items: true, orderDesigners: { include: { supplier: { select: { id: true, name: true, logo: true, company: true } } } } },
    })

    // Auto-create a draft contract linked to this order
    await prisma.contract.create({
      data: {
        title: title,
        amount: Number(amount),
        status: 'draft',
        orderId: order.id,
        designerId: req.user.userId,
      },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 })
  }
})
