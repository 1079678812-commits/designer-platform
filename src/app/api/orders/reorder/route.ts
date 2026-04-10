import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session-id')?.value
    const session = await verifySession(sessionId)
    if (!session) return NextResponse.json({ error: '未登录' }, { status: 401 })

    const { orders } = await request.json() as { orders: { id: string; sortOrder: number }[] }
    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: '无效数据' }, { status: 400 })
    }

    // Update sortOrder for each order
    await Promise.all(
      orders.map(({ id, sortOrder }) =>
        prisma.order.update({ where: { id, designerId: session.userId }, data: { sortOrder } })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Reorder error:', error)
    return NextResponse.json({ error: '排序更新失败' }, { status: 500 })
  }
}
