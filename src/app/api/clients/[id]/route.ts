import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const client = await prisma.client.findFirst({ where: { id, designerId: req.user.userId } })
    if (!client) return NextResponse.json({ error: '未找到' }, { status: 404 })
    return NextResponse.json({ client })
  } catch (err) { return NextResponse.json({ error: '获取失败' }, { status: 500 }) }
})

export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const body = await req.json()
    const client = await prisma.client.updateMany({ where: { id, designerId: req.user.userId }, data: body })
    if (client.count === 0) return NextResponse.json({ error: '未找到' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) { return NextResponse.json({ error: '更新失败' }, { status: 500 }) }
})

export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const client = await prisma.client.deleteMany({ where: { id, designerId: req.user.userId } })
    if (client.count === 0) return NextResponse.json({ error: '未找到' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) { return NextResponse.json({ error: '删除失败' }, { status: 500 }) }
})
