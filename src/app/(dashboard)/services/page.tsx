'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Search, Plus, Edit, Trash2, Eye, Star, TrendingUp, Clock, CheckCircle, XCircle, Briefcase, X, Upload, Camera } from 'lucide-react'

interface Service { id: string; name: string; description: string; category: string; price: number; status: string; tags: string; orderCount: number; rating: number; coverImage?: string; createdAt: string }

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: '已上架', color: 'text-[#52C41A] bg-[#F6FFED] border border-[#B7EB8F]', icon: CheckCircle },
  inactive: { label: '已下架', color: 'text-[#FF4D4F] bg-[#FFF2F0] border border-[#FFCCC7]', icon: XCircle },
  draft: { label: '草稿', color: 'text-[#FAAD14] bg-[#FFFBE6] border border-[#FFE58F]', icon: Clock },
}

const categories = ['品牌设计', '界面设计', '平面设计', '演示设计', '产品设计', '插画', '其他']

export default function ServicesPage() {
  const { user, loading: authLoading } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', category: '品牌设计', price: 0, tags: '', status: 'active', coverImage: '' })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [coverUploading, setCoverUploading] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const coverTargetRef = useRef<string>('')
  const modalCoverRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (user) fetchServices() }, [user])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      if (res.ok) { const data = await res.json(); setServices(Array.isArray(data) ? data : data.services || []) }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const handleCoverUpload = async (serviceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverUploading(serviceId)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', 'service-cover')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        const coverUrl = data.file.url
        await fetch(`/api/services/${serviceId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ coverImage: coverUrl }) })
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, coverImage: coverUrl } : s))
      } else { alert('上传失败') }
    } catch { alert('上传失败') }
    finally { setCoverUploading(null); if (coverInputRef.current) coverInputRef.current.value = '' }
  }

  const handleModalCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverUploading('modal')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', 'service-cover')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        setForm(f => ({ ...f, coverImage: data.file.url }))
      } else { alert('上传失败') }
    } catch { alert('上传失败') }
    finally { setCoverUploading(null); if (modalCoverRef.current) modalCoverRef.current.value = '' }
  }

  const handleCreate = async () => {
    if (!form.name.trim()) return alert('请输入服务名称')
    setSubmitting(true)
    try {
      const url = editingId ? `/api/services/${editingId}` : '/api/services'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowModal(false)
        setForm({ name: '', description: '', category: '品牌设计', price: 0, tags: '', status: 'active', coverImage: '' })
        setEditingId(null)
        fetchServices()
      } else {
        const data = await res.json()
        alert(data.error || '操作失败')
      }
    } catch { alert('网络错误') } finally { setSubmitting(false) }
  }

  const handleEdit = (service: Service) => {
    setEditingId(service.id)
    let tags = ''
    try { tags = JSON.parse(service.tags).join(',') } catch { tags = service.tags || '' }
    setForm({ name: service.name, description: service.description, category: service.category, price: service.price, tags, status: service.status, coverImage: (service as any).coverImage || '' })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该服务？')) return
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
      if (res.ok) fetchServices()
      else { const data = await res.json(); alert(data.error || '删除失败') }
    } catch { alert('网络错误') }
  }

  const allCategories = ['all', ...categories]
  const filtered = services.filter(s => {
    const ms = s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
    const mc = selectedCategory === 'all' || s.category === selectedCategory
    return ms && mc
  })

  if (authLoading || loading) return (<div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>)

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">我的服务</h1>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">管理你的设计服务，展示专业能力</p>
          </div>
            <button onClick={() => { setEditingId(null); setForm({ name: '', description: '', category: '品牌设计', price: 0, tags: '', status: 'active', coverImage: '' }); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] transition-colors text-sm">
              <Plus className="w-4 h-4" /> 新建服务
            </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {[
            { label: '总服务数', value: services.length, icon: Briefcase },
            { label: '已上架', value: services.filter(s => s.status === 'active').length, icon: CheckCircle },
            { label: '总订单数', value: services.reduce((s, sv) => s + sv.orderCount, 0), icon: TrendingUp },

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
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.45)]" />
              <input type="text" placeholder="搜索服务..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 text-sm" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {allCategories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${selectedCategory === cat ? 'bg-[#00B578] text-white' : 'bg-[#F5F5F5] text-[rgba(0,0,0,0.45)] hover:bg-[#E8E8E8]'}`}>
                  {cat === 'all' ? '全部' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <input ref={coverInputRef} type="file" accept="image/*" onChange={e => { const sid = coverTargetRef.current; if (sid) handleCoverUpload(sid, e) }} className="hidden" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {filtered.map(service => {
            const config = statusConfig[service.status] || statusConfig.draft
            const StatusIcon = config.icon
            const cover = (service as any).coverImage
            let tags: string[] = []
            try { tags = JSON.parse(service.tags) } catch { tags = [] }
            return (
              <div key={service.id} className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow flex">
                {/* Left: Content */}
                <div className="w-1/3 p-4 md:p-5 min-w-0 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}><StatusIcon className="w-3 h-3 inline mr-1" />{config.label}</span>
                    <span className="px-2 py-0.5 bg-[#F5F5F5] text-[rgba(0,0,0,0.45)] rounded-full text-xs">{service.category}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[rgba(0,0,0,0.85)] mb-1">{service.name}</h3>
                  <p className="text-sm text-[rgba(0,0,0,0.45)] line-clamp-2">{service.description}</p>
                  {tags.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{tags.map((t: string) => <span key={t} className="px-2 py-0.5 bg-[#F5F5F5] text-[rgba(0,0,0,0.45)] rounded text-xs">{t}</span>)}</div>}
                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#F0F0F0]">
                    <div className="flex items-center gap-4 md:gap-6 text-sm">
                      <div><p className="text-xs text-[rgba(0,0,0,0.45)]">价格</p><p className="font-bold text-[rgba(0,0,0,0.85)]">¥{service.price.toLocaleString()}</p></div>
                      <div className="flex items-center gap-1"><p className="text-xs text-[rgba(0,0,0,0.45)]">订单</p><p className="font-bold text-[rgba(0,0,0,0.85)]">{service.orderCount}</p></div>


                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-2 hover:bg-[#F5F5F5] rounded-lg text-[rgba(0,0,0,0.45)]"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(service)} className="p-2 hover:bg-[#F5F5F5] rounded-lg text-[rgba(0,0,0,0.45)]"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(service.id)} className="p-2 hover:bg-[#FFF2F0] rounded-lg text-[#FF4D4F]"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
                {/* Right: Cover Image */}
                <div className="relative w-2/3 flex-shrink-0 bg-white group">
                  {cover ? (
                    <img src={cover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Briefcase className="w-8 h-8 text-[rgba(0,0,0,0.08)]" />
                    </div>
                  )}
                  <button
                    onClick={() => { coverTargetRef.current = service.id; coverInputRef.current?.click() }}
                    disabled={coverUploading === service.id}
                    className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="上传封面"
                  >
                    {coverUploading === service.id ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-5 h-5 text-white drop-shadow" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-[rgba(0,0,0,0.15)] mx-auto mb-4" />
            <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)]">暂无服务</h3>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">当前筛选条件下没有找到服务</p>
          </div>
        )}
      </div>

      {/* 新建/编辑服务弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-[rgba(0,0,0,0.85)]">{editingId ? '编辑服务' : '新建服务'}</h2>
              <button onClick={() => { setShowModal(false); setEditingId(null) }} className="p-1 hover:bg-[#F5F5F5] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {/* Cover image upload */}
              <div>
                <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1">封面图片</label>
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-[#E8E8E8] bg-gradient-to-br from-[#E8F8F0] to-[#F5F5F5]">
                  {form.coverImage ? (
                    <img src={form.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-[rgba(0,0,0,0.25)]">
                        <Upload className="w-6 h-6 mx-auto mb-1" />
                        <p className="text-xs">上传封面图片</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => modalCoverRef.current?.click()}
                    disabled={coverUploading === 'modal'}
                    className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {coverUploading === 'modal' && <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  </button>
                  {form.coverImage && (
                    <button onClick={() => setForm(f => ({...f, coverImage: ''}))} className="absolute top-2 right-2 w-6 h-6 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"><X className="w-3.5 h-3.5" /></button>
                  )}
                </div>
                <input ref={modalCoverRef} type="file" accept="image/*" onChange={handleModalCoverUpload} className="hidden" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1">服务名称 *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="如：Logo设计" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1">服务描述</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="描述你的服务内容" rows={3} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1">分类</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1">价格 (元)</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} min={0} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1">标签（逗号分隔）</label>
                <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="如：Logo,品牌,VI" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" />
              </div>
              {editingId && (
                <div>
                  <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1">状态</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm">
                    <option value="active">已上架</option>
                    <option value="inactive">已下架</option>
                    <option value="draft">草稿</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditingId(null) }} className="px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm hover:bg-[#F5F5F5]">取消</button>
              <button onClick={handleCreate} disabled={submitting} className="px-4 py-2.5 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63] disabled:opacity-50">
                {submitting ? '提交中...' : editingId ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
