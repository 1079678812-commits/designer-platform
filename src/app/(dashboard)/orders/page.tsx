'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Search, Plus, Edit, Trash2, FileText, X, ChevronDown, ChevronUp, Upload, Receipt, FileSignature } from 'lucide-react'

interface OrderItem { id?: string; name: string; quantity: number; unitPrice: number; subtotal: number }

interface Order {
  id: string; orderNo: string; title: string; description: string; status: string
  amount: number; progress: number; deadline: string | null; createdAt: string
  client?: { name: string; logo?: string }; service?: { name: string }
  items?: OrderItem[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: '待确认', color: 'text-[#FAAD14] bg-[#FFFBE6] border border-[#FFE58F]' },
  confirmed: { label: '已确认', color: 'text-[#1890FF] bg-[#E6F7FF] border border-[#91D5FF]' },
  in_progress: { label: '进行中', color: 'text-[#00B578] bg-[#E8F8F0] border border-[#7EDCAA]' },
  review: { label: '修改中', color: 'text-[#722ED1] bg-[#F9F0FF] border border-[#D3ADF7]' },
  completed: { label: '已完成', color: 'text-[#52C41A] bg-[#F6FFED] border border-[#B7EB8F]' },
  cancelled: { label: '已取消', color: 'text-[#FF4D4F] bg-[#FFF2F0] border border-[#FFCCC7]' },
}

const emptyItem = (): OrderItem => ({ name: '', quantity: 1, unitPrice: 0, subtotal: 0 })

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<{id:string,name:string}[]>([])
  const [services, setServices] = useState<{id:string,name:string}[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', amount: 0, deadline: '', clientId: '', serviceId: '', status: 'pending', progress: 0, logo: '' })
  const [items, setItems] = useState<OrderItem[]>([emptyItem()])
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [logoUploading, setLogoUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (user) { fetchOrders(); fetchClients(); fetchServices(); } }, [user])

  const fetchOrders = async () => {
    try { const res = await fetch('/api/orders'); if (res.ok) { const data = await res.json(); setOrders(Array.isArray(data) ? data : data.orders || []) } } catch {} finally { setLoading(false) }
  }
  const fetchClients = async () => {
    try { const res = await fetch('/api/clients'); if (res.ok) { const data = await res.json(); setClients(Array.isArray(data) ? data : data.clients || []) } } catch {}
  }
  const fetchServices = async () => {
    try { const res = await fetch('/api/services'); if (res.ok) { const data = await res.json(); setServices(Array.isArray(data) ? data : data.services || []) } } catch {}
  }

  // Calculate total from items
  const calcTotal = (itemList: OrderItem[]) => itemList.reduce((s, it) => s + it.subtotal, 0)

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setItems(prev => {
      const next = [...prev]
      const item = { ...next[index], [field]: value }
      // Recalc subtotal
      if (field === 'quantity' || field === 'unitPrice') {
        item.subtotal = (item.quantity || 0) * (item.unitPrice || 0)
      }
      next[index] = item
      // Auto-update total
      const total = calcTotal(next)
      setForm(f => ({ ...f, amount: Math.round(total * 100) / 100 }))
      return next
    })
  }

  const addItem = () => setItems(prev => [...prev, emptyItem()])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return alert('文件不能超过5MB')
    if (!file.type.startsWith('image/')) return alert('请选择图片文件')
    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'logo')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) { const data = await res.json(); setForm(f => ({ ...f, logo: data.file.url })) }
      else alert('上传失败')
    } catch { alert('上传失败') }
    finally { setLogoUploading(false); if (logoInputRef.current) logoInputRef.current.value = '' }
  }

  const removeItem = (index: number) => {
    setItems(prev => {
      const next = prev.filter((_, i) => i !== index)
      if (next.length === 0) next.push(emptyItem())
      const total = calcTotal(next)
      setForm(f => ({ ...f, amount: Math.round(total * 100) / 100 }))
      return next
    })
  }

  const handleCreate = async () => {
    if (!form.title.trim()) return alert('请输入订单标题')
    setSubmitting(true)
    try {
      // Filter out empty items
      const validItems = items.filter(it => it.name.trim())
      const body: any = {
        title: form.title, description: form.description, amount: form.amount,
        items: validItems.map(it => ({ name: it.name, quantity: it.quantity, unitPrice: it.unitPrice })),
        logo: form.logo || undefined,
      }
      if (form.deadline) body.deadline = new Date(form.deadline).toISOString()
      if (form.clientId) body.clientId = form.clientId
      if (form.serviceId) body.serviceId = form.serviceId
      if (editingId) { body.status = form.status; body.progress = form.progress }

      const url = editingId ? `/api/orders/${editingId}` : '/api/orders'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        setShowModal(false); setForm({ title: '', description: '', amount: 0, deadline: '', clientId: '', serviceId: '', status: 'pending', progress: 0, logo: '' })
        setItems([emptyItem()]); setEditingId(null); fetchOrders()
      } else { const data = await res.json(); alert(data.error || '操作失败') }
    } catch { alert('网络错误') } finally { setSubmitting(false) }
  }

  const handleEdit = (order: Order) => {
    setEditingId(order.id)
    setForm({
      title: order.title, description: order.description || '', amount: order.amount,
      deadline: order.deadline ? new Date(order.deadline).toISOString().split('T')[0] : '',
      clientId: (order as any).clientId || '', serviceId: (order as any).serviceId || '',
      status: order.status, progress: order.progress, logo: (order as any).logo || '',
    })
    setItems(order.items && order.items.length > 0 ? order.items : [emptyItem()])
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此订单吗？')) return
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      if (res.ok) setOrders(prev => prev.filter(o => o.id !== id))
      else alert('删除失败')
    } catch { alert('删除失败') }
  }

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const statusOrder: Record<string, number> = { pending: 0, confirmed: 1, in_progress: 2, review: 3, cancelled: 4, completed: 5 }
  const filtered = orders.filter(o => o.title.toLowerCase().includes(search.toLowerCase()) || o.orderNo.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9))

  if (authLoading || loading) return (<div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>)

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div><h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">订单管理</h1><p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">管理你的设计订单</p></div>
            <button onClick={() => { setEditingId(null); setForm({ title: '', description: '', amount: 0, deadline: '', clientId: '', serviceId: '', status: 'pending', progress: 0, logo: '' }); setItems([emptyItem()]); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] transition-colors text-sm"><Plus className="w-4 h-4" /> 新建订单</button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E8E8] mb-6">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.45)]" /><input type="text" placeholder="搜索订单..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
        </div>

        <div className="space-y-3">
          {filtered.map(order => {
            const config = statusConfig[order.status] || statusConfig.pending
            const hasItems = order.items && order.items.length > 0
            const expanded = expandedOrders.has(order.id)
            return (
              <div key={order.id} className="bg-white rounded-xl border border-[#E8E8E8] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Logo - 左侧独立圆形框 */}
                    <div className="flex-shrink-0">
                      {(order as any).logo ? (
                        <img src={(order as any).logo} alt="" className="w-12 h-12 rounded-full object-contain border-2 border-[#E8E8E8] p-1 bg-[#FAFAFA]" />
                      ) : (
                        <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center text-lg font-bold text-[rgba(0,0,0,0.15)]">{order.title[0]}</div>
                      )}
                    </div>
                    {/* 信息区 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>
                            <span className="text-xs text-[rgba(0,0,0,0.45)]">#{order.orderNo}</span>
                          </div>
                          <h3 className="font-semibold text-[rgba(0,0,0,0.85)]">{order.title}</h3>
                          {order.description && <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1 line-clamp-1">{order.description}</p>}
                          <div className="flex items-center gap-4 mt-2 text-sm text-[rgba(0,0,0,0.45)]">
                            {order.client && (
                              <span className="flex items-center gap-1.5">
                                {order.client.logo ? (
                                  <img src={order.client.logo} alt="" className="w-4 h-4 rounded-full object-contain bg-[#FAFAFA]" />
                                ) : (
                                  <div className="w-4 h-4 bg-[#F5F5F5] rounded-full flex items-center justify-center text-[7px] font-bold text-[rgba(0,0,0,0.25)]">{order.client.name[0]}</div>
                                )}
                                {order.client.name}
                              </span>
                            )}
                            {order.service && <span>服务: {order.service.name}</span>}
                          </div>
                        </div>
                        <div className="flex items-start gap-2 sm:text-right">
                          <div>
                            <p className="text-lg font-bold text-[rgba(0,0,0,0.85)]">¥{order.amount.toLocaleString()}</p>
                            {order.progress >= 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <input
                                  type="range"
                                  min={0} max={100}
                                  value={order.progress}
                                  onChange={e => {
                                    const val = Number(e.target.value)
                                    setOrders(prev => prev.map(o => o.id === order.id ? {...o, progress: val} : o))
                                    fetch(`/api/orders/${order.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({progress: val}) }).catch(() => {})
                                  }}
                                  className="flex-1 h-1.5 appearance-none bg-[#E8E8E8] rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00B578] [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                                  style={{background: `linear-gradient(to right, #00B578 ${order.progress}%, #E8E8E8 ${order.progress}%)`}}
                                />
                                <span className="text-xs text-[rgba(0,0,0,0.45)] w-8 text-right">{order.progress}%</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => handleEdit(order)} className="p-1.5 hover:bg-[#F5F5F5] rounded-lg text-[rgba(0,0,0,0.45)]"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => window.location.href = '/contracts?orderId=' + order.id} className="p-1.5 hover:bg-[#FFF7E6] rounded-lg text-[#FAAD14]" title="合同"><FileSignature className="w-4 h-4" /></button>
                            <button onClick={() => window.location.href = '/invoices?orderId=' + order.id} className="p-1.5 hover:bg-[#E8F8F0] rounded-lg text-[#00B578]" title="开票"><Receipt className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(order.id)} className="p-1.5 hover:bg-[#FFF2F0] rounded-lg text-[#FF4D4F]"><Trash2 className="w-4 h-4" /></button>
                            {hasItems && (
                              <button onClick={() => toggleExpand(order.id)} className="p-1.5 hover:bg-[#F5F5F5] rounded-lg text-[rgba(0,0,0,0.45)]">
                                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items breakdown */}
                {hasItems && expanded && (
                  <div className="border-t border-[#F0F0F0] px-5 pb-4">
                    <table className="w-full text-sm mt-3">
                      <thead>
                        <tr className="text-[rgba(0,0,0,0.45)]">
                          <th className="pb-2 text-left font-medium">项目</th>
                          <th className="pb-2 text-right font-medium w-20">数量</th>
                          <th className="pb-2 text-right font-medium w-24">单价</th>
                          <th className="pb-2 text-right font-medium w-24">小计</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items!.map((item, i) => (
                          <tr key={item.id || i} className="border-t border-[#F5F5F5]">
                            <td className="py-2 text-[rgba(0,0,0,0.85)]">{item.name}</td>
                            <td className="py-2 text-right text-[rgba(0,0,0,0.65)]">{item.quantity}</td>
                            <td className="py-2 text-right text-[rgba(0,0,0,0.65)]">¥{item.unitPrice.toLocaleString()}</td>
                            <td className="py-2 text-right font-medium text-[rgba(0,0,0,0.85)]">¥{item.subtotal.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-[#E8E8E8]">
                          <td colSpan={3} className="py-2.5 text-right font-semibold text-[rgba(0,0,0,0.85)]">总计</td>
                          <td className="py-2.5 text-right font-bold text-[#00B578] text-base">¥{order.amount.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (<div className="text-center py-12"><FileText className="w-12 h-12 text-[rgba(0,0,0,0.15)] mx-auto mb-4" /><h3 className="text-base font-medium">暂无订单</h3><p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">点击"新建订单"添加</p></div>)}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5"><h2 className="text-lg font-bold">{editingId ? '编辑订单' : '新建订单'}</h2><button onClick={() => { setShowModal(false); setEditingId(null) }} className="p-1 hover:bg-[#F5F5F5] rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">订单标题 *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="如：XX公司品牌设计" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>

              {/* Logo upload */}
              <div>
                <label className="block text-sm font-medium mb-1.5">项目/公司 Logo</label>
                <div className="flex items-center gap-3">
                  {form.logo ? (
                    <div className="relative w-10 h-10">
                      <img src={form.logo} alt="Logo" className="w-10 h-10 rounded-full object-contain border-2 border-[#E8E8E8] p-1 bg-[#FAFAFA]" />
                      <button onClick={() => setForm({...form, logo: ''})} className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF4D4F] text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button onClick={() => logoInputRef.current?.click()} disabled={logoUploading}
                      className="w-10 h-10 border-2 border-dashed border-[#D9D9D9] rounded-full bg-[#FAFAFA] flex items-center justify-center text-[rgba(0,0,0,0.25)] hover:border-[#00B578] hover:text-[#00B578] transition-colors disabled:opacity-50">
                      {logoUploading ? <div className="w-4 h-4 border-2 border-[#00B578] border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                    </button>
                  )}
                  <button onClick={() => logoInputRef.current?.click()} disabled={logoUploading} className="text-sm text-[#00B578] hover:text-[#009A63] disabled:opacity-50">
                    {logoUploading ? '上传中...' : form.logo ? '更换' : '上传 Logo'}
                  </button>
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </div>
              </div>
              <div><label className="block text-sm font-medium mb-1">订单描述</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} placeholder="描述订单内容" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm resize-none" /></div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">费用明细</label>
                  <button onClick={addItem} className="text-xs text-[#00B578] hover:text-[#009A63] flex items-center gap-1"><Plus className="w-3 h-3" /> 添加项目</button>
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-[#FAFAFA] rounded-lg">
                      <div className="flex-1 min-w-0">
                        <input type="text" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="项目名称" className="w-full px-2.5 py-1.5 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:border-[#00B578]" />
                      </div>
                      <div className="w-16 flex-shrink-0">
                        <input type="number" value={item.quantity || ''} onChange={e => updateItem(i, 'quantity', Number(e.target.value) || 0)} min={1} placeholder="数量" className="w-full px-2.5 py-1.5 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:border-[#00B578] text-center" />
                      </div>
                      <div className="w-24 flex-shrink-0">
                        <input type="number" value={item.unitPrice || ''} onChange={e => updateItem(i, 'unitPrice', Number(e.target.value) || 0)} min={0} placeholder="单价" className="w-full px-2.5 py-1.5 border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:border-[#00B578] text-right" />
                      </div>
                      <div className="w-24 flex-shrink-0 px-2.5 py-1.5 bg-[#F0F0F0] rounded-md text-sm text-[rgba(0,0,0,0.65)] text-right">¥{item.subtotal.toLocaleString()}</div>
                      {items.length > 1 && (
                        <button onClick={() => removeItem(i)} className="p-1 text-[rgba(0,0,0,0.25)] hover:text-[#FF4D4F] flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-3 pt-3 border-t border-[#E8E8E8]">
                  <div className="text-sm"><span className="text-[rgba(0,0,0,0.45)]">总计：</span><span className="text-lg font-bold text-[#00B578]">¥{form.amount.toLocaleString()}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">截止日期</label><input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">关联客户</label><select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm"><option value="">选择客户（可选）</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">关联服务</label><select value={form.serviceId} onChange={e => setForm({...form, serviceId: e.target.value})} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm"><option value="">选择服务（可选）</option>{services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>

              {editingId && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">状态</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm"><option value="pending">待确认</option><option value="confirmed">已确认</option><option value="in_progress">进行中</option><option value="review">修改中</option><option value="completed">已完成</option><option value="cancelled">已取消</option></select></div>
                  <div><label className="block text-sm font-medium mb-1">进度 (%)</label><input type="number" value={form.progress} onChange={e => setForm({...form, progress: Number(e.target.value)})} min={0} max={100} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => { setShowModal(false); setEditingId(null) }} className="px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm hover:bg-[#F5F5F5]">取消</button><button onClick={handleCreate} disabled={submitting} className="px-4 py-2.5 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63] disabled:opacity-50">{submitting ? '提交中...' : editingId ? '保存' : '创建'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
