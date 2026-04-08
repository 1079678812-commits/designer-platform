'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Search, Plus, Eye, Edit, Send, CheckCircle, Clock, XCircle, DollarSign, FileText } from 'lucide-react'

interface Invoice { id: string; invoiceNo: string; title: string; amount: number; status: string; issuedAt: string; dueDate: string | null; paidAt: string | null; order?: { orderNo: string; title: string } }

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: '待付款', color: 'text-[#FAAD14] bg-[#FFFBE6] border border-[#FFE58F]', icon: Clock },
  paid: { label: '已付款', color: 'text-[#52C41A] bg-[#F6FFED] border border-[#B7EB8F]', icon: CheckCircle },
  overdue: { label: '已逾期', color: 'text-[#FF4D4F] bg-[#FFF2F0] border border-[#FFCCC7]', icon: XCircle },
  cancelled: { label: '已取消', color: 'text-[#8C8C8C] bg-[#FAFAFA] border border-[#D9D9D9]', icon: XCircle },
}

export default function InvoicesPage() {
  const { user, loading: authLoading } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => { if (user) fetchInvoices() }, [user])
  useEffect(() => { if (user) fetchInvoices() }, [filterStatus, user])

  const fetchInvoices = async () => {
    try {
      const qs = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      const res = await fetch(`/api/invoices${qs}`)
      if (res.ok) { const data = await res.json(); setInvoices(Array.isArray(data) ? data : data.invoices || []) }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const filtered = invoices.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.invoiceNo.toLowerCase().includes(search.toLowerCase()))
  const totalAmount = invoices.reduce((s, i) => s + i.amount, 0)
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0)

  if (authLoading || loading) return (<div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>)

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">发票管理</h1>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">生成和管理项目发票</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] text-sm"><Plus className="w-4 h-4" /> 新建发票</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {[
            { label: '发票总数', value: invoices.length, icon: FileText, color: 'text-[#00B578]' },
            { label: '总金额', value: `¥${totalAmount.toLocaleString()}`, icon: DollarSign, color: 'text-[#00B578]' },
            { label: '已收款', value: `¥${paidAmount.toLocaleString()}`, icon: CheckCircle, color: 'text-[#52C41A]' },
            { label: '待收款', value: `¥${pendingAmount.toLocaleString()}`, icon: Clock, color: 'text-[#FAAD14]' },
          ].map(s => (
            <div key={s.label} className="bg-white p-4 md:p-6 rounded-xl border border-[#E8E8E8] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between">
                <div><p className="text-xs md:text-sm text-[rgba(0,0,0,0.45)]">{s.label}</p><p className={`text-lg md:text-2xl font-bold ${s.color} mt-1`}>{s.value}</p></div>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E8E8] mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.45)]" />
              <input type="text" placeholder="搜索发票号或标题..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 text-sm" />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'pending', 'paid', 'overdue', 'cancelled'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${filterStatus === s ? 'bg-[#00B578] text-white' : 'bg-[#F5F5F5] text-[rgba(0,0,0,0.45)]'}`}>
                  {s === 'all' ? '全部' : statusMap[s]?.label || s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: Table */}
        <div className="hidden md:block bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FAFAFA]">
                <tr>{['发票号', '标题', '订单', '金额', '状态', '开具日期', '到期日期', '操作'].map(h => <th key={h} className="px-4 py-3 text-left font-medium text-[rgba(0,0,0,0.45)]">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {filtered.map(inv => {
                  const s = statusMap[inv.status] || statusMap.pending
                  return (
                    <tr key={inv.id} className="hover:bg-[#FAFAFA]">
                      <td className="px-4 py-4 font-mono text-[rgba(0,0,0,0.45)]">{inv.invoiceNo}</td>
                      <td className="px-4 py-4 font-medium text-[rgba(0,0,0,0.85)]">{inv.title}</td>
                      <td className="px-4 py-4 text-[rgba(0,0,0,0.45)]">{inv.order?.orderNo || '-'}</td>
                      <td className="px-4 py-4 font-semibold text-[rgba(0,0,0,0.85)]">¥{inv.amount.toLocaleString()}</td>
                      <td className="px-4 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{statusMap[inv.status]?.label || inv.status}</span></td>
                      <td className="px-4 py-4 text-[rgba(0,0,0,0.45)]">{new Date(inv.issuedAt).toLocaleDateString('zh-CN')}</td>
                      <td className="px-4 py-4 text-[rgba(0,0,0,0.45)]">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('zh-CN') : '-'}</td>
                      <td className="px-4 py-4"><div className="flex gap-1"><button className="p-1.5 hover:bg-[#F5F5F5] rounded"><Eye className="w-4 h-4 text-[rgba(0,0,0,0.45)]" /></button><button className="p-1.5 hover:bg-[#F5F5F5] rounded"><Send className="w-4 h-4 text-[rgba(0,0,0,0.45)]" /></button><button className="p-1.5 hover:bg-[#F5F5F5] rounded"><Edit className="w-4 h-4 text-[rgba(0,0,0,0.45)]" /></button></div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无发票</div>}
        </div>

        {/* Mobile: Card list */}
        <div className="md:hidden space-y-3">
          {filtered.map(inv => {
            const s = statusMap[inv.status] || statusMap.pending
            return (
              <div key={inv.id} className="bg-white rounded-xl border border-[#E8E8E8] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[rgba(0,0,0,0.45)]">{inv.invoiceNo}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{statusMap[inv.status]?.label || inv.status}</span>
                </div>
                <h3 className="font-medium text-[rgba(0,0,0,0.85)]">¥{inv.amount.toLocaleString()} · {inv.title}</h3>
                <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">开具：{new Date(inv.issuedAt).toLocaleDateString('zh-CN')}{inv.dueDate ? ` · 到期：${new Date(inv.dueDate).toLocaleDateString('zh-CN')}` : ''}</p>
              </div>
            )
          })}
          {filtered.length === 0 && <div className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无发票</div>}
        </div>
      </div>
    </div>
  )
}
