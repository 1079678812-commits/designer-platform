'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Send, ArrowLeft, MessageCircle, Bell, Check, Trash2, FileText, DollarSign } from 'lucide-react'

interface Conversation {
  partner: { id: string; name: string; email: string; avatar: string | null }
  lastMessage: { id: string; content: string; createdAt: string; senderId: string } | null
  unreadCount: number
}

interface ChatMessage {
  id: string; content: string; createdAt: string; senderId: string; receiverId: string; read: boolean
}

interface Notification {
  id: string; title: string; content: string; type: string; read: boolean; createdAt: string
}

const notifTypeConfig: Record<string, { label: string; color: string; icon: any }> = {
  system: { label: '系统', color: 'bg-[#00B578]', icon: Bell },
  order: { label: '订单', color: 'bg-[#00B578]', icon: FileText },
  message: { label: '消息', color: 'bg-[#722ED1]', icon: MessageCircle },
  payment: { label: '支付', color: 'bg-[#FAAD14]', icon: DollarSign },
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 172800000) return '昨天'
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function notifLink(type: string): string | null {
  if (type === 'order') return '/orders'
  if (type === 'message') return '/messages'
  if (type === 'payment') return '/income'
  return null
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const [tab, setTab] = useState<'chats' | 'notifications'>('chats')

  // Chat state
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedPartner, setSelectedPartner] = useState<Conversation['partner'] | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifFilter, setNotifFilter] = useState('all')
  const [notifLoading, setNotifLoading] = useState(false)

  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchData() }, [user])

  const fetchData = async () => {
    try {
      const [msgRes, notifRes] = await Promise.all([
        fetch('/api/messages'),
        fetch('/api/notifications'),
      ])
      if (msgRes.ok) { const data = await msgRes.json(); setConversations(Array.isArray(data) ? data : data.conversations || []) }
      if (notifRes.ok) { const data = await notifRes.json(); setNotifications(Array.isArray(data) ? data : data.notifications || []) }
    } catch {} finally { setLoading(false) }
  }

  // Chat functions
  const fetchMessages = async (partnerId: string) => {
    try {
      const res = await fetch(`/api/messages?partnerId=${partnerId}`)
      if (res.ok) { const data = await res.json(); setMessages(Array.isArray(data) ? data : data.messages || []) }
    } catch {}
  }

  const selectConversation = (conv: Conversation) => {
    setSelectedPartner(conv.partner)
    fetchMessages(conv.partner.id)
    setConversations(prev => prev.map(c => c.partner.id === conv.partner.id ? { ...c, unreadCount: 0 } : c))
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: selectedPartner.id, content: newMessage.trim() }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages(prev => [...prev, msg])
        setNewMessage('')
        setConversations(prev => prev.map(c =>
          c.partner.id === selectedPartner.id
            ? { ...c, lastMessage: { id: msg.id, content: msg.content, createdAt: msg.createdAt, senderId: msg.senderId } }
            : c
        ))
      }
    } catch {} finally { setSending(false) }
  }

  // Notification functions
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

  const deleteNotif = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch {}
  }

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  if (authLoading || loading) return (
    <div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>
  )

  const chatUnread = conversations.reduce((s, c) => s + c.unreadCount, 0)
  const notifUnread = notifications.filter(n => !n.read).length

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const filteredNotifs = notifFilter === 'all' ? notifications :
    notifFilter === 'unread' ? notifications.filter(n => !n.read) :
    notifications.filter(n => n.type === notifFilter)

  // === Left panel: tab bar + content ===
  const leftPanel = (
    <div className="flex flex-col h-full">
      {/* Header with tabs */}
      <div className="p-4 md:p-6 border-b border-[#F0F0F0]">
        <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">消息中心</h1>
        <div className="flex gap-1 mt-3 bg-[#F5F5F5] rounded-lg p-1">
          <button onClick={() => setTab('chats')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'chats' ? 'bg-white text-[#00B578] shadow-sm' : 'text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.65)]'}`}>
            <MessageCircle className="w-4 h-4" />
            会话
            {chatUnread > 0 && <span className="px-1.5 py-0.5 bg-[#FF4D4F] text-white text-xs rounded-full min-w-[18px] text-center">{chatUnread}</span>}
          </button>
          <button onClick={() => setTab('notifications')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'notifications' ? 'bg-white text-[#00B578] shadow-sm' : 'text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.65)]'}`}>
            <Bell className="w-4 h-4" />
            通知
            {notifUnread > 0 && <span className="px-1.5 py-0.5 bg-[#FF4D4F] text-white text-xs rounded-full min-w-[18px] text-center">{notifUnread}</span>}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'chats' ? (
          // Conversations list
          conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <MessageCircle className="w-12 h-12 text-[rgba(0,0,0,0.1)] mb-4" />
              <p className="text-sm text-[rgba(0,0,0,0.45)]">暂无会话</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div key={conv.partner.id}
                onClick={() => selectConversation(conv)}
                className={`flex items-center gap-3 p-4 cursor-pointer border-b border-[#F0F0F0] hover:bg-[#FAFAFA] transition-colors ${selectedPartner?.id === conv.partner.id ? 'bg-[#E8F8F0]' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-[#00B578] to-[#009A63] rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                  {conv.partner.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[rgba(0,0,0,0.85)] truncate">{conv.partner.name}</span>
                    {conv.lastMessage && <span className="text-xs text-[rgba(0,0,0,0.25)]">{formatTime(conv.lastMessage.createdAt)}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm text-[rgba(0,0,0,0.45)] truncate">{conv.lastMessage?.content || '暂无消息'}</p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-[#FF4D4F] text-white text-xs rounded-full min-w-[18px] text-center flex-shrink-0">{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          // Notifications list
          <>
            {notifUnread > 0 && (
              <div className="px-4 pt-3 pb-1 flex justify-end">
                <button onClick={markAllRead} className="text-xs text-[#00B578] hover:text-[#009A63] flex items-center gap-1">
                  <Check className="w-3 h-3" /> 全部已读
                </button>
              </div>
            )}
            <div className="flex gap-1.5 px-4 py-2 overflow-x-auto">
              {['all', 'unread', 'order', 'message', 'payment', 'system'].map(f => (
                <button key={f} onClick={() => setNotifFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${notifFilter === f ? 'bg-[#00B578] text-white' : 'bg-[#F5F5F5] text-[rgba(0,0,0,0.45)]'}`}>
                  {{ all: '全部', unread: '未读', order: '订单', message: '消息', payment: '支付', system: '系统' }[f]}
                </button>
              ))}
            </div>
            {filteredNotifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Bell className="w-12 h-12 text-[rgba(0,0,0,0.1)] mb-4" />
                <p className="text-sm text-[rgba(0,0,0,0.45)]">暂无通知</p>
              </div>
            ) : (
              filteredNotifs.map(n => {
                const t = notifTypeConfig[n.type] || notifTypeConfig.system
                const Icon = t.icon
                const link = notifLink(n.type)
                return (
                  <div key={n.id}
                    onClick={() => { if (!n.read) markRead(n.id) }}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-[#F0F0F0] hover:bg-[#FAFAFA] transition-colors group ${!n.read ? 'bg-[#FAFAFA]' : ''}`}>
                    <div className={`w-8 h-8 ${t.color} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm ${!n.read ? 'font-medium text-[rgba(0,0,0,0.85)]' : 'text-[rgba(0,0,0,0.65)]'}`}>{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 bg-[#00B578] rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-[rgba(0,0,0,0.45)] mt-0.5 line-clamp-2">{n.content}</p>
                      <p className="text-xs text-[rgba(0,0,0,0.25)] mt-1">{relativeTime(n.createdAt)}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteNotif(n.id) }}
                      className="p-1.5 text-[rgba(0,0,0,0.25)] hover:text-[#FF4D4F] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </>
        )}
      </div>
    </div>
  )

  // === Right panel: chat area ===
  const chatArea = tab === 'chats' && selectedPartner ? (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-[#F0F0F0] bg-white">
        <button onClick={() => setSelectedPartner(null)} className="md:hidden p-1">
          <ArrowLeft className="w-5 h-5 text-[rgba(0,0,0,0.65)]" />
        </button>
        <div className="w-8 h-8 bg-gradient-to-br from-[#00B578] to-[#009A63] rounded-full flex items-center justify-center text-white text-sm font-medium">
          {selectedPartner.name?.[0]}
        </div>
        <span className="font-medium text-[rgba(0,0,0,0.85)]">{selectedPartner.name}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA]">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-[rgba(0,0,0,0.45)] text-sm">开始对话吧</div>
        ) : (
          messages.map(msg => {
            const isMine = msg.senderId === user?.id
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMine ? 'bg-[#00B578] text-white rounded-br-md' : 'bg-white text-[rgba(0,0,0,0.85)] border border-[#E8E8E8] rounded-bl-md'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-white/60' : 'text-[rgba(0,0,0,0.25)]'}`}>{formatTime(msg.createdAt)}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2.5 bg-[#F5F5F5] rounded-xl border border-[#E8E8E8] text-sm focus:outline-none focus:border-[#00B578]"
          />
          <button onClick={sendMessage} disabled={!newMessage.trim() || sending}
            className="p-2.5 bg-[#00B578] text-white rounded-xl hover:bg-[#009A63] disabled:opacity-40 disabled:cursor-not-allowed">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  ) : tab === 'chats' ? (
    <div className="hidden md:flex flex-col items-center justify-center flex-1 bg-[#FAFAFA]">
      <MessageCircle className="w-16 h-16 text-[rgba(0,0,0,0.1)] mb-4" />
      <p className="text-[rgba(0,0,0,0.45)]">选择一个会话开始聊天</p>
    </div>
  ) : (
    <div className="hidden md:flex flex-col items-center justify-center flex-1 bg-[#FAFAFA]">
      <Bell className="w-16 h-16 text-[rgba(0,0,0,0.1)] mb-4" />
      <p className="text-[rgba(0,0,0,0.45)]">在左侧查看通知详情</p>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-full md:w-80 lg:w-96 bg-white border-r border-[#F0F0F0] flex-shrink-0 flex flex-col h-screen">
          {leftPanel}
        </div>
        <div className={`flex-1 flex flex-col h-screen ${tab === 'notifications' ? 'hidden md:flex' : ''}`}>
          {chatArea}
        </div>
      </div>
    </div>
  )
}
