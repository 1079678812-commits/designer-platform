'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Bell, CheckCircle, FileText, MessageSquare, DollarSign, Check, Trash2, ChevronDown } from 'lucide-react'

interface Notification { id: string; title: string; content: string; type: string; read: boolean; createdAt: string }

const typeConfig: Record<string, { label: string; color: string; icon: any; href: string }> = {
  system: { label: '系统', color: 'bg-[#00B578]', icon: Bell, href: '' },
  order: { label: '订单', color: 'bg-[#00B578]', icon: FileText, href: '/orders' },
  message: { label: '消息', color: 'bg-[#722ED1]', icon: MessageSquare, href: '/messages' },
  payment: { label: '支付', color: 'bg-[#FAAD14]', icon: DollarSign, href: '/income' },
}

function relativeTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 172800000) return '昨天'
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const router = useRouter()

  useEffect(() => { if (user) fetchNotifications() }, [user])

  const fetchNotifications = async (append = false) => {
    if (append) setLoadingMore(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        const items = Array.isArray(data) ? data : data.notifications || []
        if (append) {
          setNotifications(prev => [...prev, ...items.slice(prev.length, prev.length + 10)])
          setHasMore(items.length > notifications.length + 10)
        } else {
          setNotifications(items)
          setHasMore(items.length >= 50)
        }
      }
    } catch {} finally { setLoading(false); setLoadingMore(false) }
  }

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ read: true }) })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {}
  }

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      if (res.ok) setNotifications(prev => prev.filter(n => n.id !== id))
    } catch {}
  }

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) markRead(n.id)
    const config = typeConfig[n.type]
    if (config?.href) router.push(config.href)
  }

  const filtered = filter === 'all' ? notifications :
    filter === 'unread' ? notifications.filter(n => !n.read) :
    notifications.filter(n => n.type === filter)

  const unreadCount = notifications.filter(n => !n.read).length

  if (authLoading || loading) return (<div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>)

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">消息通知</h1>
              {unreadCount > 0 && <span className="px-3 py-0.5 bg-[#FF4D4F] text-white text-sm font-medium rounded-full">{unreadCount} 未读</span>}
            </div>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">查看系统消息和业务通知</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 bg-[#00B578] text-white rounded-lg text-sm font-medium hover:bg-[#009A63]">
              <Check className="w-4 h-4" /> 全部已读
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {['all', 'unread', 'order', 'message', 'payment', 'system'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${filter === f ? 'bg-[#00B578] text-white' : 'bg-white border border-[#E8E8E8] text-[rgba(0,0,0,0.45)] hover:bg-[#F5F5F5]'}`}>
              {{ all: '全部', unread: '未读', order: '订单', message: '消息', payment: '支付', system: '系统' }[f]}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(n => {
            const t = typeConfig[n.type] || typeConfig.system
            const Icon = t.icon
            return (
              <div key={n.id} onClick={() => handleNotificationClick(n)}
                className={`bg-white rounded-xl border border-[#E8E8E8] p-4 md:p-5 flex items-start gap-3 md:gap-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all cursor-pointer group ${!n.read ? 'border-l-4 border-l-[#00B578]' : 'opacity-70'}`}>
                <div className={`w-9 h-9 ${t.color} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-[rgba(0,0,0,0.85)] ${!n.read ? 'font-medium' : 'font-normal'}`}>{n.title}</h3>
                    {!n.read && <span className="w-2 h-2 bg-[#00B578] rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-[rgba(0,0,0,0.45)] line-clamp-2">{n.content}</p>
                  <p className="text-xs text-[rgba(0,0,0,0.25)] mt-2">{relativeTime(n.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${t.color} text-white hidden sm:inline`}>{t.label}</span>
                  <button onClick={(e) => deleteNotification(n.id, e)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#FFF2F0] text-[#FF4D4F] transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16"><Bell className="w-12 h-12 text-[rgba(0,0,0,0.1)] mx-auto mb-4" /><h3 className="text-base font-medium text-[rgba(0,0,0,0.85)]">暂无通知</h3><p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">所有通知都已读完</p></div>
          )}
        </div>

        {hasMore && filtered.length > 0 && (
          <div className="text-center mt-6">
            <button onClick={() => fetchNotifications(true)} disabled={loadingMore}
              className="flex items-center gap-2 mx-auto px-6 py-2 bg-white border border-[#E8E8E8] rounded-lg text-sm text-[rgba(0,0,0,0.65)] hover:bg-[#FAFAFA] disabled:opacity-50">
              <ChevronDown className={`w-4 h-4 ${loadingMore ? 'animate-spin' : ''}`} />
              {loadingMore ? '加载中...' : '加载更多'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
