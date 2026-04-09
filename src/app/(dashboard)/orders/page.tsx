'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Search, Plus, Edit, Trash2, FileText, DollarSign, Calendar, X } from 'lucide-react'

interface Order { id: string; orderNo: string; title: string; description: string; status: string; amount: number; progress: number; deadline: string | null; createdAt: string; client?: { name: string }; service?: { name: string } }

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: '待确认', color: 'text-[#FAAD14] bg-[#FFFBE6] border border-[#FFE58F]' },
  confirmed: { label: '已确认', color: 'text-[#1890FF] bg-[#E6F7FF] border border-[#91D5FF]' },
  in_progress: { label: '进行中', color: 'text-[#00B578] bg-[#E8F8F0] border border-[#7EDCAA]' },
  completed: { label: '已完成', color: 'text-[#52C41A] bg-[#F6FFED] border border-[#B7EB8F]' },
  cancelled: { label: '已取消', color: 'text-[#FF4D4F] bg-[#FFF2F0] border border-[#FFCCC7]' },
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<{id:string,name:string}[]>([])
  const [services, setServices] = useState<{id:string,name:string}[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', amount: 0, deadline: '', clientId: '', serviceId: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { if (user) { fetchOrders(); fetchClients(); fetchServices(); } }, [user])

  const fetchOrders = async () => {
    try { const res = await fetch('/api/orders'); if (res.ok) { const data = await res.json(); setOrders(Array.isArray(data) ? data : data.orders || []) } } catch (err) { console.error(err) } finally { setLoading(false) }
  }
  const fetchClients = async () => {
    try { const res = await fetch('/api/clients'); if (res.ok) { const data = await res.json(); setClients(Array.isArray(data) ? data : data.clients || []) } } catch {}
  }
  const fetchServices = async () => {
    try { const res = await fetch('/api/services'); if (res.ok) { const data = await res.json(); setServices(Array.isArray(data) ? data : data.services || []) } } catch {}
  }

  const handleCreate = async () => {
    if (!form.title.trim()) return alert('请输入订单标题')
    setSubmitting(true)
    try {
      const body: any = { title: form.title, description: form.description, amount: form.amount }
      if (form.deadline) body.deadline = new Date(form.deadline).toISOString()
      if (form.clientId) body.clientId = form.clientId
      if (form.serviceId) body.serviceId = form.serviceId
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { setShowModal(false); setForm({ title: '', description: '', amount: 0, deadline: '', clientId: '', serviceId: '' }); fetchOrders() }
      else { const data = await res.json(); alert(data.error || '创建失败') }
    } catch { alert('网络错误') } finally { setSubmitting(false) }
  }

  const filtered = orders.filter(o => o.title.toLowerCase().includes(search.toLowerCase()) || o.orderNo.toLowerCase().includes(search.toLowerCase()))

  if (authLoading || loading) return (<div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>)

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div><h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">订单管理</h1><p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">管理你的设计订单</p></div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] transition-colors text-sm"><Plus className="w-4 h-4" /> 新建订单</button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E8E8] mb-6">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.45)]" /><input type="text" placeholder="搜索订单..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
        </div>

        <div className="space-y-3">
          {filtered.map(order => {
            const config = statusConfig[order.status] || statusConfig.pending
            return (
              <div key={order.id} className="bg-white rounded-xl border border-[#E8E8E8] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>
                      <span className="text-xs text-[rgba(0,0,0,0.45)]">#{order.orderNo}</span>
                    </div>
                    <h3 className="font-semibold text-[rgba(0,0,0,0.85)]">{order.title}</h3>
                    {order.description && <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">{order.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-sm text-[rgba(0,0,0,0.45)]">
                      {order.client && <span>客户: {order.client.name}</span>}
                      {order.service && <span>服务: {order.service.name}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[rgba(0,0,0,0.85)]">¥{order.amount.toLocaleString()}</p>
                    {order.progress > 0 && <div className="w-24 bg-[#F0F0F0] rounded-full h-1.5 mt-2"><div className="bg-[#00B578] h-1.5 rounded-full" style={{width:`${order.progress}%`}} /></div>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (<div className="text-center py-12"><FileText className="w-12 h-12 text-[rgba(0,0,0,0.15)] mx-auto mb-4" /><h3 className="text-base font-medium">暂无订单</h3><p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">点击"新建订单"添加</p></div>)}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5"><h2 className="text-lg font-bold">新建订单</h2><button onClick={() => setShowModal(false)} className="p-1 hover:bg-[#F5F5F5] rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">订单标题 *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="如：XX公司品牌设计" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">订单描述</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="描述订单内容" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">金额 (元)</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} min={0} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">截止日期</label><input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">关联客户</label><select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm"><option value="">选择客户（可选）</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">关联服务</label><select value={form.serviceId} onChange={e => setForm({...form, serviceId: e.target.value})} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm"><option value="">选择服务（可选）</option>{services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm hover:bg-[#F5F5F5]">取消</button><button onClick={handleCreate} disabled={submitting} className="px-4 py-2.5 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63] disabled:opacity-50">{submitting ? '创建中...' : '创建'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
