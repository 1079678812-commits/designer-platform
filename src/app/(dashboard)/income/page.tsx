'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { DollarSign, Clock, TrendingUp, ArrowUpRight, ArrowDownRight, Users, FileCheck, BarChart3 } from 'lucide-react'

interface AnalyticsData {
  ordersByMonth: { month: string; count: number; revenue: number }[]
  revenueByCategory: { category: string; revenue: number }[]
  ordersByStatus: { status: string; count: number }[]
  topServices: { name: string; orderCount: number; revenue: number }[]
  clientStats: { total: number; active: number; newThisMonth: number }
}

interface Invoice {
  id: string; invoiceNo: string; title: string; amount: number; status: string;
  issuedAt: string; paidAt?: string; createdAt: string;
  order?: { id: string; title: string; client?: { name: string }; service?: { name: string }; amount: number }
}

export default function IncomePage() {
  const { user, loading: authLoading } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => { if (user) fetchData() }, [user, period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [analyticsRes, invoicesRes] = await Promise.all([
        fetch(`/api/analytics?period=${period}`),
        fetch('/api/invoices'),
      ])
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
      if (invoicesRes.ok) {
        const data = await invoicesRes.json()
        setInvoices(data.invoices || [])
      }
    } catch {} finally { setLoading(false) }
  }

  if (authLoading || loading) return (
    <div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>
  )

  const paidInvoices = invoices.filter(i => i.status === 'paid')
  const pendingInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled')
  const totalRevenue = paidInvoices.reduce((s, i) => s + i.amount, 0)

  const now = new Date()
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`

  const thisMonthRevenue = paidInvoices.filter(i => i.paidAt && new Date(i.paidAt).toISOString().slice(0, 7) === thisMonthKey).reduce((s, i) => s + i.amount, 0)
  const lastMonthRevenue = paidInvoices.filter(i => i.paidAt && new Date(i.paidAt).toISOString().slice(0, 7) === lastMonthKey).reduce((s, i) => s + i.amount, 0)
  const pendingTotal = pendingInvoices.reduce((s, i) => s + i.amount, 0)
  const revenueTrend = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0

  // Monthly chart data
  const monthlyMap = new Map<string, number>()
  paidInvoices.forEach(i => {
    if (!i.paidAt) return
    const key = new Date(i.paidAt).toISOString().slice(0, 7)
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + i.amount)
  })
  const monthlyData = Array.from(monthlyMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([month, revenue]) => ({ month, revenue }))
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1)

  // Analytics data
  const categories = analytics?.revenueByCategory || []
  const maxCatRevenue = Math.max(...categories.map(c => c.revenue), 1)
  const catColors = ['#00B578', '#1890FF', '#FAAD14', '#722ED1', '#FF4D4F', '#13C2C2', '#EB2F96', '#597EF7']

  const statusLabels: Record<string, string> = { pending: '待确认', confirmed: '已确认', in_progress: '进行中', review: '修改中', completed: '已完成', cancelled: '已取消' }
  const statusColors: Record<string, string> = { pending: '#FAAD14', confirmed: '#00B578', in_progress: '#1890FF', review: '#722ED1', completed: '#52C41A', cancelled: '#8C8C8C' }
  const totalOrders = analytics?.ordersByStatus.reduce((s, o) => s + o.count, 0) || 0
  const completedOrders = analytics?.ordersByStatus.find(o => o.status === 'completed')?.count || 0
  const maxStatusVal = analytics ? Math.max(...analytics.ordersByStatus.map(d => d.count), 1) : 1

  const topServices = analytics?.topServices || []
  const activeClients = analytics?.clientStats.active || 0

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">收入与数据</h1>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">收入明细、趋势分析与业务概览</p>
          </div>
          <div className="flex bg-white rounded-lg border border-[#E8E8E8] p-1">
            {(['week', 'month', 'year'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-md text-sm ${period === p ? 'bg-[#00B578] text-white' : 'text-[rgba(0,0,0,0.45)]'}`}>
                {{ week: '本周', month: '本月', year: '今年' }[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Summary cards - 2 rows of 3 */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-[#E8E8E8]">
            <div className="flex items-center justify-between mb-3"><span className="text-sm text-[rgba(0,0,0,0.45)]">总收入</span><DollarSign className="w-5 h-5 text-[#00B578]" /></div>
            <p className="text-2xl font-bold text-[rgba(0,0,0,0.85)]">¥{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-[rgba(0,0,0,0.25)] mt-2">{paidInvoices.length} 笔已到账</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#E8E8E8]">
            <div className="flex items-center justify-between mb-3"><span className="text-sm text-[rgba(0,0,0,0.45)]">本月收入</span><TrendingUp className="w-5 h-5 text-[#1890FF]" /></div>
            <p className="text-2xl font-bold text-[rgba(0,0,0,0.85)]">¥{thisMonthRevenue.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-2">
              {revenueTrend !== 0 && (<>{revenueTrend >= 0 ? <ArrowUpRight className="w-3 h-3 text-[#52C41A]" /> : <ArrowDownRight className="w-3 h-3 text-[#FF4D4F]" />}<span className={`text-xs ${revenueTrend >= 0 ? 'text-[#52C41A]' : 'text-[#FF4D4F]'}`}>{revenueTrend >= 0 ? '+' : ''}{revenueTrend}%</span></>)}
              <span className="text-xs text-[rgba(0,0,0,0.25)]">较上月</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#E8E8E8]">
            <div className="flex items-center justify-between mb-3"><span className="text-sm text-[rgba(0,0,0,0.45)]">待结算</span><Clock className="w-5 h-5 text-[#FAAD14]" /></div>
            <p className="text-2xl font-bold text-[rgba(0,0,0,0.85)]">¥{pendingTotal.toLocaleString()}</p>
            <p className="text-xs text-[rgba(0,0,0,0.25)] mt-2">{pendingInvoices.length} 笔待结算</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#E8E8E8]">
            <div className="flex items-center justify-between mb-3"><span className="text-sm text-[rgba(0,0,0,0.45)]">总订单</span><FileCheck className="w-5 h-5 text-[#00B578]" /></div>
            <p className="text-2xl font-bold text-[rgba(0,0,0,0.85)]">{totalOrders}</p>
            <p className="text-xs text-[rgba(0,0,0,0.25)] mt-2">{completedOrders} 笔已完成</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#E8E8E8]">
            <div className="flex items-center justify-between mb-3"><span className="text-sm text-[rgba(0,0,0,0.45)]">活跃客户</span><Users className="w-5 h-5 text-[#1890FF]" /></div>
            <p className="text-2xl font-bold text-[rgba(0,0,0,0.85)]">{activeClients}</p>
            <p className="text-xs text-[rgba(0,0,0,0.25)] mt-2">有订单往来的客户</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#E8E8E8]">
            <div className="flex items-center justify-between mb-3"><span className="text-sm text-[rgba(0,0,0,0.45)]">完成率</span><BarChart3 className="w-5 h-5 text-[#722ED1]" /></div>
            <p className="text-2xl font-bold text-[rgba(0,0,0,0.85)]">{totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%</p>
            <p className="text-xs text-[rgba(0,0,0,0.25)] mt-2">订单完成比例</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Revenue Trend */}
          <div className="bg-white rounded-xl border border-[#E8E8E8] p-6">
            <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-6">月度收入趋势</h3>
            {monthlyData.length > 0 ? (
              <div className="flex items-end gap-3 h-52">
                {monthlyData.map(m => {
                  const height = (m.revenue / maxRevenue) * 100
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-[rgba(0,0,0,0.45)]">¥{(m.revenue / 1000).toFixed(0)}k</span>
                      <div className="w-full bg-gradient-to-t from-[#00B578] to-[#00D68F] rounded-t-md transition-all hover:opacity-80" style={{ height: `${Math.max(height, 4)}%` }} />
                      <span className="text-xs text-[rgba(0,0,0,0.25)]">{m.month.slice(5)}</span>
                    </div>
                  )
                })}
              </div>
            ) : (<div className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无收入数据</div>)}
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl border border-[#E8E8E8] p-6">
            <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-6">订单状态分布</h3>
            {analytics?.ordersByStatus && analytics.ordersByStatus.length > 0 ? (
              <div className="space-y-4">
                {analytics.ordersByStatus.map(o => {
                  const pct = (o.count / maxStatusVal) * 100
                  return (
                    <div key={o.status}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-[rgba(0,0,0,0.85)]">{statusLabels[o.status] || o.status}</span>
                        <span className="text-sm font-medium text-[rgba(0,0,0,0.85)]">{o.count}</span>
                      </div>
                      <div className="w-full h-3 bg-[#F5F5F5] rounded-full overflow-hidden">
                        <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: statusColors[o.status] || '#00B578' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (<div className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无数据</div>)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Revenue */}
          <div className="bg-white rounded-xl border border-[#E8E8E8] p-6">
            <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-6">分类收入</h3>
            {categories.length > 0 ? (
              <div className="space-y-4">
                {categories.map((c, i) => (
                  <div key={c.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: catColors[i % catColors.length] }} /><span className="text-sm text-[rgba(0,0,0,0.85)]">{c.category}</span></div>
                      <span className="text-sm font-medium text-[rgba(0,0,0,0.85)]">¥{c.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-[#F5F5F5] rounded-full overflow-hidden">
                      <div className="h-3 rounded-full" style={{ width: `${(c.revenue / maxCatRevenue) * 100}%`, backgroundColor: catColors[i % catColors.length] }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (<div className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无分类数据</div>)}
          </div>

          {/* Top Services */}
          <div className="bg-white rounded-xl border border-[#E8E8E8] p-6">
            <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-6">热门服务</h3>
            {topServices.length > 0 ? (
              <div className="space-y-3">
                {topServices.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-3 p-3 bg-[#FAFAFA] rounded-lg">
                    <span className={`w-7 h-7 flex-shrink-0 inline-flex items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-[#00B578] text-white' : 'bg-[#E8E8E8] text-[rgba(0,0,0,0.45)]'}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0"><p className="font-medium text-sm text-[rgba(0,0,0,0.85)] truncate">{s.name}</p><p className="text-xs text-[rgba(0,0,0,0.45)]">{s.orderCount} 笔订单</p></div>
                    <span className="text-sm font-medium text-[#00B578]">¥{s.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (<div className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无数据</div>)}
          </div>
        </div>

        {/* Paid Records */}
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-6">
          <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-6">已到账记录</h3>
          {paidInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F0F0F0]">
                    <th className="pb-3 text-left font-medium text-[rgba(0,0,0,0.45)]">发票</th>
                    <th className="pb-3 text-left font-medium text-[rgba(0,0,0,0.45)]">关联订单</th>
                    <th className="pb-3 text-left font-medium text-[rgba(0,0,0,0.45)]">客户</th>
                    <th className="pb-3 text-right font-medium text-[rgba(0,0,0,0.45)]">金额</th>
                    <th className="pb-3 text-right font-medium text-[rgba(0,0,0,0.45)]">到账时间</th>
                  </tr>
                </thead>
                <tbody>
                  {paidInvoices.slice(0, 15).map(i => (
                    <tr key={i.id} className="border-b border-[#F0F0F0] last:border-0">
                      <td className="py-3 font-medium text-[rgba(0,0,0,0.85)]">{i.title}</td>
                      <td className="py-3 text-[rgba(0,0,0,0.65)]">{i.order?.title || '-'}</td>
                      <td className="py-3 text-[rgba(0,0,0,0.45)]">{i.order?.client?.name || '-'}</td>
                      <td className="py-3 text-right font-medium text-[#00B578]">¥{i.amount.toLocaleString()}</td>
                      <td className="py-3 text-right text-[rgba(0,0,0,0.45)]">{i.paidAt ? new Date(i.paidAt).toLocaleDateString('zh-CN') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (<div className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无到账记录</div>)}
        </div>
      </div>
    </div>
  )
}
