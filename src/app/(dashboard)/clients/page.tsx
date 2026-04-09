'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Search, Plus, Edit, Trash2, User, Phone, Mail, Building, X } from 'lucide-react'

interface Client { id: string; name: string; company: string; email: string; phone: string; status: string; createdAt: string }

export default function ClientsPage() {
  const { user, loading: authLoading } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { if (user) fetchClients() }, [user])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) { const data = await res.json(); setClients(Array.isArray(data) ? data : data.clients || []) }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!form.name.trim()) return alert('请输入客户名称')
    setSubmitting(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { setShowModal(false); setForm({ name: '', company: '', email: '', phone: '' }); fetchClients() }
      else { const data = await res.json(); alert(data.error || '创建失败') }
    } catch { alert('网络错误') } finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该客户？')) return
    try { const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' }); if (res.ok) fetchClients() } catch { alert('网络错误') }
  }

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.company || '').toLowerCase().includes(search.toLowerCase()))

  if (authLoading || loading) return (<div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>)

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">客户管理</h1>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">管理你的客户信息</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] transition-colors text-sm">
            <Plus className="w-4 h-4" /> 新建客户
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E8E8] mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.45)]" />
            <input type="text" placeholder="搜索客户..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(client => (
            <div key={client.id} className="bg-white rounded-xl border border-[#E8E8E8] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E8F8F0] rounded-full flex items-center justify-center"><User className="w-5 h-5 text-[#00B578]" /></div>
                  <div>
                    <h3 className="font-semibold text-[rgba(0,0,0,0.85)]">{client.name}</h3>
                    {client.company && <p className="text-xs text-[rgba(0,0,0,0.45)]">{client.company}</p>}
                  </div>
                </div>
                <button onClick={() => handleDelete(client.id)} className="p-1.5 hover:bg-[#FFF2F0] rounded-lg text-[#FF4D4F]"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="space-y-1.5 text-sm text-[rgba(0,0,0,0.45)]">
                {client.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{client.email}</div>}
                {client.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{client.phone}</div>}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-[rgba(0,0,0,0.15)] mx-auto mb-4" />
            <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)]">暂无客户</h3>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">点击"新建客户"添加</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold">新建客户</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-[#F5F5F5] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">客户名称 *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="客户姓名" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">公司</label><input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="公司名称" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">邮箱</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">电话</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="手机号码" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm hover:bg-[#F5F5F5]">取消</button>
              <button onClick={handleCreate} disabled={submitting} className="px-4 py-2.5 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63] disabled:opacity-50">{submitting ? '创建中...' : '创建'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
