'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Wrench, Plus, ExternalLink, Edit, Trash2, X } from 'lucide-react'

interface ToolApp {
  id: string
  name: string
  description: string
  url: string
}

const DEFAULT_TOOLS: ToolApp[] = [
  { id: 'vcg', name: '视觉中国', description: '正版创意图片、视频素材库', url: 'https://www.vcg.com/' },
  { id: 'zcool', name: '站酷', description: '设计师作品分享与灵感社区', url: 'https://www.zcool.com.cn/' },
  { id: 'unsplash', name: 'Unsplash', description: '免费高质量照片素材库', url: 'https://unsplash.com/' },
  { id: 'jimeng', name: '即梦AI', description: 'AI 图片与视频生成工具', url: 'https://jimeng.jianying.com/' },
  { id: 'iconfont', name: '图标库', description: '阿里巴巴矢量图标资源平台', url: 'https://www.iconfont.cn/' },
]

const STORAGE_KEY = 'designer_tools'

function getFaviconUrl(url: string): string {
  try {
    const u = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`
  } catch {
    return ''
  }
}

export default function ToolsPage() {
  const { user, loading: authLoading } = useAuth()
  const [tools, setTools] = useState<ToolApp[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', url: '' })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    let existing: ToolApp[] = []
    if (saved) {
      try { existing = JSON.parse(saved) } catch { existing = [] }
    }
    // Merge: add new default tools that don't exist yet (by id)
    const existingIds = new Set(existing.map(t => t.id))
    const merged = [...DEFAULT_TOOLS.filter(t => !existingIds.has(t.id)), ...existing]
    setTools(merged)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  }, [])

  const saveTools = (newTools: ToolApp[]) => {
    setTools(newTools)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTools))
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.url.trim()) return alert('请填写名称和网址')
    if (editingId) {
      saveTools(tools.map(t => t.id === editingId ? { ...t, ...form } : t))
    } else {
      saveTools([...tools, { id: `tool_${Date.now()}`, ...form }])
    }
    setShowModal(false)
    setEditingId(null)
    setForm({ name: '', description: '', url: '' })
  }

  const handleEdit = (tool: ToolApp) => {
    setEditingId(tool.id)
    setForm({ name: tool.name, description: tool.description, url: tool.url })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm('确定删除该工具？')) return
    saveTools(tools.filter(t => t.id !== id))
  }

  const handleOpen = (url: string) => {
    window.open(url, '_blank')
  }

  if (authLoading) return (
    <div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>
  )

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">提效工具</h1>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">常用工具和应用，一键直达</p>
          </div>
          <button
            onClick={() => { setEditingId(null); setForm({ name: '', description: '', url: '' }); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" /> 添加工具
          </button>
        </div>

        {tools.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {tools.map(tool => {
              const favicon = getFaviconUrl(tool.url)
              return (
                <div
                  key={tool.id}
                  className="bg-white rounded-xl border border-[#E8E8E8] p-5 hover:border-[#00B578]/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all group relative"
                >
                  <div className="flex items-start gap-4">
                    <div
                      onClick={() => handleOpen(tool.url)}
                      className="w-12 h-12 rounded-xl bg-white border border-[#E8E8E8] flex items-center justify-center flex-shrink-0 cursor-pointer group-hover:border-[#00B578]/30 group-hover:bg-[#E8F8F0] transition-colors overflow-hidden"
                    >
                      {favicon ? (
                        <img src={favicon} alt="" className="w-7 h-7 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-lg font-bold text-[rgba(0,0,0,0.15)]">${tool.name[0]}</span>` }} />
                      ) : (
                        <span className="text-lg font-bold text-[rgba(0,0,0,0.15)]">{tool.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[rgba(0,0,0,0.85)] text-sm mb-1">{tool.name}</h3>
                      <p className="text-xs text-[rgba(0,0,0,0.45)] line-clamp-2 mb-2">{tool.description}</p>
                      <button
                        onClick={() => handleOpen(tool.url)}
                        className="inline-flex items-center gap-1 text-xs text-[#00B578] hover:text-[#009A63] font-medium"
                      >
                        <ExternalLink className="w-3 h-3" /> 打开
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(tool)} className="p-1.5 hover:bg-[#F5F5F5] rounded-lg text-[rgba(0,0,0,0.35)] hover:text-[rgba(0,0,0,0.65)]"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(tool.id)} className="p-1.5 hover:bg-[#FFF2F0] rounded-lg text-[#FF4D4F]/50 hover:text-[#FF4D4F]"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 bg-[#E8F8F0] rounded-2xl flex items-center justify-center mb-6">
              <Wrench className="w-10 h-10 text-[#00B578]" />
            </div>
            <h3 className="text-lg font-medium text-[rgba(0,0,0,0.85)] mb-2">提效工具箱</h3>
            <p className="text-sm text-[rgba(0,0,0,0.45)]">点击右上角「添加工具」开始吧</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-[rgba(0,0,0,0.85)]">{editingId ? '编辑工具' : '添加工具'}</h2>
              <button onClick={() => { setShowModal(false); setEditingId(null) }} className="p-1 hover:bg-[#F5F5F5] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {/* Preview */}
              {form.url && (
                <div className="flex items-center gap-3 p-3 bg-[#FAFAFA] rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#E8E8E8] flex items-center justify-center overflow-hidden">
                    <img src={getFaviconUrl(form.url)} alt="" className="w-6 h-6 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[rgba(0,0,0,0.85)] truncate">{form.name || '工具名称'}</p>
                    <p className="text-xs text-[rgba(0,0,0,0.35)] truncate">{form.url}</p>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1">名称 *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="如：Dribbble" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1">网址 *</label>
                <input type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://dribbble.com" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1">描述</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="简短描述用途" className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditingId(null) }} className="px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm hover:bg-[#F5F5F5]">取消</button>
              <button onClick={handleSave} className="px-4 py-2.5 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63]">{editingId ? '保存' : '添加'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
