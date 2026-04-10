'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Plus, Pencil, Trash2, X, Image as ImageIcon, ExternalLink } from 'lucide-react'

interface PortfolioItem {
  id: string; title: string; description: string | null; coverUrl: string | null
  images: string; category: string | null; link: string | null; sortOrder: number; createdAt: string
}

const defaultForm = { title: '', description: '', category: '', link: '', coverUrl: '', images: [] as string[] }

export default function WorksPage() {
  const { user, loading: authLoading } = useAuth()
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<PortfolioItem | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { if (user) fetchPortfolios() }, [user])

  const fetchPortfolios = async () => {
    try {
      const res = await fetch('/api/portfolios')
      if (res.ok) { const data = await res.json(); setPortfolios(data.portfolios || []) }
    } catch {} finally { setLoading(false) }
  }

  const openCreate = () => { setEditing(null); setForm(defaultForm); setShowModal(true) }
  const openEdit = (p: PortfolioItem) => {
    setEditing(p)
    setForm({
      title: p.title, description: p.description || '', category: p.category || '',
      link: p.link || '', coverUrl: p.coverUrl || '',
      images: (() => { try { return JSON.parse(p.images) } catch { return [] } })(),
    })
    setShowModal(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (res.ok) {
          const data = await res.json()
          const url = data.url || data.fileUrl || `/api/upload/${data.filename || data.fileName}`
          setForm(prev => ({ ...prev, images: [...prev.images, url] }))
        }
      }
    } catch {} finally { setUploading(false) }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setForm(prev => ({ ...prev, coverUrl: data.url || data.fileUrl || `/api/upload/${data.filename || data.fileName}` }))
      }
    } catch {} finally { setUploading(false) }
  }

  const save = async () => {
    if (!form.title.trim() || saving) return
    setSaving(true)
    try {
      const body = { title: form.title, description: form.description, category: form.category, link: form.link, coverUrl: form.coverUrl, images: form.images }
      if (editing) {
        const res = await fetch(`/api/portfolios/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (res.ok) { await fetchPortfolios(); setShowModal(false) }
      } else {
        const res = await fetch('/api/portfolios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (res.ok) { await fetchPortfolios(); setShowModal(false) }
      }
    } catch {} finally { setSaving(false) }
  }

  const deletePortfolio = async (id: string) => {
    if (!confirm('确定要删除这个作品吗？')) return
    try {
      const res = await fetch(`/api/portfolios/${id}`, { method: 'DELETE' })
      if (res.ok) setPortfolios(prev => prev.filter(p => p.id !== id))
    } catch {}
  }

  if (authLoading || loading) return (
    <div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>
  )

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">作品集</h1>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">管理你的设计作品和案例展示</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#00B578] text-white rounded-lg text-sm font-medium hover:bg-[#009A63]">
            <Plus className="w-4 h-4" /> 新建作品
          </button>
        </div>

        {portfolios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <ImageIcon className="w-16 h-16 text-[rgba(0,0,0,0.1)] mb-4" />
            <h3 className="text-lg font-medium text-[rgba(0,0,0,0.85)] mb-2">暂无作品</h3>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mb-4">添加你的第一个作品吧</p>
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#00B578] text-white rounded-lg text-sm font-medium hover:bg-[#009A63]">
              <Plus className="w-4 h-4" /> 新建作品
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map(p => {
              const images = (() => { try { return JSON.parse(p.images) } catch { return [] } })()
              const coverImg = p.coverUrl || images[0]
              return (
                <div key={p.id} className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden group hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all">
                  <div className="aspect-video bg-[#F5F5F5] relative overflow-hidden">
                    {coverImg ? (
                      <img src={coverImg} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-[rgba(0,0,0,0.15)]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button onClick={() => openEdit(p)} className="p-2 bg-white rounded-lg shadow-lg hover:bg-[#F5F5F5]">
                        <Pencil className="w-4 h-4 text-[rgba(0,0,0,0.65)]" />
                      </button>
                      <button onClick={() => deletePortfolio(p.id)} className="p-2 bg-white rounded-lg shadow-lg hover:bg-[#FFF2F0]">
                        <Trash2 className="w-4 h-4 text-[#FF4D4F]" />
                      </button>
                      {p.link && (
                        <a href={p.link} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-lg shadow-lg hover:bg-[#F5F5F5]">
                          <ExternalLink className="w-4 h-4 text-[rgba(0,0,0,0.65)]" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-[rgba(0,0,0,0.85)] mb-1 truncate">{p.title}</h3>
                    {p.description && <p className="text-sm text-[rgba(0,0,0,0.45)] line-clamp-2 mb-2">{p.description}</p>}
                    <div className="flex items-center justify-between">
                      {p.category && (
                        <span className="px-2 py-0.5 bg-[#E8F8F0] text-[#00B578] text-xs rounded font-medium">{p.category}</span>
                      )}
                      {images.length > 0 && <span className="text-xs text-[rgba(0,0,0,0.25)]">{images.length} 张图片</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-[#F0F0F0]">
                <h2 className="font-semibold text-[rgba(0,0,0,0.85)]">{editing ? '编辑作品' : '新建作品'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-[#F5F5F5] rounded"><X className="w-5 h-5 text-[rgba(0,0,0,0.45)]" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">标题 *</label>
                  <input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F5F5] rounded-lg border border-[#E8E8E8] text-sm focus:outline-none focus:border-[#00B578]" placeholder="作品标题" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">描述</label>
                  <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3} className="w-full px-3 py-2.5 bg-[#F5F5F5] rounded-lg border border-[#E8E8E8] text-sm focus:outline-none focus:border-[#00B578] resize-none" placeholder="作品描述" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">分类</label>
                  <input value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F5F5] rounded-lg border border-[#E8E8E8] text-sm focus:outline-none focus:border-[#00B578]" placeholder="如：品牌设计、UI设计" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">链接</label>
                  <input value={form.link} onChange={e => setForm(prev => ({ ...prev, link: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#F5F5F5] rounded-lg border border-[#E8E8E8] text-sm focus:outline-none focus:border-[#00B578]" placeholder="项目链接" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">封面图</label>
                  <div className="flex items-center gap-3">
                    {form.coverUrl && <img src={form.coverUrl} alt="cover" className="w-16 h-16 rounded-lg object-cover" />}
                    <label className="flex items-center gap-2 px-3 py-2 bg-[#F5F5F5] rounded-lg border border-[#E8E8E8] cursor-pointer hover:bg-[#EDEDED] text-sm text-[rgba(0,0,0,0.65)]">
                      <ImageIcon className="w-4 h-4" /> {uploading ? '上传中...' : '上传封面'}
                      <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">作品图片</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20">
                        <img src={img} alt="" className="w-full h-full rounded-lg object-cover" />
                        <button onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }))}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4D4F] text-white rounded-full flex items-center justify-center text-xs">×</button>
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 px-3 py-2 bg-[#F5F5F5] rounded-lg border border-[#E8E8E8] cursor-pointer hover:bg-[#EDEDED] text-sm text-[rgba(0,0,0,0.65)]">
                    <Plus className="w-4 h-4" /> {uploading ? '上传中...' : '添加图片'}
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-[#F0F0F0]">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[rgba(0,0,0,0.65)] hover:bg-[#F5F5F5] rounded-lg">取消</button>
                <button onClick={save} disabled={!form.title.trim() || saving}
                  className="px-6 py-2 bg-[#00B578] text-white text-sm font-medium rounded-lg hover:bg-[#009A63] disabled:opacity-40">
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
