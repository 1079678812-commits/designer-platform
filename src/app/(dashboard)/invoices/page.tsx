'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Search, Plus, Receipt, X } from 'lucide-react'

interface Invoice { id: string; invoiceNo: string; title: string; amount: number; status: string; dueDate: string | null; createdAt: string; order?: { title: string } }

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: '待支付', color: 'text-[#FAAD14] bg-[#FFFBE6] border border-[#FFE58F]' },
  paid: { label: '已支付', color: 'text-[#52C41A] bg-[#F6FFED] border border-[#B7EB8F]' },
  overdue: { label: '已逾期', color: 'text-[#FF4D4F] bg-[#FFF2F0] border border-[#FFCCC7]' },
  cancelled: { label: '已取消', color: 'text-[rgba(0,0,0,0.45)] bg-[#F5F5F5] border border-[#E8E8E8]' },
}

export default function InvoicesPage() {
  const { user, loading: authLoading } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [orders, setOrders] = useState<{id:string,title:string}[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', amount: 0, dueDate: '', orderId: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { if (user) { fetchInvoices(); fetchOrders(); } }, [user])

  const fetchInvoices = async () => {
    try { const res = await fetch('/api/invoices'); if (res.ok) { const data = await res.json(); setInvoices(Array.isArray(data) ? data : data.invoices || []) } } catch {} finally { setLoading(false) }
  }
  const fetchOrders = async () => {
    try { const res = await fetch('/api/orders'); if (res.ok) { const data = await res.json(); setOrders(Array.isArray(data) ? data : data.orders || []) } } catch {}
  }

  const handleCreate = async () => {
    if (!form.title.trim()) return alert('请输入发票标题')
    setSubmitting(true)
    try {
      const body: any = { title: form.title, amount: form.amount }
      if (form.dueDate) body.dueDate = new Date(form.dueDate).toISOString()
      if (form.orderId) body.orderId = form.orderId
      const res = await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { setShowModal(false); setForm({ title: '', amount: 0, dueDate: '', orderId: '' }); fetchInvoices() }
      else { const data = await res.json(); alert(data.error || '创建失败') }
    } catch { alert('网络错误') } finally { setSubmitting(false) }
  }

  const filtered = invoices.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.invoiceNo.toLowerCase().includes(search.toLowerCase()))

  if (authLoading || loading) return (<div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>)

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div><h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">发票管理</h1><p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">管理你的发票和账单</p></div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] transition-colors text-sm"><Plus className="w-4 h-4" /> 新建发票</button>
        </div>

        <div className="space-y-3">
          {filtered.map(invoice => {
            const config = statusConfig[invoice.status] || statusConfig.pending
            return (
              <div key={invoice.id} className="bg-white rounded-xl border border-[#E8E8E8] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span><span className="text-xs text-[rgba(0,0,0,0.45)]">#{invoice.invoiceNo}</span></div>
                    <h3 className="font-semibold text-[rgba(0,0,0,0.85)]">{invoice.title}</h3>
                    {invoice.order && <p className="text-xs text-[rgba(0,0,0,0.45)] mt-1">关联订单: {invoice.order.title}</p>}
                  </div>
                  <p className="text-lg font-bold text-[rgba(0,0,0,0.85)]">¥{invoice.amount.toLocaleString()}</p>
                </div>
              </div>
            )
          })}
        </div>
        {filtered.length === 0 && (<div className="text-center py-12"><Receipt className="w-12 h-12 text-[rgba(0,0,0,0.15)] mx-auto mb-4" /><h3 className="text-base font-medium">暂无发票</h3></div>)}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-5"><h2 className="text-lg font-bold">新建发票</h2><button onClick={() => setShowModal(false)} className="p-1 hover:bg-[#F5F5F5] rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">发票标题 *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="如：品牌设计尾款" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">金额 (元)</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} min={0} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">到期日</label><input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">关联订单</label><select value={form.orderId} onChange={e => setForm({...form, orderId: e.target.value})} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm"><option value="">选择订单（可选）</option>{orders.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}</select></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm hover:bg-[#F5F5F5]">取消</button><button onClick={handleCreate} disabled={submitting} className="px-4 py-2.5 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63] disabled:opacity-50">{submitting ? '创建中...' : '创建'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
