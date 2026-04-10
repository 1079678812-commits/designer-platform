import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const designers = await prisma.user.findMany({
      where: { role: 'designer', status: 'active' },
      select: { id: true, name: true, avatar: true, title: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ designers })
  } catch (err) {
    return NextResponse.json({ error: '获取设计师列表失败' }, { status: 500 })
  }
})
