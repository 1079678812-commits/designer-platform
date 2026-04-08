import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

// GET /api/admin/audit - Get audit logs
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  if (req.user.role !== 'admin') {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }

  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50')
    const action = url.searchParams.get('action') || ''
    const resource = url.searchParams.get('resource') || ''

    const where: any = {}
    if (action) where.action = action
    if (resource) where.resource = resource

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({ logs, total, page, pageSize })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '获取日志失败' }, { status: 500 })
  }
})
