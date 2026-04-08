import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

// GET /api/admin/users - List all users (admin only)
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  if (req.user.role !== 'admin') {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }

  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20')
    const search = url.searchParams.get('search') || ''
    const status = url.searchParams.get('status') || ''

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }
    if (status) where.status = status

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true, status: true,
          slug: true, title: true, createdAt: true,
          _count: { select: { services: true, orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({ users, total, page, pageSize })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 })
  }
})
