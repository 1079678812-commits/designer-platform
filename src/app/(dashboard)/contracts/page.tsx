'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Search, Plus, Eye, Edit, Trash2, FileText, CheckCircle, Clock, XCircle, Download } from 'lucide-react'

interface Contract { id: string; title: string; description: string | null; status: string; amount: number; signedAt: string | null; createdAt: string; order?: { orderNo: string; title: string } }

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: '草稿', color: 'text-[#FAAD14] bg-[#FFFBE6] border border-[#FFE58F]', icon: Clock },
  signed: { label: '已签署', color: 'text-[#52C41A] bg-[#F6FFED] border border-[#B7EB8F]', icon: CheckCircle },
  expired: { label: '已过期', color: 'text-[#8C8C8C] bg-[#FAFAFA] border border-[#D9D9D9]', icon: XCircle },
  cancelled: { label: '已取消', color: 'text-[#FF4D4F] bg-[#FFF2F0] border border-[#FFCCC7]', icon: XCircle },
}

export default function ContractsPage() {
  const { user, loading: authLoading } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => { if (user) fetchContracts() }, [user])
  useEffect(() => { if (user) fetchContracts() }, [filterStatus, user])

  const fetchContracts = async () => {
    try {
      const qs = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      const res = await fetch(`/api/contracts${qs}`)
      if (res.ok) { const data = await res.json(); setContracts(Array.isArray(data) ? data : data.contracts || []) }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const filtered = contracts.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))

  if (authLoading || loading) return (<div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>)

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">合同管理</h1>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">管理项目合同，确保权益保障</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] text-sm"><Plus className="w-4 h-4" /> 新建合同</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {[
            { label: '总合同', value: contracts.length, icon: FileText },
            { label: '已签署', value: contracts.filter(c => c.status === 'signed').length, icon: CheckCircle },
            { label: '草稿', value: contracts.filter(c => c.status === 'draft').length, icon: Clock },
            { label: '总金额', value: `¥${contracts.reduce((s, c) => s + c.amount, 0).toLocaleString()}`, icon: FileText },
          ].map(s => (
            <div key={s.label} className="bg-white p-4 md:p-6 rounded-xl border border-[#E8E8E8] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between">
                <div><p className="text-xs md:text-sm text-[rgba(0,0,0,0.45)]">{s.label}</p><p className="text-lg md:text-2xl font-bold text-[rgba(0,0,0,0.85)] mt-1">{s.value}</p></div>
                <s.icon className="w-5 h-5 text-[#00B578]" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E8E8] mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.45)]" />
              <input type="text" placeholder="搜索合同..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 text-sm" />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'draft', 'signed', 'expired', 'cancelled'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${filterStatus === s ? 'bg-[#00B578] text-white' : 'bg-[#F5F5F5] text-[rgba(0,0,0,0.45)]'}`}>
                  {s === 'all' ? '全部' : statusMap[s]?.label || s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          {filtered.map(contract => {
            const s = statusMap[contract.status] || statusMap.draft
            const StatusIcon = s.icon
            return (
              <div key={contract.id} className="bg-white rounded-xl border border-[#E8E8E8] p-4 md:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-[rgba(0,0,0,0.85)]">{contract.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}><StatusIcon className="w-3 h-3 inline mr-1" />{s.label}</span>
                    </div>
                    <p className="text-sm text-[rgba(0,0,0,0.45)] truncate">{contract.description || '-'}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-[rgba(0,0,0,0.45)]">
                      {contract.order && <span>订单：{contract.order.orderNo}</span>}
                      <span>创建于：{new Date(contract.createdAt).toLocaleDateString('zh-CN')}</span>
                      {contract.signedAt && <span>签署于：{new Date(contract.signedAt).toLocaleDateString('zh-CN')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 md:ml-6">
                    <span className="text-lg md:text-xl font-bold text-[rgba(0,0,0,0.85)]">¥{contract.amount.toLocaleString()}</span>
                    <div className="flex gap-1">
                      <button className="p-2 hover:bg-[#F5F5F5] rounded-lg text-[rgba(0,0,0,0.45)]"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-[#F5F5F5] rounded-lg text-[rgba(0,0,0,0.45)]"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-[#F5F5F5] rounded-lg text-[rgba(0,0,0,0.45)]"><Download className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-[#FFF2F0] rounded-lg text-[#FF4D4F]"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && <div className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无合同</div>}
        </div>
      </div>
    </div>
  )
}
