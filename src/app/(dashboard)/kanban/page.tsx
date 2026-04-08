'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Plus, MoreVertical, FileText } from 'lucide-react'

interface KanbanCard { id: string; orderNo: string; title: string; status: string; progress: number; amount: number; client?: { name: string } }

const columns = [
  { key: 'pending', label: '待办', color: 'border-t-[#FAAD14]' },
  { key: 'confirmed', label: '已确认', color: 'border-t-[#00B578]' },
  { key: 'in_progress', label: '进行中', color: 'border-t-[#00B578]' },
  { key: 'review', label: '审核中', color: 'border-t-[#722ED1]' },
  { key: 'completed', label: '已完成', color: 'border-t-[#52C41A]' },
]

export default function KanbanPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<KanbanCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchOrders() }, [user])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) { const data = await res.json(); setOrders(Array.isArray(data) ? data : data.orders || []) }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  if (authLoading || loading) return (<div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>)

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">项目管理</h1>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">看板视图 · {orders.length} 个项目</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] text-sm"><Plus className="w-4 h-4" /> 新建项目</button>
        </div>

        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 180px)' }}>
          {columns.map(col => {
            const cards = orders.filter(o => o.status === col.key)
            return (
              <div key={col.key} className="flex-shrink-0 w-64 md:w-72">
                <div className={`bg-white rounded-t-xl border-t-4 ${col.color} p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[rgba(0,0,0,0.85)] text-sm">{col.label}</h3>
                    <span className="w-6 h-6 bg-[#F5F5F5] rounded-full flex items-center justify-center text-xs font-medium text-[rgba(0,0,0,0.45)]">{cards.length}</span>
                  </div>
                </div>
                <div className="bg-[#FAFAFA] rounded-b-xl p-3 space-y-3 min-h-[200px]">
                  {cards.map(card => (
                    <div key={card.id} className="bg-white p-4 rounded-lg border border-[#E8E8E8] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[rgba(0,0,0,0.45)] font-mono">{card.orderNo}</span>
                        <button className="p-1 hover:bg-[#F5F5F5] rounded"><MoreVertical className="w-3.5 h-3.5 text-[rgba(0,0,0,0.45)]" /></button>
                      </div>
                      <h4 className="font-medium text-[rgba(0,0,0,0.85)] text-sm mb-2">{card.title}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-1.5 bg-[#F0F0F0] rounded-full"><div className="h-1.5 bg-[#00B578] rounded-full" style={{ width: `${card.progress}%` }} /></div>
                        <span className="text-xs text-[rgba(0,0,0,0.45)]">{card.progress}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[rgba(0,0,0,0.45)]">
                        <span>{card.client?.name || '-'}</span>
                        <span className="font-medium text-[rgba(0,0,0,0.85)]">¥{card.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div className="text-center py-8 text-sm text-[rgba(0,0,0,0.25)]"><FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />暂无项目</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
