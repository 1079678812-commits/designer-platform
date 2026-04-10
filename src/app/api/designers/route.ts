import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const suppliers = await prisma.client.findMany({
      where: { designerId: req.user.userId, type: 'supplier' },
      select: { id: true, name: true, logo: true, company: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ designers: suppliers.map(s => ({ id: s.id, name: s.name, avatar: s.logo, company: s.company })) })
  } catch (err) {
    return NextResponse.json({ error: '获取供应商列表失败' }, { status: 500 })
  }
})
