import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const portfolio = await prisma.portfolio.findFirst({ where: { id, designerId: req.user.userId } })
    if (!portfolio) return NextResponse.json({ error: '未找到' }, { status: 404 })
    return NextResponse.json({ portfolio })
  } catch (err) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
})

export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const body = await req.json()
    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.coverUrl !== undefined) updateData.coverUrl = body.coverUrl
    if (body.images !== undefined) updateData.images = JSON.stringify(body.images)
    if (body.category !== undefined) updateData.category = body.category
    if (body.link !== undefined) updateData.link = body.link
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder

    const portfolio = await prisma.portfolio.updateMany({
      where: { id, designerId: req.user.userId },
      data: updateData,
    })
    if (portfolio.count === 0) return NextResponse.json({ error: '未找到' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const result = await prisma.portfolio.deleteMany({ where: { id, designerId: req.user.userId } })
    if (result.count === 0) return NextResponse.json({ error: '未找到' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
})
