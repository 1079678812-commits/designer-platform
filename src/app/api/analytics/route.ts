import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const designerId = req.user.userId

    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
      where: { designerId },
    })

    // Revenue by service category
    const services = await prisma.service.findMany({
      where: { designerId },
      select: { category: true, price: true, orderCount: true },
    })
    const revenueByCategory: Record<string, number> = {}
    services.forEach(s => {
      const rev = s.price * s.orderCount
      revenueByCategory[s.category] = (revenueByCategory[s.category] || 0) + rev
    })

    // Top services
    const topServices = await prisma.service.findMany({
      where: { designerId },
      select: { name: true, orderCount: true, price: true },
      orderBy: { orderCount: 'desc' },
      take: 5,
    })

    // Client stats
    const [totalClients, activeClients] = await Promise.all([
      prisma.client.count({ where: { designerId } }),
      prisma.client.count({ where: { designerId, status: 'active' } }),
    ])

    // Monthly orders (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const orders = await prisma.order.findMany({
      where: { designerId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, amount: true, status: true },
    })

    const ordersByMonth: Record<string, { count: number; revenue: number }> = {}
    orders.forEach(o => {
      const month = new Date(o.createdAt).toISOString().slice(0, 7)
      if (!ordersByMonth[month]) ordersByMonth[month] = { count: 0, revenue: 0 }
      ordersByMonth[month].count++
      if (o.status === 'completed') ordersByMonth[month].revenue += o.amount
    })

    return NextResponse.json({
      ordersByStatus: ordersByStatus.map(o => ({ status: o.status, count: o._count })),
      ordersByMonth: Object.entries(ordersByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, d]) => ({ month, ...d })),
      revenueByCategory: Object.entries(revenueByCategory).map(([category, revenue]) => ({ category, revenue })),
      topServices: topServices.map(s => ({ name: s.name, orderCount: s.orderCount, revenue: s.price * s.orderCount })),
      clientStats: { total: totalClients, active: activeClients, newThisMonth: 0 },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '获取分析数据失败' }, { status: 500 })
  }
})
