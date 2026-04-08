'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Briefcase, Users, FileText, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface DashboardStats {
  totalServices: number; activeServices: number
  totalOrders: number; pendingOrders: number; completedOrders: number; inProgressOrders: number
  totalClients: number; totalRevenue: number; avgRating: number
}

interface RecentOrder {
  id: string; orderNo: string; title: string; status: string; amount: number; createdAt: string
  client?: { name: string }
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待确认', color: 'text-[#FAAD14] bg-[#FFFBE6] border border-[#FFE58F]' },
  confirmed: { label: '已确认', color: 'text-[#00B578] bg-[#E8F8F0] border border-[#7EDCAA]' },
  in_progress: { label: '进行中', color: 'text-[#00B578] bg-[#E8F8F0] border border-[#7EDCAA]' },
  review: { label: '审核中', color: 'text-[#722ED1] bg-[#F9F0FF] border border-[#D3ADF7]' },
  completed: { label: '已完成', color: 'text-[#52C41A] bg-[#F6FFED] border border-[#B7EB8F]' },
  cancelled: { label: '已取消', color: 'text-[#8C8C8C] bg-[#FAFAFA] border border-[#D9D9D9]' },
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchData() }, [user])

  const fetchData = async () => {
    try {
      const [servicesRes, ordersRes, clientsRes] = await Promise.all([
        fetch('/api/services'), fetch('/api/orders'), fetch('/api/clients'),
      ])
      const services = servicesRes.ok ? await servicesRes.json() : []
      const orders = ordersRes.ok ? await ordersRes.json() : []
      const clients = clientsRes.ok ? await clientsRes.json() : []
      const sl = Array.isArray(services) ? services : services.services || []
      const ol = Array.isArray(orders) ? orders : orders.orders || []
      const cl = Array.isArray(clients) ? clients : clients.clients || []
      setStats({
        totalServices: sl.length, activeServices: sl.filter((s: any) => s.status === 'active').length,
        totalOrders: ol.length, pendingOrders: ol.filter((o: any) => o.status === 'pending').length,
        completedOrders: ol.filter((o: any) => o.status === 'completed').length,
        inProgressOrders: ol.filter((o: any) => o.status === 'in_progress').length,
        totalClients: cl.length,
        totalRevenue: ol.filter((o: any) => o.status === 'completed').reduce((s: number, o: any) => s + o.amount, 0),
        avgRating: sl.length ? sl.reduce((s: number, sv: any) => s + sv.rating, 0) / sl.length : 0,
      })
      setRecentOrders(ol.slice(0, 5))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  if (authLoading || loading || !stats) {
    return (<div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>)
  }

  const statCards = [
    { label: '总服务数', value: stats.totalServices, icon: Briefcase, change: `活跃 ${stats.activeServices}`, up: true },
    { label: '总订单数', value: stats.totalOrders, icon: FileText, change: `进行中 ${stats.inProgressOrders}`, up: true },
    { label: '客户总数', value: stats.totalClients, icon: Users, change: `${stats.pendingOrders} 待确认`, up: false },
    { label: '总收入', value: `¥${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, change: `${stats.completedOrders} 笔完成`, up: true },
  ]

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">你好，{user?.name || '设计师'}</h1>
          <p className="text-[rgba(0,0,0,0.45)] mt-1 text-sm md:text-base">欢迎回来，这是你的业务概览</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {statCards.map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-[#E8E8E8] p-5 md:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 bg-[#E8F8F0] rounded-xl flex items-center justify-center">
                  <card.icon className="w-5 h-5 text-[#00B578]" />
                </div>
                <span className={`flex items-center text-xs font-medium ${card.up ? 'text-[#52C41A]' : 'text-[#FAAD14]'}`}>
                  {card.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {card.change}
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-[rgba(0,0,0,0.85)]">{card.value}</p>
              <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-base md:text-lg font-semibold text-[rgba(0,0,0,0.85)] mb-4">快捷操作</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: '新建服务', href: '/services', icon: Briefcase },
              { label: '查看订单', href: '/orders', icon: FileText },
              { label: '客户管理', href: '/clients', icon: Users },
              { label: '数据分析', href: '/analytics', icon: TrendingUp },
            ].map(action => (
              <a key={action.label} href={action.href} className="bg-white rounded-xl border border-[#E8E8E8] flex items-center gap-3 p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow">
                <div className="w-9 h-9 bg-[#E8F8F0] rounded-lg flex items-center justify-center">
                  <action.icon className="w-4 h-4 text-[#00B578]" />
                </div>
                <span className="text-sm font-medium text-[rgba(0,0,0,0.85)]">{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E8E8] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="p-5 md:p-6 border-b border-[#F0F0F0] flex items-center justify-between">
            <h2 className="text-base md:text-lg font-semibold text-[rgba(0,0,0,0.85)]">最近订单</h2>
            <a href="/orders" className="text-sm text-[#00B578] hover:text-[#009A63]">查看全部</a>
          </div>
          <div className="divide-y divide-[#F0F0F0]">
            {recentOrders.length === 0 && <div className="p-6 text-center text-[rgba(0,0,0,0.45)]">暂无订单</div>}
            {recentOrders.map(order => {
              const s = statusMap[order.status] || statusMap.pending
              return (
                <div key={order.id} className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FAFAFA] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[rgba(0,0,0,0.85)] truncate">{order.title}</p>
                    <p className="text-sm text-[rgba(0,0,0,0.45)] truncate">{order.orderNo} · {order.client?.name || '-'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[rgba(0,0,0,0.85)]">¥{order.amount.toLocaleString()}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${s.color}`}>{s.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
