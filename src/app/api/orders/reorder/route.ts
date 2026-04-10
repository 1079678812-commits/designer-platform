import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'
import { prisma } from '@/lib/prisma'

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { orders } = await req.json() as { orders: { id: string; sortOrder: number }[] }
    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: '无效数据' }, { status: 400 })
    }

    // Verify all orders belong to this user, then update
    await Promise.all(
      orders.map(({ id, sortOrder }) =>
        prisma.order.updateMany({ where: { id, designerId: req.user.userId }, data: { sortOrder } })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Reorder error:', error)
    return NextResponse.json({ error: '排序更新失败' }, { status: 500 })
  }
})
