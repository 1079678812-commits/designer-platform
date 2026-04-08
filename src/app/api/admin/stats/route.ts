import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

// Admin middleware: check if user is admin
function isAdmin(req: AuthenticatedRequest): boolean {
  return req.user.role === 'admin'
}

// GET /api/admin/stats - Platform statistics
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }

  try {
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      pendingReviews,
      recentUsers,
      ordersByStatus,
      services,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { amount: true }, where: { status: 'completed' } }),
      prisma.service.count({ where: { status: 'review' } }),
      prisma.user.findMany({ take: 10, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, role: true, status: true, createdAt: true } }),
      prisma.order.groupBy({ by: ['status'], _count: true }),
      prisma.service.findMany({ where: { status: 'review' }, include: { designer: { select: { name: true, email: true } } }, take: 20, orderBy: { createdAt: 'desc' } }),
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingReviews,
      },
      recentUsers,
      ordersByStatus: ordersByStatus.map(o => ({ status: o.status, count: o._count })),
      pendingServices: services,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 })
  }
})
