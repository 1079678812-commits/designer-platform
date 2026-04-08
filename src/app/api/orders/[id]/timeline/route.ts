import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

// GET /api/orders/[id]/timeline - Get order activity timeline

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params

    const order = await prisma.order.findFirst({
      where: { id, designerId: req.user.userId },
      include: {
        client: { select: { name: true } },
        service: { select: { name: true } },
        contract: { select: { title: true, status: true, signedAt: true } },
        invoice: { select: { invoiceNo: true, status: true, paidAt: true } },
      },
    })

    if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 })

    // Build timeline from order lifecycle
    const timeline: { time: string; event: string; detail: string; type: string }[] = []

    // Order created
    timeline.push({
      time: order.createdAt,
      event: '订单创建',
      detail: `${order.client?.name || '客户'} 提交了订单「${order.title}」`,
      type: 'create',
    })

    // Status changes (inferred from current status)
    const statusFlow = ['pending', 'confirmed', 'in_progress', 'review', 'completed']
    const currentIdx = statusFlow.indexOf(order.status)
    const statusLabels: Record<string, string> = {
      pending: '待确认', confirmed: '已确认', in_progress: '开始制作', review: '提交审核', completed: '完成交付',
    }

    for (let i = 1; i <= currentIdx; i++) {
      timeline.push({
        time: order.updatedAt, // Approximation
        event: statusLabels[statusFlow[i]],
        detail: `订单状态变更为「${statusLabels[statusFlow[i]]}」`,
        type: 'status',
      })
    }

    // Contract events
    if (order.contract) {
      timeline.push({
        time: order.contract.signedAt || order.createdAt,
        event: '合同签署',
        detail: `合同「${order.contract.title}」已${order.contract.status === 'signed' ? '签署' : '创建'}`,
        type: 'contract',
      })
    }

    // Invoice events
    if (order.invoice) {
      timeline.push({
        time: order.invoice.paidAt || order.updatedAt,
        event: '发票/付款',
        detail: `发票 ${order.invoice.invoiceNo} ${order.invoice.status === 'paid' ? '已付款' : '待付款'}`,
        type: 'payment',
      })
    }

    // Progress milestones
    if (order.progress >= 50 && order.progress < 100) {
      timeline.push({ time: order.updatedAt, event: '进度过半', detail: `项目进度达到 ${order.progress}%`, type: 'progress' })
    }
    if (order.progress === 100) {
      timeline.push({ time: order.updatedAt, event: '制作完成', detail: '项目进度 100%，等待客户确认', type: 'progress' })
    }

    return NextResponse.json({ timeline })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '获取时间线失败' }, { status: 500 })
  }
})
