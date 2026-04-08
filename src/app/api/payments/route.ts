import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

// Create a payment for an order
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { orderId, method } = body // method: wechat | alipay | bank

    if (!orderId) return NextResponse.json({ error: '缺少订单ID' }, { status: 400 })

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: { id: orderId, designerId: req.user.userId },
    })
    if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 })
    if (order.status === 'completed') return NextResponse.json({ error: '订单已完成' }, { status: 400 })

    // Create payment record (stored as a notification with type=payment for now)
    // In production, this would call WeChat/Alipay API and return a payment URL
    const paymentNo = `PAY${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    // For MVP: simulate payment success
    // In production: redirect to payment gateway, then webhook confirms
    const paymentUrl = `/api/payments/confirm/${paymentNo}`

    return NextResponse.json({
      success: true,
      payment: {
        paymentNo,
        amount: order.amount,
        method: method || 'wechat',
        status: 'pending',
        paymentUrl,
        // QR code URL for WeChat/Alipay would go here in production
        qrCodeUrl: null,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '创建支付失败' }, { status: 500 })
  }
})

// List payments for current user
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const orders = await prisma.order.findMany({
      where: { designerId: req.user.userId },
      select: { id: true, orderNo: true, title: true, amount: true, status: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ payments: orders })
  } catch (err) {
    return NextResponse.json({ error: '获取支付列表失败' }, { status: 500 })
  }
})
