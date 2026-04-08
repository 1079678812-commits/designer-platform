'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { BarChart3, TrendingUp, DollarSign, Users, FileCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface AnalyticsData {
  ordersByStatus: { status: string; count: number }[]
  ordersByMonth: { month: string; count: number; revenue: number }[]
  revenueByCategory: { category: string; revenue: number }[]
  topServices: { name: string; orderCount: number; revenue: number }[]
  clientStats: { total: number; active: number; newThisMonth: number }
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => { if (user) fetchAnalytics() }, [user, period])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics')
      if (res.ok) {
        const d = await res.json()
        setData(d)
      }
    } catch {} finally { setLoading(false) }
  }

  if (authLoading || loading) return (
    <div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>
  )

  const statusLabels: Record<string, string> = {
    pending: '待确认', confirmed: '已确认', in_progress: '进行中', review: '审核中', completed: '已完成', cancelled: '已取消',
  }

  const maxBarValue = data?.ordersByStatus ? Math.max(...data.ordersByStatus.map(d => d.count), 1) : 1

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">数据分析</h1>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">深入了解你的业务表现</p>
          </div>
          <div className="flex bg-white rounded-lg border border-[#E8E8E8] p-1">
            {(['week', 'month', 'year'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm ${period === p ? 'bg-[#00B578] text-white' : 'text-[rgba(0,0,0,0.45)]'}`}>
                {{ week: '本周', month: '本月', year: '今年' }[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: '总订单', value: data?.ordersByStatus.reduce((s, o) => s + o.count, 0) || 0, icon: FileCheck, trend: '+12%', up: true, color: '#00B578' },
            { label: '已完成', value: data?.ordersByStatus.find(o => o.status === 'completed')?.count || 0, icon: TrendingUp, trend: '+8%', up: true, color: '#52C41A' },
            { label: '总营收', value: `¥${(data?.ordersByMonth.reduce((s, o) => s + o.revenue, 0) || 0).toLocaleString()}`, icon: DollarSign, trend: '+23%', up: true, color: '#FAAD14' },
            { label: '活跃客户', value: data?.clientStats.active || 0, icon: Users, trend: '+5%', up: true, color: '#1890FF' },
          ].map(c => (
            <div key={c.label} className="bg-white p-5 rounded-xl border border-[#E8E8E8]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[rgba(0,0,0,0.45)]">{c.label}</span>
                <c.icon className="w-5 h-5" style={{ color: c.color }} />
              </div>
              <p className="text-2xl font-bold text-[rgba(0,0,0,0.85)]">{c.value}</p>
              <div className="flex items-center gap-1 mt-2">
                {c.up ? <ArrowUpRight className="w-3 h-3 text-[#52C41A]" /> : <ArrowDownRight className="w-3 h-3 text-[#FF4D4F]" />}
                <span className={`text-xs ${c.up ? 'text-[#52C41A]' : 'text-[#FF4D4F]'}`}>{c.trend}</span>
                <span className="text-xs text-[rgba(0,0,0,0.25)]">较上期</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl border border-[#E8E8E8] p-6">
            <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-6">订单状态分布</h3>
            <div className="space-y-4">
              {data?.ordersByStatus.map(o => {
                const pct = (o.count / maxBarValue) * 100
                const colors: Record<string, string> = {
                  pending: '#FAAD14', confirmed: '#00B578', in_progress: '#1890FF',
                  review: '#722ED1', completed: '#52C41A', cancelled: '#8C8C8C',
                }
                return (
                  <div key={o.status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-[rgba(0,0,0,0.85)]">{statusLabels[o.status] || o.status}</span>
                      <span className="text-sm font-medium text-[rgba(0,0,0,0.85)]">{o.count}</span>
                    </div>
                    <div className="w-full h-3 bg-[#F5F5F5] rounded-full overflow-hidden">
                      <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: colors[o.status] || '#00B578' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Revenue by Category */}
          <div className="bg-white rounded-xl border border-[#E8E8E8] p-6">
            <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-6">分类营收</h3>
            {data?.revenueByCategory && data.revenueByCategory.length > 0 ? (
              <div className="space-y-4">
                {data.revenueByCategory.map((c, i) => {
                  const colors = ['#00B578', '#1890FF', '#FAAD14', '#722ED1', '#FF4D4F', '#13C2C2']
                  const maxRev = Math.max(...data.revenueByCategory.map(r => r.revenue), 1)
                  const pct = (c.revenue / maxRev) * 100
                  return (
                    <div key={c.category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                          <span className="text-sm text-[rgba(0,0,0,0.85)]">{c.category}</span>
                        </div>
                        <span className="text-sm font-medium text-[rgba(0,0,0,0.85)]">¥{c.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-3 bg-[#F5F5F5] rounded-full overflow-hidden">
                        <div className="h-3 rounded-full" style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-[rgba(0,0,0,0.45)]">暂无数据</div>
            )}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-6 mb-8">
          <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-6">热门服务</h3>
          {data?.topServices && data.topServices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F0F0F0]">
                    <th className="pb-3 text-left font-medium text-[rgba(0,0,0,0.45)]">排名</th>
                    <th className="pb-3 text-left font-medium text-[rgba(0,0,0,0.45)]">服务名称</th>
                    <th className="pb-3 text-right font-medium text-[rgba(0,0,0,0.45)]">订单数</th>
                    <th className="pb-3 text-right font-medium text-[rgba(0,0,0,0.45)]">营收</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topServices.map((s, i) => (
                    <tr key={s.name} className="border-b border-[#F0F0F0] last:border-0">
                      <td className="py-3">
                        <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-[#00B578] text-white' : 'bg-[#F5F5F5] text-[rgba(0,0,0,0.45)]'}`}>{i + 1}</span>
                      </td>
                      <td className="py-3 font-medium text-[rgba(0,0,0,0.85)]">{s.name}</td>
                      <td className="py-3 text-right text-[rgba(0,0,0,0.45)]">{s.orderCount}</td>
                      <td className="py-3 text-right font-medium text-[#00B578]">¥{s.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-[rgba(0,0,0,0.45)]">暂无数据，完成订单后即可查看</div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-6">
          <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-6">月度趋势</h3>
          {data?.ordersByMonth && data.ordersByMonth.length > 0 ? (
            <div className="flex items-end gap-2 h-48">
              {data.ordersByMonth.map((m, i) => {
                const maxCount = Math.max(...data.ordersByMonth.map(x => x.count), 1)
                const height = (m.count / maxCount) * 100
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-[rgba(0,0,0,0.45)]">{m.count}</span>
                    <div className="w-full bg-[#00B578] rounded-t-sm transition-all" style={{ height: `${Math.max(height, 4)}%` }} />
                    <span className="text-xs text-[rgba(0,0,0,0.25)]">{m.month}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[rgba(0,0,0,0.45)]">暂无月度数据</div>
          )}
        </div>
      </div>
    </div>
  )
}
