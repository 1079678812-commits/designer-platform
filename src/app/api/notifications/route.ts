import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const where: any = { userId: req.user.userId }
    if (type) where.type = type

    const notifications = await prisma.notification.findMany({
      where, orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ notifications })
  } catch (err) { return NextResponse.json({ error: '获取通知失败' }, { status: 500 }) }
})

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { title, content, type } = body
    const notification = await prisma.notification.create({
      data: { title, content, type: type || 'system', userId: req.user.userId },
    })
    return NextResponse.json({ notification }, { status: 201 })
  } catch (err) { return NextResponse.json({ error: '创建通知失败' }, { status: 500 }) }
})
