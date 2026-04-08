import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'
import { sendNotification } from '@/lib/notification-service'

// GET /api/orders/[id]/comments - Get order comments
// POST /api/orders/[id]/comments - Add a comment to an order

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ... handled by withAuth below
  const { withAuth } = await import('@/lib/withAuth')
  return withAuth(async (req: AuthenticatedRequest) => {
    const { id } = await params
    const order = await prisma.order.findFirst({ where: { id, designerId: req.user.userId } })
    if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 })

    // For MVP, we store comments as notifications with orderId in content
    // Production: add a Comment model
    const comments = await prisma.notification.findMany({
      where: { userId: req.user.userId, type: 'order', content: { contains: id } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ comments })
  })(req as any)
}

export const POST = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const body = await req.json()
    const { content } = body

    if (!content?.trim()) return NextResponse.json({ error: '评论不能为空' }, { status: 400 })

    const order = await prisma.order.findFirst({ where: { id, designerId: req.user.userId } })
    if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 })

    const comment = await sendNotification({
      userId: req.user.userId,
      title: `订单评论: ${order.title}`,
      content: `[${id}] ${content}`,
      type: 'order',
    })

    return NextResponse.json({ success: true, comment })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '添加评论失败' }, { status: 500 })
  }
})
