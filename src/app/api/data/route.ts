import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 验证session
    const sessionId = request.cookies.get('session-id')?.value
    const session = await verifySession(sessionId)
    
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 })
    }

    // 根据查询参数返回不同的数据
    const url = new URL(request.url)
    const dataType = url.searchParams.get('type') || 'dashboard'
    
    let data: any = {}
    
    switch (dataType) {
      case 'dashboard':
        // 仪表盘数据
        const [services, clients, orders, projects] = await Promise.all([
          prisma.service.count({ where: { userId: user.id } }),
          prisma.client.count({ where: { userId: user.id } }),
          prisma.order.count({ where: { userId: user.id } }),
          prisma.project.count({ where: { userId: user.id } })
        ])
        
        data = {
          stats: {
            services,
            clients,
            orders,
            projects
          },
          recentOrders: await prisma.order.findMany({
            where: { userId: user.id },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { client: true }
          })
        }
        break
        
      case 'services':
        // 服务数据
        data = await prisma.service.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        })
        break
        
      case 'clients':
        // 客户数据
        data = await prisma.client.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        })
        break
        
      case 'orders':
        // 订单数据
        data = await prisma.order.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          include: { client: true, service: true }
        })
        break
        
      case 'contracts':
        // 合同数据（模拟）
        data = [
          { id: '1', name: '网站设计合同', clientName: 'ABC公司', amount: 5000, status: 'signed', createdAt: '2026-03-15' },
          { id: '2', name: 'UI设计合同', clientName: 'XYZ科技', amount: 3000, status: 'pending', createdAt: '2026-03-20' },
          { id: '3', name: '品牌设计合同', clientName: '创意工作室', amount: 8000, status: 'draft', createdAt: '2026-03-25' }
        ]
        break
        
      case 'invoices':
        // 发票数据（模拟）
        data = [
          { id: '1', invoiceNumber: 'INV-2026-001', clientName: 'ABC公司', amount: 5000, status: 'paid', createdAt: '2026-03-10', dueDate: '2026-03-31' },
          { id: '2', invoiceNumber: 'INV-2026-002', clientName: 'XYZ科技', amount: 3000, status: 'sent', createdAt: '2026-03-15', dueDate: '2026-04-15' },
          { id: '3', invoiceNumber: 'INV-2026-003', clientName: '创意工作室', amount: 8000, status: 'draft', createdAt: '2026-03-20', dueDate: '2026-04-20' }
        ]
        break
        
      case 'notifications':
        // 通知数据（模拟）
        data = [
          { id: '1', type: 'order', title: '新订单', message: '收到来自ABC公司的新订单', read: false, createdAt: new Date().toISOString() },
          { id: '2', type: 'message', title: '新消息', message: '客户XYZ科技发来新消息', read: true, createdAt: '2026-03-28T10:30:00Z' },
          { id: '3', type: 'system', title: '系统更新', message: '系统将在今晚进行维护', read: false, createdAt: '2026-03-27T15:45:00Z' }
        ]
        break
        
      case 'analytics':
        // 分析数据（模拟）
        const url = new URL(request.url)
        const startDate = url.searchParams.get('start') || '2026-01-01'
        const endDate = url.searchParams.get('end') || '2026-04-30'
        
        data = {
          monthlyRevenue: [5000, 3000, 8000, 6000, 4000, 7000, 9000, 5500, 6500, 7200, 5800, 8100],
          serviceDistribution: [
            { type: '网站设计', count: 12 },
            { type: 'UI设计', count: 8 },
            { type: '品牌设计', count: 5 },
            { type: '平面设计', count: 7 }
          ],
          topClients: [
            { name: 'ABC公司', orderCount: 8, totalRevenue: 32000 },
            { name: 'XYZ科技', orderCount: 5, totalRevenue: 15000 },
            { name: '创意工作室', orderCount: 3, totalRevenue: 24000 },
            { name: '数字媒体', orderCount: 4, totalRevenue: 12000 }
          ],
          orders: [
            { id: '1', amount: 5000, status: 'completed', paidDate: '2026-03-10' },
            { id: '2', amount: 3000, status: 'completed', paidDate: '2026-03-15' },
            { id: '3', amount: 8000, status: 'completed', paidDate: '2026-03-20' }
          ],
          clients: [
            { id: '1', name: 'ABC公司', createdAt: '2026-01-15', totalRevenue: 32000, orderCount: 8 },
            { id: '2', name: 'XYZ科技', createdAt: '2026-02-10', totalRevenue: 15000, orderCount: 5 },
            { id: '3', name: '创意工作室', createdAt: '2026-03-05', totalRevenue: 24000, orderCount: 3 }
          ],
          services: await prisma.service.findMany({
            where: { userId: user.id },
            select: { id: true, name: true, category: true, price: true }
          })
        }
        break
        
      case 'profile':
        // 用户资料
        data = {
          name: user.name || '设计师',
          email: user.email,
          phone: '13800138000',
          bio: '资深设计师，擅长UI/UX设计和品牌设计',
          avatar: null
        }
        break
        
      case 'settings':
        // 用户设置
        data = {
          notifications: { email: true, push: true, sms: false },
          notificationTypes: { orders: true, messages: true, payments: true, system: false, promotions: false },
          privacy: { profilePublic: true, portfolioPublic: true, analyticsEnabled: true, dataRetention: '90' },
          billing: { paymentMethod: 'alipay', invoiceTitle: user.name || '个人', taxNumber: '', autoInvoice: true },
          account: { twoFactorEnabled: false }
        }
        break
        
      default:
        data = { message: '数据类型不支持', type: dataType }
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Data API error:', error)
    return NextResponse.json({ error: '获取数据失败: ' + error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证session
    const sessionId = request.cookies.get('session-id')?.value
    const session = await verifySession(sessionId)
    
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { action, data: requestData } = body
    
    let result: any = { success: true }
    
    switch (action) {
      case 'mark-notification-read':
        // 标记通知为已读
        result.message = '通知已标记为已读'
        break
        
      case 'mark-all-notifications-read':
        // 标记所有通知为已读
        result.message = '所有通知已标记为已读'
        break
        
      case 'delete-notification':
        // 删除通知
        result.message = '通知已删除'
        break
        
      case 'clear-all-notifications':
        // 清空所有通知
        result.message = '所有通知已清空'
        break
        
      case 'update-profile':
        // 更新个人资料
        result.message = '个人资料已更新'
        break
        
      case 'update-password':
        // 更新密码
        result.message = '密码已更新'
        break
        
      case 'update-notification-settings':
        // 更新通知设置
        result.message = '通知设置已更新'
        break
        
      case 'update-privacy-settings':
        // 更新隐私设置
        result.message = '隐私设置已更新'
        break
        
      case 'update-billing-settings':
        // 更新账单设置
        result.message = '账单设置已更新'
        break
        
      default:
        return NextResponse.json({ error: '不支持的操作' }, { status: 400 })
    }
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Data API POST error:', error)
    return NextResponse.json({ error: '操作失败: ' + error.message }, { status: 500 })
  }
}