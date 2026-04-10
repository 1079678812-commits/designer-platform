import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const designerId = req.user.userId
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'month'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    switch (period) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'year':
        startDate = new Date(now)
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default: // month
        startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - 1)
    }

    // For monthly trend, always get last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Orders by status (filtered by period)
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
      where: { designerId, createdAt: { gte: startDate } },
    })

    // Top services & revenue by category — from real order data
    const orderItems = await prisma.order.findMany({
      where: { designerId, createdAt: { gte: startDate } },
      select: { serviceId: true, amount: true, service: { select: { name: true, category: true } } },
    })
    const serviceStats: Record<string, { name: string; orderCount: number; revenue: number }> = {}
    const revenueByCategory: Record<string, number> = {}
    orderItems.forEach(o => {
      const key = o.serviceId || 'other'
      if (!serviceStats[key]) serviceStats[key] = { name: o.service?.name || '其他', orderCount: 0, revenue: 0 }
      serviceStats[key].orderCount++
      serviceStats[key].revenue += o.amount
      const cat = o.service?.category || '其他'
      revenueByCategory[cat] = (revenueByCategory[cat] || 0) + o.amount
    })
    const topServices = Object.values(serviceStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Client stats
    const [totalClients, activeClients] = await Promise.all([
      prisma.client.count({ where: { designerId } }),
      prisma.client.count({ where: { designerId, status: 'active' } }),
    ])

    // Monthly orders (last 6 months for trend)
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
      topServices,
      clientStats: { total: totalClients, active: activeClients, newThisMonth: 0 },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '获取分析数据失败' }, { status: 500 })
  }
})
