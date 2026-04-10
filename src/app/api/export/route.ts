import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function escapeCSV(value: any): string {
  const str = value == null ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCSV(headers: string[], rows: any[][]): string {
  const headerLine = headers.join(',')
  const dataLines = rows.map(row => row.map(escapeCSV).join(','))
  return [headerLine, ...dataLines].join('\n')
}

const statusLabels: Record<string, string> = {
  pending: '待确认', confirmed: '已确认', in_progress: '进行中',
  review: '修改中', completed: '已完成', cancelled: '已取消',
  draft: '草稿', signed: '已签署', expired: '已过期',
  sent: '已发送', paid: '已支付', overdue: '已逾期',
  active: '已上架', inactive: '已下架',
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session-id')?.value
    const session = await verifySession(sessionId)
    if (!session) return NextResponse.json({ error: '未登录' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, role: true },
    })
    if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 401 })

    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'orders'
    const format = url.searchParams.get('format') || 'csv'

    let filename: string
    let csv: string

    switch (type) {
      case 'orders': {
        const orders = await prisma.order.findMany({
          where: { designerId: user.id },
          include: { client: true, service: true, items: true },
          orderBy: { createdAt: 'desc' },
        })
        filename = `订单数据_${new Date().toISOString().slice(0, 10)}.csv`
        csv = toCSV(
          ['订单编号', '标题', '状态', '金额', '进度', '客户', '服务', '截止日期', '创建时间'],
          orders.map(o => [
            o.orderNo, o.title, statusLabels[o.status] || o.status, o.amount,
            `${o.progress}%`, o.client?.name || '', o.service?.name || '',
            o.deadline ? new Date(o.deadline).toLocaleDateString('zh-CN') : '',
            new Date(o.createdAt).toLocaleDateString('zh-CN'),
          ])
        )
        break
      }

      case 'clients': {
        const clients = await prisma.client.findMany({
          where: { designerId: user.id },
          orderBy: { createdAt: 'desc' },
        })
        filename = `客户数据_${new Date().toISOString().slice(0, 10)}.csv`
        csv = toCSV(
          ['姓名', '公司', '邮箱', '电话', '状态', '创建时间'],
          clients.map(c => [
            c.name, c.company || '', c.email, c.phone || '',
            statusLabels[c.status] || c.status,
            new Date(c.createdAt).toLocaleDateString('zh-CN'),
          ])
        )
        break
      }

      case 'services': {
        const services = await prisma.service.findMany({
          where: { designerId: user.id },
          orderBy: { createdAt: 'desc' },
        })
        filename = `服务数据_${new Date().toISOString().slice(0, 10)}.csv`
        csv = toCSV(
          ['名称', '分类', '价格', '状态', '订单数', '评分', '创建时间'],
          services.map(s => [
            s.name, s.category, s.price, statusLabels[s.status] || s.status,
            s.orderCount, s.rating,
            new Date(s.createdAt).toLocaleDateString('zh-CN'),
          ])
        )
        break
      }

      case 'contracts': {
        const contracts = await prisma.contract.findMany({
          where: { designerId: user.id },
          include: { order: { include: { client: true } } },
          orderBy: { createdAt: 'desc' },
        })
        filename = `合同数据_${new Date().toISOString().slice(0, 10)}.csv`
        csv = toCSV(
          ['标题', '状态', '金额', '关联订单', '客户', '签署日期', '创建时间'],
          contracts.map(c => [
            c.title, statusLabels[c.status] || c.status, c.amount,
            c.order?.title || '', c.order?.client?.name || '',
            c.signedAt ? new Date(c.signedAt).toLocaleDateString('zh-CN') : '',
            new Date(c.createdAt).toLocaleDateString('zh-CN'),
          ])
        )
        break
      }

      case 'invoices': {
        const invoices = await prisma.invoice.findMany({
          where: { designerId: user.id },
          include: { order: { include: { client: true } } },
          orderBy: { createdAt: 'desc' },
        })
        filename = `发票数据_${new Date().toISOString().slice(0, 10)}.csv`
        csv = toCSV(
          ['发票号', '标题', '状态', '金额', '关联订单', '客户', '到期日', '创建时间'],
          invoices.map(inv => [
            inv.invoiceNo || '', inv.title, statusLabels[inv.status] || inv.status,
            inv.amount, inv.order?.title || '', inv.order?.client?.name || '',
            inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('zh-CN') : '',
            new Date(inv.createdAt).toLocaleDateString('zh-CN'),
          ])
        )
        break
      }

      default:
        return NextResponse.json({ error: '不支持的数据类型' }, { status: 400 })
    }

    // Add BOM for Excel Chinese compatibility
    const bom = '\uFEFF'
    const csvWithBom = bom + csv

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json({ error: '导出失败: ' + error.message }, { status: 500 })
  }
}
