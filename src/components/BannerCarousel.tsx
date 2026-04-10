'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Upload, X, Plus, ChevronLeft, ChevronRight, GripVertical, Link } from 'lucide-react'

interface Banner {
  id: string
  url: string
  link: string
  order: number
  createdAt: string
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [current, setCurrent] = useState(0)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [linkInput, setLinkInput] = useState('')
  const [showLinkModal, setShowLinkModal] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners')
      if (res.ok) {
        const data = await res.json()
        setBanners(data.banners || [])
      }
    } catch (err) { console.error(err) }
  }

  useEffect(() => { fetchBanners() }, [])

  // Auto-play
  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(prev => banners.length > 1 ? (prev + 1) % banners.length : 0)
    }, 4000)
  }, [banners.length])

  useEffect(() => {
    if (banners.length > 1 && !editing) startAutoPlay()
    else if (timerRef.current) clearInterval(timerRef.current)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [banners.length, editing, startAutoPlay])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'banner')
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) throw new Error('上传失败')
      const uploadData = await uploadRes.json()

      const bannerRes = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: uploadData.file.url }),
      })
      if (!bannerRes.ok) throw new Error('保存失败')
      await fetchBanners()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这张图片？')) return
    try {
      await fetch(`/api/banners?id=${id}`, { method: 'DELETE' })
      await fetchBanners()
      setCurrent(prev => Math.max(0, prev - 1))
    } catch (err) { console.error(err) }
  }

  const handleUpdateLink = async (id: string, link: string) => {
    try {
      await fetch('/api/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, link }),
      })
      await fetchBanners()
    } catch (err) { console.error(err) }
    setShowLinkModal(null)
  }

  const prev = () => setCurrent(c => (c - 1 + banners.length) % banners.length)
  const next = () => setCurrent(c => (c + 1) % banners.length)

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div
        className="relative w-full h-32 md:h-44 rounded-xl overflow-hidden bg-[#E8E8E8] group"
        onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current) }}
        onMouseLeave={() => { if (banners.length > 1 && !editing) startAutoPlay() }}
      >
        {banners.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-[rgba(0,0,0,0.25)]">
            <Upload className="w-8 h-8 mb-2" />
            <p className="text-sm">暂无轮播图片</p>
            <p className="text-xs mt-1">建议尺寸：1920 × 440 像素</p>
            {editing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-2 px-4 py-1.5 bg-[#00B578] text-white text-sm rounded-lg hover:bg-[#009A63] disabled:opacity-50 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {uploading ? '上传中...' : '添加图片（1920×440）'}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Images */}
            <div
              className={`flex h-full ${banners.length > 1 ? 'transition-transform duration-500 ease-in-out' : ''}`}
              style={{ transform: banners.length > 1 ? `translateX(-${current * 100}%)` : undefined }}
            >
              {banners.map(banner => (
                <a
                  key={banner.id}
                  href={editing ? undefined : (banner.link || undefined)}
                  target={banner.link ? '_blank' : undefined}
                  className="w-full h-full flex-shrink-0 relative"
                >
                  <img
                    src={banner.url}
                    alt="轮播图片"
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>

            {/* Navigation Arrows */}
            {banners.length > 1 && !editing && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-5' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}

            {/* Edit mode: delete buttons */}
            {editing && banners.map((banner, i) => (
              i === current && (
                <div key={banner.id} className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    onClick={() => { setShowLinkModal(banner.id); setLinkInput(banner.link || '') }}
                    className="w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-lg flex items-center justify-center"
                    title="设置链接"
                  >
                    <Link className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="w-7 h-7 bg-red-500/80 hover:bg-red-600 text-white rounded-lg flex items-center justify-center"
                    title="删除"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
            ))}
          </>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {/* Edit Toggle & Add Button */}
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={() => setEditing(!editing)}
          className="text-xs text-[rgba(0,0,0,0.45)] hover:text-[#00B578] transition-colors"
        >
          {editing ? '完成编辑' : '管理轮播'}
        </button>
        {editing && banners.length > 0 && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-xs text-[#00B578] hover:text-[#009A63] flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-3 h-3" />
            {uploading ? '上传中...' : '添加图片（1920×440）'}
          </button>
        )}
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowLinkModal(null)}>
          <div className="bg-white rounded-xl p-5 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-3">设置跳转链接</h3>
            <input
              type="url"
              value={linkInput}
              onChange={e => setLinkInput(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-[#00B578]"
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setShowLinkModal(null)} className="px-4 py-1.5 text-sm text-[rgba(0,0,0,0.65)] hover:bg-[#F5F5F5] rounded-lg">取消</button>
              <button onClick={() => handleUpdateLink(showLinkModal, linkInput)} className="px-4 py-1.5 text-sm bg-[#00B578] text-white rounded-lg hover:bg-[#009A63]">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
