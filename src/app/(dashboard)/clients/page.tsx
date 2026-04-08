'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Search, Plus, Eye, Edit, Trash2, Phone, Mail, Building, Users, TrendingUp } from 'lucide-react'

interface Client { id: string; name: string; company: string | null; email: string | null; phone: string | null; avatar: string | null; status: string; createdAt: string; _count?: { orders: number } }

export default function ClientsPage() {
  const { user, loading: authLoading } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { if (user) fetchClients() }, [user])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) { const data = await res.json(); setClients(Array.isArray(data) ? data : data.clients || []) }
    } catch (err) { console.error(err) } finally { setLoading(false) }
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
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">管理你的客户关系</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] text-sm"><Plus className="w-4 h-4" /> 新建客户</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
          {[
            { label: '总客户数', value: clients.length, icon: Users },
            { label: '活跃客户', value: clients.filter(c => c.status === 'active').length, icon: TrendingUp },
            { label: '企业客户', value: clients.filter(c => c.company).length, icon: Building },
          ].map(s => (
            <div key={s.label} className="bg-white p-4 md:p-6 rounded-xl border border-[#E8E8E8] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between">
                <div><p className="text-xs md:text-sm text-[rgba(0,0,0,0.45)]">{s.label}</p><p className="text-lg md:text-2xl font-bold text-[rgba(0,0,0,0.85)] mt-1">{s.value}</p></div>
                <div className="w-9 h-9 bg-[#E8F8F0] rounded-lg flex items-center justify-center"><s.icon className="w-4 h-4 text-[#00B578]" /></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E8E8] mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.45)]" />
            <input type="text" placeholder="搜索客户名称或公司..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map(client => (
            <div key={client.id} className="bg-white rounded-xl border border-[#E8E8E8] p-5 md:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-gradient-to-br from-[#00B578] to-[#009A63] rounded-full flex items-center justify-center text-white font-medium text-lg">{client.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[rgba(0,0,0,0.85)] truncate">{client.name}</h3>
                  {client.company && <p className="text-sm text-[rgba(0,0,0,0.45)] truncate">{client.company}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${client.status === 'active' ? 'text-[#52C41A] bg-[#F6FFED] border border-[#B7EB8F]' : 'text-[#FAAD14] bg-[#FFFBE6] border border-[#FFE58F]'}`}>
                  {client.status === 'active' ? '活跃' : '非活跃'}
                </span>
              </div>
              <div className="space-y-2 text-sm text-[rgba(0,0,0,0.45)]">
                {client.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 flex-shrink-0" /><span className="truncate">{client.email}</span></div>}
                {client.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 flex-shrink-0" /><span>{client.phone}</span></div>}
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#F0F0F0]">
                <button className="p-2 hover:bg-[#F5F5F5] rounded-lg text-[rgba(0,0,0,0.45)]"><Eye className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-[#F5F5F5] rounded-lg text-[rgba(0,0,0,0.45)]"><Edit className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-[#FFF2F0] rounded-lg text-[#FF4D4F]"><Trash2 className="w-4 h-4" /></button>
                <span className="ml-auto text-sm text-[rgba(0,0,0,0.45)]">{client._count?.orders || 0} 个订单</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12"><Users className="w-12 h-12 text-[rgba(0,0,0,0.15)] mx-auto mb-4" /><h3 className="text-base font-medium text-[rgba(0,0,0,0.85)]">暂无客户</h3></div>
        )}
      </div>
    </div>
  )
}
