'use client'

import { useState, useEffect } from 'react'
import { Megaphone, X } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  priority: number
}

const typeStyles: Record<string, { bg: string; border: string; icon: string }> = {
  notice: { bg: 'bg-[#E6F7FF]', border: 'border-[#91D5FF]', icon: 'text-[#1890FF]' },
  maintenance: { bg: 'bg-[#FFFBE6]', border: 'border-[#FFE58F]', icon: 'text-[#FAAD14]' },
  update: { bg: 'bg-[#F6FFED]', border: 'border-[#B7EB8F]', icon: 'text-[#52C41A]' },
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load dismissed from localStorage
    try {
      const saved = localStorage.getItem('dismissed_announcements')
      if (saved) setDismissed(new Set(JSON.parse(saved)))
    } catch {}

    fetch('/api/announcements')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.announcements) setAnnouncements(d.announcements) })
      .catch(() => {})
  }, [])

  const dismiss = (id: string) => {
    const newDismissed = new Set(dismissed)
    newDismissed.add(id)
    setDismissed(newDismissed)
    try { localStorage.setItem('dismissed_announcements', JSON.stringify([...newDismissed])) } catch {}
  }

  const visible = announcements.filter(a => !dismissed.has(a.id))

  if (visible.length === 0) return null

  return (
    <div className="space-y-2">
      {visible.map(a => {
        const style = typeStyles[a.type] || typeStyles.notice
        return (
          <div key={a.id} className={`${style.bg} border ${style.border} rounded-lg px-4 py-3 flex items-center gap-3`}>
            <Megaphone className={`w-4 h-4 flex-shrink-0 ${style.icon}`} />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm text-[rgba(0,0,0,0.85)]">{a.title}</span>
              {a.content && <span className="text-sm text-[rgba(0,0,0,0.45)] ml-2">{a.content}</span>}
            </div>
            <button onClick={() => dismiss(a.id)} className="p-1 hover:bg-black/5 rounded flex-shrink-0">
              <X className="w-3.5 h-3.5 text-[rgba(0,0,0,0.45)]" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
