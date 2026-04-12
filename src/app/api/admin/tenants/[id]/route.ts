import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-jwt'
import { prisma } from '@/lib/prisma'

// GET /api/admin/tenants/[id] - Get tenant detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { id } = await params

  const tenant = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      status: true,
      title: true,
      bio: true,
      slug: true,
      createdAt: true,
      _count: { select: { services: true, orders: true, clients: true, contracts: true, invoices: true } },
      services: {
        select: { id: true, name: true, category: true, price: true, status: true, orderCount: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      orders: {
        select: {
          id: true, orderNo: true, title: true, status: true, amount: true,
          deadline: true, createdAt: true,
          client: { select: { name: true, company: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      clients: {
        select: { id: true, name: true, company: true, email: true, type: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!tenant) {
    return NextResponse.json({ error: '租户不存在' }, { status: 404 })
  }

  return NextResponse.json({ tenant })
}
