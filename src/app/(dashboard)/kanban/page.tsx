'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Plus, MoreVertical, FileText, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface KanbanCard { id: string; orderNo: string; title: string; status: string; progress: number; amount: number; client?: { name: string }; logo?: string }

const columns = [
  { key: 'pending', label: '待办', color: 'border-t-[#FAAD14]' },
  { key: 'confirmed', label: '已确认', color: 'border-t-[#00B578]' },
  { key: 'in_progress', label: '进行中', color: 'border-t-[#00B578]' },
  { key: 'review', label: '修改中', color: 'border-t-[#722ED1]' },
  { key: 'completed', label: '已完成', color: 'border-t-[#52C41A]' },
]

export default function KanbanPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<KanbanCard[]>([])
  const [clients, setClients] = useState<{id:string,name:string}[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', amount: 0, deadline: '', clientId: '' })
  const [submitting, setSubmitting] = useState(false)

  // Drag & Drop state
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  // Mobile state
  const [mobileColIndex, setMobileColIndex] = useState(0)
  const touchStartX = useRef(0)

  useEffect(() => { if (user) { fetchOrders(); fetchClients(); } }, [user])

  const fetchOrders = async () => {
    try { const res = await fetch('/api/orders'); if (res.ok) { const data = await res.json(); setOrders(Array.isArray(data) ? data : data.orders || []) } } catch {} finally { setLoading(false) }
  }
  const fetchClients = async () => {
    try { const res = await fetch('/api/clients'); if (res.ok) { const data = await res.json(); setClients(Array.isArray(data) ? data : data.clients || []) } } catch {}
  }

  const handleCreate = async () => {
    if (!form.title.trim()) return alert('请输入项目标题')
    setSubmitting(true)
    try {
      const body: any = { title: form.title, description: form.description, amount: form.amount }
      if (form.deadline) body.deadline = new Date(form.deadline).toISOString()
      if (form.clientId) body.clientId = form.clientId
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { setShowModal(false); setForm({ title: '', description: '', amount: 0, deadline: '', clientId: '' }); fetchOrders() }
      else { const data = await res.json(); alert(data.error || '创建失败') }
    } catch { alert('网络错误') } finally { setSubmitting(false) }
  }

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggingId(orderId)
    e.dataTransfer.setData('text/plain', orderId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDragOverCol(null)
  }

  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(colKey)
  }

  const handleDragLeave = () => {
    setDragOverCol(null)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const orderId = e.dataTransfer.getData('text/plain')
    setDragOverCol(null)
    setDraggingId(null)
    if (!orderId) return

    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        fetchOrders() // Revert on failure
        const data = await res.json()
        alert(data.error || '状态更新失败')
      }
    } catch {
      fetchOrders()
      alert('网络错误')
    }
  }

  // Mobile swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) < 50) return
    if (diff < 0 && mobileColIndex < columns.length - 1) setMobileColIndex(i => i + 1)
    if (diff > 0 && mobileColIndex > 0) setMobileColIndex(i => i - 1)
  }

  if (authLoading || loading) return (<div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>)

  const renderColumn = (col: typeof columns[0]) => {
    const cards = orders.filter(o => o.status === col.key)
    const isDragOver = dragOverCol === col.key
    return (
      <div key={col.key} className="flex-shrink-0 w-full md:w-64 lg:w-72"
        onDragOver={e => handleDragOver(e, col.key)}
        onDragLeave={handleDragLeave}
        onDrop={e => handleDrop(e, col.key)}
      >
        <div className={`bg-white rounded-t-xl border-t-4 ${col.color} p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[rgba(0,0,0,0.85)] text-sm">{col.label}</h3>
            <span className="w-6 h-6 bg-[#F5F5F5] rounded-full flex items-center justify-center text-xs font-medium text-[rgba(0,0,0,0.45)]">{cards.length}</span>
          </div>
        </div>
        <div className={`bg-[#FAFAFA] rounded-b-xl p-3 space-y-3 min-h-[200px] transition-colors ${isDragOver ? 'bg-[#E8F8F0]' : ''}`}>
          {cards.map(card => (
            <div key={card.id}
              draggable
              onDragStart={e => handleDragStart(e, card.id)}
              onDragEnd={handleDragEnd}
              className={`bg-white p-4 rounded-lg border border-[#E8E8E8] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow cursor-grab active:cursor-grabbing ${draggingId === card.id ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[rgba(0,0,0,0.45)] font-mono">{card.orderNo}</span>
                <button className="p-1 hover:bg-[#F5F5F5] rounded"><MoreVertical className="w-3.5 h-3.5 text-[rgba(0,0,0,0.45)]" /></button>
              </div>
              <h4 className="font-medium text-[rgba(0,0,0,0.85)] text-sm mb-2">{card.title}</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[#F0F0F0] rounded-full"><div className="h-1.5 bg-[#00B578] rounded-full" style={{ width: `${card.progress}%` }} /></div>
                <span className="text-xs text-[rgba(0,0,0,0.45)]">{card.progress}%</span>
              </div>
            </div>
          ))}
          {cards.length === 0 && (
            <div className="text-center py-8 text-sm text-[rgba(0,0,0,0.25)]"><FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />暂无项目</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">项目管理</h1>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">看板视图 · {orders.length} 个项目</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] text-sm"><Plus className="w-4 h-4" /> 新建项目</button>
        </div>

        {/* Desktop: horizontal scroll kanban */}
        <div className="hidden md:flex gap-4 md:gap-6 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 180px)' }}>
          {columns.map(renderColumn)}
        </div>

        {/* Mobile: single column with swipe/tab navigation */}
        <div className="md:hidden">
          {/* Tab navigation */}
          <div className="flex gap-1 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
            {columns.map((col, i) => (
              <button
                key={col.key}
                onClick={() => setMobileColIndex(i)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  i === mobileColIndex
                    ? 'bg-[#00B578] text-white'
                    : 'bg-white text-[rgba(0,0,0,0.45)] border border-[#E8E8E8]'
                }`}
              >
                {col.label} ({orders.filter(o => o.status === col.key).length})
              </button>
            ))}
          </div>

          {/* Swipeable column area */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="min-h-[calc(100vh-280px)]"
          >
            {renderColumn(columns[mobileColIndex])}
          </div>

          {/* Navigation arrows */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setMobileColIndex(i => Math.max(0, i - 1))}
              disabled={mobileColIndex === 0}
              className="flex items-center gap-1 px-3 py-2 text-sm text-[#00B578] disabled:text-[rgba(0,0,0,0.15)]"
            >
              <ChevronLeft className="w-4 h-4" /> 上一列
            </button>
            <span className="text-xs text-[rgba(0,0,0,0.25)] self-center">{mobileColIndex + 1} / {columns.length}</span>
            <button
              onClick={() => setMobileColIndex(i => Math.min(columns.length - 1, i + 1))}
              disabled={mobileColIndex === columns.length - 1}
              className="flex items-center gap-1 px-3 py-2 text-sm text-[#00B578] disabled:text-[rgba(0,0,0,0.15)]"
            >
              下一列 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-5"><h2 className="text-lg font-bold">新建项目</h2><button onClick={() => setShowModal(false)} className="p-1 hover:bg-[#F5F5F5] rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">项目标题 *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="如：XX公司品牌设计" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">项目描述</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="描述项目内容" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">金额 (元)</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} min={0} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">截止日期</label><input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">关联客户</label><select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm"><option value="">选择客户（可选）</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm hover:bg-[#F5F5F5]">取消</button><button onClick={handleCreate} disabled={submitting} className="px-4 py-2.5 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63] disabled:opacity-50">{submitting ? '创建中...' : '创建'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
