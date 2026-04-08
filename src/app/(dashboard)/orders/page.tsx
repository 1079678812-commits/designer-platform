'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Search, Plus, Eye, Edit, DollarSign } from 'lucide-react'
import PaymentModal from '@/components/PaymentModal'

interface Order { id: string; orderNo: string; title: string; description: string; status: string; amount: number; progress: number; deadline: string | null; createdAt: string; client?: { name: string }; service?: { name: string } }

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待确认', color: 'text-[#FAAD14] bg-[#FFFBE6] border border-[#FFE58F]' },
  confirmed: { label: '已确认', color: 'text-[#00B578] bg-[#E8F8F0] border border-[#7EDCAA]' },
  in_progress: { label: '进行中', color: 'text-[#00B578] bg-[#E8F8F0] border border-[#7EDCAA]' },
  review: { label: '审核中', color: 'text-[#722ED1] bg-[#F9F0FF] border border-[#D3ADF7]' },
  completed: { label: '已完成', color: 'text-[#52C41A] bg-[#F6FFED] border border-[#B7EB8F]' },
  cancelled: { label: '已取消', color: 'text-[#8C8C8C] bg-[#FAFAFA] border border-[#D9D9D9]' },
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [payOrder, setPayOrder] = useState<Order | null>(null)

  useEffect(() => { if (user) fetchOrders() }, [user])
  useEffect(() => { if (user) fetchOrders() }, [filterStatus, user])

  const fetchOrders = async () => {
    try {
      const qs = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      const res = await fetch(`/api/orders${qs}`)
      if (res.ok) { const data = await res.json(); setOrders(Array.isArray(data) ? data : data.orders || []) }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const filtered = orders.filter(o => o.title.toLowerCase().includes(search.toLowerCase()) || o.orderNo.toLowerCase().includes(search.toLowerCase()))

  if (authLoading || loading) return (<div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>)

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">订单管理</h1>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">跟踪和管理所有设计订单</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] text-sm"><Plus className="w-4 h-4" /> 新建订单</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {[
            { label: '全部订单', value: orders.length, color: 'text-[rgba(0,0,0,0.85)]' },
            { label: '进行中', value: orders.filter(o => o.status === 'in_progress').length, color: 'text-[#00B578]' },
            { label: '待确认', value: orders.filter(o => o.status === 'pending').length, color: 'text-[#FAAD14]' },
            { label: '已完成', value: orders.filter(o => o.status === 'completed').length, color: 'text-[#52C41A]' },
          ].map(s => (
            <div key={s.label} className="bg-white p-4 md:p-6 rounded-xl border border-[#E8E8E8] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <p className="text-xs md:text-sm text-[rgba(0,0,0,0.45)]">{s.label}</p>
              <p className={`text-lg md:text-2xl font-bold ${s.color} mt-1`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E8E8] mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.45)]" />
              <input type="text" placeholder="搜索订单号或标题..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 text-sm" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {['all', 'pending', 'confirmed', 'in_progress', 'review', 'completed', 'cancelled'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${filterStatus === s ? 'bg-[#00B578] text-white' : 'bg-[#F5F5F5] text-[rgba(0,0,0,0.45)] hover:bg-[#E8E8E8]'}`}>
                  {s === 'all' ? '全部' : statusMap[s]?.label || s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FAFAFA]">
                <tr>{['订单号', '标题', '客户', '金额', '状态', '进度', '截止日期', '操作'].map(h => <th key={h} className="px-4 py-3 text-left font-medium text-[rgba(0,0,0,0.45)]">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-[#FAFAFA]">
                    <td className="px-4 py-4 font-mono text-[rgba(0,0,0,0.45)]">{order.orderNo}</td>
                    <td className="px-4 py-4 font-medium text-[rgba(0,0,0,0.85)]">{order.title}</td>
                    <td className="px-4 py-4 text-[rgba(0,0,0,0.45)]">{order.client?.name || '-'}</td>
                    <td className="px-4 py-4 font-semibold text-[rgba(0,0,0,0.85)]">¥{order.amount.toLocaleString()}</td>
                    <td className="px-4 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[order.status]?.color || ''}`}>{statusMap[order.status]?.label || order.status}</span></td>
                    <td className="px-4 py-4"><div className="flex items-center gap-2"><div className="w-20 h-2 bg-[#F0F0F0] rounded-full"><div className="h-2 rounded-full bg-[#00B578]" style={{ width: `${order.progress}%` }} /></div><span className="text-xs text-[rgba(0,0,0,0.45)]">{order.progress}%</span></div></td>
                    <td className="px-4 py-4 text-[rgba(0,0,0,0.45)]">{order.deadline ? new Date(order.deadline).toLocaleDateString('zh-CN') : '-'}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-[#F5F5F5] rounded"><Eye className="w-4 h-4 text-[rgba(0,0,0,0.45)]" /></button>
                        <button className="p-1.5 hover:bg-[#F5F5F5] rounded"><Edit className="w-4 h-4 text-[rgba(0,0,0,0.45)]" /></button>
                        {order.status === 'pending' && (
                          <button onClick={() => setPayOrder(order)} className="p-1.5 hover:bg-[#E8F8F0] rounded" title="确认收款"><DollarSign className="w-4 h-4 text-[#00B578]" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无订单</div>}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-[#E8E8E8] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[rgba(0,0,0,0.45)]">{order.orderNo}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[order.status]?.color || ''}`}>{statusMap[order.status]?.label || order.status}</span>
              </div>
              <h3 className="font-medium text-[rgba(0,0,0,0.85)] mb-1">{order.title}</h3>
              <p className="text-sm text-[rgba(0,0,0,0.45)]">{order.client?.name || '-'} · ¥{order.amount.toLocaleString()}</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full"><div className="h-2 rounded-full bg-[#00B578]" style={{ width: `${order.progress}%` }} /></div>
                <span className="text-xs text-[rgba(0,0,0,0.45)]">{order.progress}%</span>
              </div>
              {order.status === 'pending' && (
                <button onClick={() => setPayOrder(order)} className="mt-3 w-full py-2 bg-[#00B578] text-white rounded-lg text-sm font-medium hover:bg-[#009A63] flex items-center justify-center gap-2">
                  <DollarSign className="w-4 h-4" />确认收款
                </button>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && <div className="text-center py-12 text-[rgba(0,0,0,0.45)] md:hidden">暂无订单</div>}
      </div>

      <PaymentModal open={!!payOrder} onClose={() => setPayOrder(null)} order={payOrder} onSuccess={fetchOrders} />
    </div>
  )
}
