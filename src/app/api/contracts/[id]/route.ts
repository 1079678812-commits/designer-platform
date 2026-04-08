import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const contract = await prisma.contract.findFirst({ where: { id, designerId: req.user.userId }, include: { order: true } })
    if (!contract) return NextResponse.json({ error: '未找到' }, { status: 404 })
    return NextResponse.json({ contract })
  } catch (err) { return NextResponse.json({ error: '获取失败' }, { status: 500 }) }
})

export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const body = await req.json()
    const contract = await prisma.contract.updateMany({ where: { id, designerId: req.user.userId }, data: body })
    if (contract.count === 0) return NextResponse.json({ error: '未找到' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) { return NextResponse.json({ error: '更新失败' }, { status: 500 }) }
})

export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const contract = await prisma.contract.deleteMany({ where: { id, designerId: req.user.userId } })
    if (contract.count === 0) return NextResponse.json({ error: '未找到' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) { return NextResponse.json({ error: '删除失败' }, { status: 500 }) }
})
