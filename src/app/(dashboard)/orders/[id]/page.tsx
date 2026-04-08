'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import Sidebar from '@/components/Sidebar'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, MessageSquare, Send, FileText, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'

interface TimelineItem { time: string; event: string; detail: string; type: string }

const typeIcons: Record<string, any> = {
  create: AlertCircle, status: CheckCircle, contract: FileText,
  payment: DollarSign, progress: Clock,
}
const typeColors: Record<string, string> = {
  create: '#00B578', status: '#1890FF', contract: '#FAAD14',
  payment: '#52C41A', progress: '#722ED1',
}

export default function OrderDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchOrder() }, [user])

  const fetchOrder = async () => {
    try {
      const [orderRes, timelineRes] = await Promise.all([
        fetch(`/api/orders/${orderId}`),
        fetch(`/api/orders/${orderId}/timeline`),
      ])
      if (orderRes.ok) setOrder((await orderRes.json()))
      if (timelineRes.ok) setTimeline((await timelineRes.json()).timeline || [])
    } catch {} finally { setLoading(false) }
  }

  const handleComment = async () => {
    if (!comment.trim()) return
    try {
      await fetch(`/api/orders/${orderId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      })
      setComment('')
    } catch {}
  }

  if (authLoading || loading) return (
    <div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>
  )

  if (!order) return (
    <div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><p className="text-[rgba(0,0,0,0.45)]">订单不存在</p></div></div>
  )

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[rgba(0,0,0,0.45)] hover:text-[#00B578] mb-4">
          <ArrowLeft className="w-4 h-4" />返回订单列表
        </button>

        {/* Order header */}
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-[rgba(0,0,0,0.85)]">{order.title}</h1>
              <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">{order.orderNo} · {order.client?.name || '-'}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#00B578]">¥{order.amount?.toLocaleString()}</p>
              <p className="text-sm text-[rgba(0,0,0,0.45)]">进度 {order.progress}%</p>
            </div>
          </div>
          <div className="mt-4 w-full h-2 bg-[#F0F0F0] rounded-full">
            <div className="h-2 bg-[#00B578] rounded-full transition-all" style={{ width: `${order.progress}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E8E8E8] p-6">
            <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-[#00B578]" />订单动态</h3>
            {timeline.length > 0 ? (
              <div className="space-y-0">
                {timeline.map((item, i) => {
                  const Icon = typeIcons[item.type] || AlertCircle
                  const color = typeColors[item.type] || '#8C8C8C'
                  return (
                    <div key={i} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        {i < timeline.length - 1 && <div className="w-px flex-1 bg-[#E8E8E8] mt-1" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[rgba(0,0,0,0.85)]">{item.event}</p>
                        <p className="text-sm text-[rgba(0,0,0,0.45)] mt-0.5">{item.detail}</p>
                        <p className="text-xs text-[rgba(0,0,0,0.25)] mt-1">{new Date(item.time).toLocaleString('zh-CN')}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-[rgba(0,0,0,0.45)] text-center py-8">暂无动态</p>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl border border-[#E8E8E8] p-6">
            <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#00B578]" />协作留言</h3>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              <div className="p-3 bg-[#F5F5F5] rounded-lg">
                <p className="text-sm text-[rgba(0,0,0,0.45)]">留言功能已就绪，在此添加项目相关讨论</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="输入留言..."
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                className="flex-1 px-3 py-2 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578]" />
              <button onClick={handleComment} className="p-2 bg-[#00B578] text-white rounded-lg hover:bg-[#009A63]">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
