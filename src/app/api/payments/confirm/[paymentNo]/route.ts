import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Payment confirmation webhook (simulated for MVP)
// In production: WeChat/Alipay would call this endpoint
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ paymentNo: string }> }
) {
  try {
    const { paymentNo } = await params
    const body = await req.json()
    const { orderId, success } = body

    if (!orderId) return NextResponse.json({ error: '缺少订单ID' }, { status: 400 })

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 })

    if (success) {
      // Mark order as confirmed and create invoice
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'confirmed', progress: 10 },
      })

      // Auto-create invoice
      const invoiceNo = `INV${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      await prisma.invoice.create({
        data: {
          invoiceNo,
          title: order.title,
          amount: order.amount,
          status: 'paid',
          orderId: order.id,
          designerId: order.designerId,
          paidAt: new Date(),
        },
      })

      // Create notification
      await prisma.notification.create({
        data: {
          title: '付款成功',
          content: `订单 ${order.orderNo} 已收到付款 ¥${order.amount.toLocaleString()}`,
          type: 'payment',
          userId: order.designerId,
        },
      })
    }

    return NextResponse.json({ success: true, paymentNo, status: success ? 'paid' : 'failed' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '确认失败' }, { status: 500 })
  }
}
