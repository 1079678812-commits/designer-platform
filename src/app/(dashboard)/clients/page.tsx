'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Search, Plus, Edit, Trash2, User, Phone, Mail, Building, X, Upload } from 'lucide-react'

interface Client { id: string; name: string; company: string; email: string; phone: string; logo?: string; type: string; status: string; createdAt: string; orderCount?: number }

export default function ClientsPage() {
  const { user, loading: authLoading } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', logo: '', type: 'client' })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<'client' | 'supplier'>('client')

  useEffect(() => { if (user) fetchClients() }, [user])

  const fetchClients = async () => {
    try {
      const [clRes, ordRes] = await Promise.all([fetch('/api/clients'), fetch('/api/orders')])
      if (clRes.ok) {
        const data = await clRes.json()
        const clientList: Client[] = Array.isArray(data) ? data : data.clients || []
        // Count orders per client
        if (ordRes.ok) {
          const ordData = await ordRes.json()
          const orders = Array.isArray(ordData) ? ordData : ordData.orders || []
          const countMap: Record<string, number> = {}
          orders.forEach((o: any) => { if (o.clientId) countMap[o.clientId] = (countMap[o.clientId] || 0) + 1 })
          clientList.forEach(c => { c.orderCount = countMap[c.id] || 0 })
        }
        setClients(clientList)
      }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

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
      if (res.ok) {
        const data = await res.json()
        setForm(f => ({ ...f, logo: data.file.url }))
      } else { alert('上传失败') }
    } catch { alert('上传失败') }
    finally { setLogoUploading(false); if (logoInputRef.current) logoInputRef.current.value = '' }
  }

  const handleCreate = async () => {
    if (!form.name.trim()) return alert('请输入客户名称')
    setSubmitting(true)
    try {
      const url = editingId ? `/api/clients/${editingId}` : '/api/clients'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { setShowModal(false); setForm({ name: '', company: '', email: '', phone: '', logo: '', type: 'client' }); setEditingId(null); fetchClients() }
      else { const data = await res.json(); alert(data.error || '操作失败') }
    } catch { alert('网络错误') } finally { setSubmitting(false) }
  }

  const handleEdit = (client: Client) => {
    setEditingId(client.id)
    setForm({ name: client.name, company: client.company || '', email: client.email || '', phone: client.phone || '', logo: (client as any).logo || '', type: client.type || 'client' })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该客户？')) return
    try { const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' }); if (res.ok) fetchClients() } catch { alert('网络错误') }
  }

  const filtered = clients.filter(c => (c.type || 'client') === activeTab && (c.name.toLowerCase().includes(search.toLowerCase()) || (c.company || '').toLowerCase().includes(search.toLowerCase())))

  if (authLoading || loading) return (<div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>)

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">客户与供应商</h1>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">管理客户和操刀设计师（供应商）</p>
          </div>
            <button onClick={() => { setEditingId(null); setForm({ name: '', company: '', email: '', phone: '', logo: '', type: activeTab }); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] transition-colors text-sm">
            <Plus className="w-4 h-4" /> 新建{activeTab === 'supplier' ? '供应商' : '客户'}
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          {['client', 'supplier'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-[#00B578] text-white' : 'bg-white text-[rgba(0,0,0,0.45)] border border-[#E8E8E8] hover:bg-[#F5F5F5]'}`}>
              {tab === 'client' ? '客户' : '供应商'}
            </button>
          ))}
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E8E8] mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.45)]" />
            <input type="text" placeholder="搜索客户..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(client => {
            const logo = (client as any).logo
            return (
              <div key={client.id} className="bg-white rounded-xl border border-[#E8E8E8] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {logo ? (
                      <img src={logo} alt={client.company || client.name} className="w-10 h-10 rounded-full object-contain border-2 border-[#E8E8E8] p-1 bg-[#FAFAFA]" />
                    ) : (
                      <div className="w-10 h-10 bg-[#E8F8F0] rounded-lg flex items-center justify-center"><Building className="w-5 h-5 text-[#00B578]" /></div>
                    )}
                    <div>
                      <h3 className="font-semibold text-[rgba(0,0,0,0.85)]">{client.name}</h3>
                      {client.company && <p className="text-xs text-[rgba(0,0,0,0.45)]">{client.company}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-0.5">
                      <button onClick={() => handleEdit(client)} className="p-1.5 hover:bg-[#F5F5F5] rounded-lg text-[rgba(0,0,0,0.45)]"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(client.id)} className="p-1.5 hover:bg-[#FFF2F0] rounded-lg text-[#FF4D4F]"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    {typeof client.orderCount === 'number' && (
                      <span className="text-xs text-[rgba(0,0,0,0.45)]">合作 <span className="font-semibold text-[#00B578]">{client.orderCount}</span> 次</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-[rgba(0,0,0,0.45)]">
                  {client.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{client.email}</div>}
                  {client.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{client.phone}</div>}
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-[rgba(0,0,0,0.15)] mx-auto mb-4" />
            <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)]">暂无客户</h3>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">点击"新建{activeTab === 'supplier' ? '供应商' : '客户'}"添加</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold">{editingId ? '编辑' : '新建'}{form.type === 'supplier' ? '供应商' : '客户'}</h2>
              <button onClick={() => { setShowModal(false); setEditingId(null) }} className="p-1 hover:bg-[#F5F5F5] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-sm font-medium mb-1.5">类型</label>
                <div className="flex gap-2">
                  {['client', 'supplier'].map(t => (
                    <button key={t} type="button" onClick={() => setForm({...form, type: t})}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${form.type === t ? 'bg-[#00B578] text-white' : 'bg-[#F5F5F5] text-[rgba(0,0,0,0.45)] hover:bg-[#E8E8E8]'}`}>
                      {t === 'client' ? '👤 客户' : '🎨 供应商'}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="block text-sm font-medium mb-1">{form.type === 'supplier' ? '设计师名称' : '客户名称'} *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder={form.type === 'supplier' ? '设计师姓名' : '客户姓名'} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">公司</label><input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="公司名称" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>

              {/* Logo upload */}
              <div>
                <label className="block text-sm font-medium mb-1.5">公司 Logo</label>
                <div className="flex items-center gap-3">
                  {form.logo ? (
                    <div className="relative w-12 h-12">
                      <img src={form.logo} alt="Logo" className="w-12 h-12 rounded-full object-contain border-2 border-[#E8E8E8] p-1 bg-[#FAFAFA]" />
                      <button onClick={() => setForm({...form, logo: ''})} className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF4D4F] text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button onClick={() => logoInputRef.current?.click()} disabled={logoUploading}
                      className="w-12 h-12 border-2 border-dashed border-[#D9D9D9] rounded-full bg-[#FAFAFA] flex items-center justify-center text-[rgba(0,0,0,0.25)] hover:border-[#00B578] hover:text-[#00B578] transition-colors disabled:opacity-50">
                      {logoUploading ? <div className="w-4 h-4 border-2 border-[#00B578] border-t-transparent rounded-full animate-spin" /> : <Upload className="w-5 h-5" />}
                    </button>
                  )}
                  <div className="flex-1">
                    <button onClick={() => logoInputRef.current?.click()} disabled={logoUploading}
                      className="text-sm text-[#00B578] hover:text-[#009A63] disabled:opacity-50">
                      {logoUploading ? '上传中...' : form.logo ? '更换 Logo' : '上传 Logo'}
                    </button>
                    <p className="text-xs text-[rgba(0,0,0,0.25)] mt-0.5">建议正方形，透明底最佳</p>
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">邮箱</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">电话</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="手机号码" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditingId(null) }} className="px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm hover:bg-[#F5F5F5]">取消</button>
              <button onClick={handleCreate} disabled={submitting} className="px-4 py-2.5 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63] disabled:opacity-50">{submitting ? '提交中...' : editingId ? '保存' : '创建'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
