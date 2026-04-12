'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, BookOpen } from 'lucide-react'

interface HelpArticle {
  id: string
  title: string
  category: string
  content: string
  sortOrder: number
  published: boolean
  createdAt: string
  updatedAt: string
}

const categoryLabels: Record<string, string> = {
  '新手指南': '🚀 新手指南',
  '订单管理': '📋 订单管理',
  '账户设置': '⚙️ 账户设置',
  '常见问题': '❓ 常见问题',
  '其他': '📌 其他',
}

const categoryOrder = ['新手指南', '订单管理', '账户设置', '常见问题', '其他']

export default function HelpPage() {
  const [articles, setArticles] = useState<HelpArticle[]>([])
  const [selected, setSelected] = useState<HelpArticle | null>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')

  useEffect(() => {
    fetch('/api/help')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.articles) setArticles(d.articles) })
      .catch(() => {})
  }, [])

  // Filter published articles
  const published = articles.filter(a => a.published)

  // Filter by search
  const filtered = published.filter(a => {
    const matchSearch = !search || a.title.includes(search) || a.content.includes(search)
    const matchCategory = !activeCategory || a.category === activeCategory
    return matchSearch && matchCategory
  })

  // Group by category
  const grouped = categoryOrder.reduce<Record<string, HelpArticle[]>>((acc, cat) => {
    acc[cat] = filtered.filter(a => a.category === cat)
    return acc
  }, {})

  // Simple markdown rendering
  const renderMarkdown = (md: string) => {
    return md
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-[rgba(0,0,0,0.85)] mt-6 mb-3">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-[rgba(0,0,0,0.85)] mt-8 mb-4">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-[rgba(0,0,0,0.85)] mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[rgba(0,0,0,0.85)]">$1</strong>')
      .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-[#F5F5F5] rounded text-sm font-mono text-[#00B578]">$1</code>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-[rgba(0,0,0,0.65)]">• $1</li>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
  }

  if (selected) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
            <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-[rgba(0,0,0,0.45)] hover:text-[#00B578]">
              <ArrowLeft className="w-4 h-4" />返回帮助中心
            </button>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <article className="bg-white p-8 rounded-xl border border-[#E8E8E8]">
            <div className="mb-6">
              <span className="px-2 py-1 bg-[#E6F7FF] text-[#1890FF] rounded text-xs">{selected.category}</span>
              <h1 className="text-2xl font-bold text-[rgba(0,0,0,0.85)] mt-3">{selected.title}</h1>
              <p className="text-sm text-[rgba(0,0,0,0.45)] mt-2">更新于 {new Date(selected.updatedAt).toLocaleDateString('zh-CN')}</p>
            </div>
            <div className="prose max-w-none text-[rgba(0,0,0,0.65)] leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.content) }} />
          </article>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-white border-b border-[#E8E8E8]">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <BookOpen className="w-12 h-12 text-[#00B578] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[rgba(0,0,0,0.85)]">帮助中心</h1>
          <p className="text-[rgba(0,0,0,0.45)] mt-2">查找常见问题的解答和使用指南</p>
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.45)]" />
            <input type="text" placeholder="搜索帮助文章..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#D9D9D9] rounded-xl text-sm focus:outline-none focus:border-[#00B578]" />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setActiveCategory('')}
            className={`px-4 py-2 rounded-lg text-sm ${!activeCategory ? 'bg-[#00B578] text-white' : 'bg-white text-[rgba(0,0,0,0.45)] border border-[#E8E8E8] hover:bg-[#FAFAFA]'}`}>
            全部
          </button>
          {categoryOrder.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
              className={`px-4 py-2 rounded-lg text-sm ${activeCategory === cat ? 'bg-[#00B578] text-white' : 'bg-white text-[rgba(0,0,0,0.45)] border border-[#E8E8E8] hover:bg-[#FAFAFA]'}`}>
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Articles by category */}
        {categoryOrder.map(cat => {
          const catArticles = grouped[cat]
          if (!catArticles || catArticles.length === 0) return null
          return (
            <div key={cat} className="mb-8">
              <h2 className="text-lg font-semibold text-[rgba(0,0,0,0.85)] mb-4">{categoryLabels[cat]}</h2>
              <div className="space-y-3">
                {catArticles.map(a => (
                  <button key={a.id} onClick={() => setSelected(a)}
                    className="w-full bg-white p-5 rounded-xl border border-[#E8E8E8] text-left hover:border-[#00B578] transition-colors">
                    <h3 className="font-medium text-[rgba(0,0,0,0.85)]">{a.title}</h3>
                    <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1 line-clamp-2">{a.content.slice(0, 120).replace(/[#*`]/g, '')}...</p>
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-[rgba(0,0,0,0.15)] mx-auto mb-3" />
            <p className="text-[rgba(0,0,0,0.45)]">{search ? '未找到匹配的帮助文章' : '暂无帮助文章'}</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/login" className="text-sm text-[#00B578] hover:text-[#009A63]">← 返回登录</Link>
        </div>
      </div>
    </div>
  )
}
