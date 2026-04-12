import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, signToken, setTokenCookie } from '@/lib/auth-jwt'
import { prisma } from '@/lib/prisma'

// GET /api/admin/tenants - List all tenants (designers)
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const search = searchParams.get('search') || ''

  const where: any = { role: 'designer' }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [tenants, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        title: true,
        slug: true,
        _count: { select: { services: true, orders: true, clients: true } },
        clients: { select: { company: true }, take: 1 },
        orders: { select: { amount: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ])

  // Enrich with revenue and lastActivity, then sort
  const enriched = tenants.map(t => {
    const revenue = t.orders?.reduce((sum: number, o: any) => sum + (o.amount || 0), 0) || 0
    const lastActivity = t.orders?.length > 0
      ? t.orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
      : t.createdAt
    return {
      ...t,
      company: t.clients?.[0]?.company || null,
      revenue,
      orderCount: t._count.orders,
      lastActivity,
    }
  })

  // Sort by revenue desc, then by activity desc
  enriched.sort((a, b) => {
    if (b.revenue !== a.revenue) return b.revenue - a.revenue
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  })

  return NextResponse.json({
    tenants: enriched,
    total,
  })
}

// PATCH /api/admin/tenants - Suspend/activate a tenant
export async function PATCH(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const body = await request.json()
  const { userId, status } = body

  if (!userId || !['active', 'suspended'].includes(status)) {
    return NextResponse.json({ error: '参数错误' }, { status: 400 })
  }

  const target = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, name: true, status: true },
  })

  return NextResponse.json({ success: true, tenant: target })
}

// POST /api/admin/tenants - Impersonate a tenant (get a token for that user)
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const body = await request.json()
  const { userId } = body

  if (!userId) {
    return NextResponse.json({ error: '参数错误' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, status: true },
  })

  if (!target) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 })
  }

  // Sign a token with impersonatingId
  const token = signToken({
    userId: target.id,
    email: target.email,
    name: target.name,
    role: target.role,
  })

  const response = NextResponse.json({
    success: true,
    impersonating: { id: target.id, name: target.name, email: target.email, role: target.role },
    adminUser: { id: user.userId, name: user.name },
    token,
  })

  response.headers.set('Set-Cookie', setTokenCookie(token))
  return response
}
