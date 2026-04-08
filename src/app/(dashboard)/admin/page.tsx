'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import {
  LayoutDashboard, Users, FileCheck, DollarSign, AlertCircle,
  CheckCircle, XCircle, Search, Eye, ChevronLeft, ChevronRight,
  BarChart3, Shield, Activity
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  pendingReviews: number
}

interface PendingService {
  id: string
  name: string
  category: string
  price: number
  status: string
  createdAt: string
  designer: { name: string; email: string }
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  slug: string | null
  title: string | null
  createdAt: string
  _count: { services: number; orders: number }
}

type Tab = 'overview' | 'users' | 'reviews' | 'audit'

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pendingServices, setPendingServices] = useState<PendingService[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [userTotal, setUserTotal] = useState(0)
  const [userPage, setUserPage] = useState(1)
  const [userSearch, setUserSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [reviewReason, setReviewReason] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, router])

  useEffect(() => {
    if (user?.role === 'admin') fetchStats()
  }, [user])

  useEffect(() => {
    if (user?.role === 'admin' && tab === 'users') fetchUsers()
  }, [user, tab, userPage, userSearch])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setPendingServices(data.pendingServices || [])
      }
    } catch {} finally { setLoading(false) }
  }

  const fetchUsers = async () => {
    try {
      const qs = `?page=${userPage}&search=${userSearch}`
      const res = await fetch(`/api/admin/users${qs}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setUserTotal(data.total)
      }
    } catch {}
  }

  const handleReview = async (type: string, id: string, action: 'approve' | 'reject') => {
    const reason = reviewReason[id] || ''
    try {
      const res = await fetch('/api/admin/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, action, reason }),
      })
      if (res.ok) {
        if (type === 'service') {
          setPendingServices(prev => prev.filter(s => s.id !== id))
          setStats(prev => prev ? { ...prev, pendingReviews: prev.pendingReviews - 1 } : prev)
        } else {
          fetchUsers()
        }
      }
    } catch {}
  }

  if (authLoading || loading) return (
    <div className="flex min-h-screen bg-[#F5F5F5] items-center justify-center">
      <div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (user?.role !== 'admin') return null

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: '概览', icon: LayoutDashboard },
    { key: 'users', label: '用户管理', icon: Users },
    { key: 'reviews', label: '审核中心', icon: FileCheck },
    { key: 'audit', label: '操作日志', icon: Activity },
  ]

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Top bar */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#00B578]" />
            <span className="font-bold text-lg text-[rgba(0,0,0,0.85)]">平台管理后台</span>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-sm text-[rgba(0,0,0,0.45)] hover:text-[#00B578]">← 返回前台</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-[#E8E8E8] mb-6 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? 'bg-[#00B578] text-white' : 'text-[rgba(0,0,0,0.45)] hover:bg-[#F5F5F5]'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: '总用户数', value: stats.totalUsers, icon: Users, color: '#00B578' },
                { label: '总订单数', value: stats.totalOrders, icon: FileCheck, color: '#1890FF' },
                { label: '平台营收', value: `¥${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#FAAD14' },
                { label: '待审核', value: stats.pendingReviews, icon: AlertCircle, color: '#FF4D4F' },
              ].map(s => (
                <div key={s.label} className="bg-white p-5 rounded-xl border border-[#E8E8E8]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[rgba(0,0,0,0.45)]">{s.label}</span>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <p className="text-2xl font-bold text-[rgba(0,0,0,0.85)]">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Quick review section */}
            {pendingServices.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
                  <h3 className="font-semibold text-[rgba(0,0,0,0.85)]">待审核服务</h3>
                  <button onClick={() => setTab('reviews')} className="text-sm text-[#00B578] hover:text-[#009A63]">查看全部 →</button>
                </div>
                <div className="divide-y divide-[#F0F0F0]">
                  {pendingServices.slice(0, 5).map(s => (
                    <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[rgba(0,0,0,0.85)]">{s.name}</p>
                        <p className="text-sm text-[rgba(0,0,0,0.45)]">{s.designer.name} · {s.category} · ¥{s.price.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleReview('service', s.id, 'approve')} className="px-3 py-1.5 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63]">通过</button>
                        <button onClick={() => handleReview('service', s.id, 'reject')} className="px-3 py-1.5 bg-[#FF4D4F] text-white rounded-lg text-sm hover:bg-[#CF1322]">拒绝</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#E8E8E8] flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.45)]" />
                <input type="text" placeholder="搜索用户名或邮箱..." value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1) }}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578]" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#FAFAFA]">
                  <tr>
                    {['用户', '邮箱', '角色', '服务数', '订单数', '状态', '操作'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-[rgba(0,0,0,0.45)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-[#FAFAFA]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#00B578]/10 rounded-full flex items-center justify-center text-[#00B578] font-medium text-sm">{u.name[0]}</div>
                          <div><p className="font-medium text-[rgba(0,0,0,0.85)]">{u.name}</p>{u.title && <p className="text-xs text-[rgba(0,0,0,0.45)]">{u.title}</p>}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[rgba(0,0,0,0.45)]">{u.email}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#E8F8F0] text-[#00B578] rounded-full text-xs">{u.role}</span></td>
                      <td className="px-4 py-3 text-[rgba(0,0,0,0.45)]">{u._count.services}</td>
                      <td className="px-4 py-3 text-[rgba(0,0,0,0.45)]">{u._count.orders}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${u.status === 'active' ? 'bg-[#F6FFED] text-[#52C41A]' : 'bg-[#FFF2F0] text-[#FF4D4F]'}`}>{u.status === 'active' ? '正常' : '禁用'}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {u.status === 'active' ? (
                            <button onClick={() => handleReview('user', u.id, 'reject')} className="px-2 py-1 text-xs text-[#FF4D4F] hover:bg-[#FFF2F0] rounded">禁用</button>
                          ) : (
                            <button onClick={() => handleReview('user', u.id, 'approve')} className="px-2 py-1 text-xs text-[#00B578] hover:bg-[#E8F8F0] rounded">启用</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无用户</div>}
            </div>

            {/* Pagination */}
            {userTotal > 20 && (
              <div className="flex justify-center gap-2">
                <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}
                  className="p-2 rounded-lg border border-[#D9D9D9] disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                <span className="px-3 py-2 text-sm text-[rgba(0,0,0,0.45)]">第 {userPage} 页</span>
                <button onClick={() => setUserPage(p => p + 1)} disabled={userPage * 20 >= userTotal}
                  className="p-2 rounded-lg border border-[#D9D9D9] disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        {tab === 'reviews' && (
          <div className="space-y-4">
            {pendingServices.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E8E8E8] p-12 text-center">
                <CheckCircle className="w-12 h-12 text-[#52C41A] mx-auto mb-3" />
                <p className="font-medium text-[rgba(0,0,0,0.85)]">暂无待审核内容</p>
                <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">所有内容已审核完毕</p>
              </div>
            ) : pendingServices.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-[#E8E8E8] p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[rgba(0,0,0,0.85)] text-lg">{s.name}</h3>
                    <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">
                      {s.designer.name} ({s.designer.email}) · {s.category} · ¥{s.price.toLocaleString()} · {new Date(s.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-[#FFFBE6] text-[#FAAD14] rounded-full text-sm">待审核</span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="text" placeholder="拒绝原因（可选）" value={reviewReason[s.id] || ''} onChange={e => setReviewReason(prev => ({ ...prev, [s.id]: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578]" />
                  <button onClick={() => handleReview('service', s.id, 'approve')} className="px-4 py-2 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63] flex items-center gap-1"><CheckCircle className="w-4 h-4" />通过</button>
                  <button onClick={() => handleReview('service', s.id, 'reject')} className="px-4 py-2 bg-[#FF4D4F] text-white rounded-lg text-sm hover:bg-[#CF1322] flex items-center gap-1"><XCircle className="w-4 h-4" />拒绝</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Audit Log */}
        {tab === 'audit' && (
          <AuditLogTab />
        )}
      </div>
    </div>
  )
}

// Audit Log Tab Component
function AuditLogTab() {
  const [logs, setLogs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filterAction, setFilterAction] = useState('')

  useEffect(() => { fetchLogs() }, [page, filterAction])

  const fetchLogs = async () => {
    try {
      const qs = `?page=${page}&pageSize=30${filterAction ? `&action=${filterAction}` : ''}`
      const res = await fetch(`/api/admin/audit${qs}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
        setTotal(data.total)
      }
    } catch {}
  }

  const actionLabels: Record<string, string> = {
    create: '创建', update: '更新', delete: '删除', login: '登录',
    review: '审核', payment: '支付', register: '注册', logout: '退出',
  }
  const actionColors: Record<string, string> = {
    create: 'bg-[#E8F8F0] text-[#00B578]', update: 'bg-[#E6F7FF] text-[#1890FF]',
    delete: 'bg-[#FFF2F0] text-[#FF4D4F]', login: 'bg-[#F0F5FF] text-[#597EF7]',
    review: 'bg-[#F9F0FF] text-[#722ED1]', payment: 'bg-[#FFFBE6] text-[#FAAD14]',
    register: 'bg-[#E8F8F0] text-[#00B578]', logout: 'bg-[#F5F5F5] text-[#8C8C8C]',
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-[#E8E8E8] flex flex-wrap gap-2">
        {['', 'login', 'register', 'create', 'update', 'delete', 'payment', 'review'].map(a => (
          <button key={a} onClick={() => { setFilterAction(a); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm ${filterAction === a ? 'bg-[#00B578] text-white' : 'bg-[#F5F5F5] text-[rgba(0,0,0,0.45)] hover:bg-[#E8E8E8]'}`}>
            {a ? (actionLabels[a] || a) : '全部'}
          </button>
        ))}
        <span className="ml-auto text-sm text-[rgba(0,0,0,0.45)] self-center">共 {total} 条</span>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAFAFA]">
            <tr>
              {['时间', '操作', '资源', '详情', 'IP'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-[rgba(0,0,0,0.45)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {logs.map(l => (
              <tr key={l.id} className="hover:bg-[#FAFAFA]">
                <td className="px-4 py-3 text-[rgba(0,0,0,0.45)] whitespace-nowrap">{new Date(l.createdAt).toLocaleString('zh-CN')}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${actionColors[l.action] || 'bg-[#F5F5F5] text-[#8C8C8C]'}`}>{actionLabels[l.action] || l.action}</span></td>
                <td className="px-4 py-3 text-[rgba(0,0,0,0.65)]">{l.resource}{l.resourceId ? ` #${l.resourceId.slice(0, 8)}` : ''}</td>
                <td className="px-4 py-3 text-[rgba(0,0,0,0.45)] max-w-xs truncate">{l.detail || '-'}</td>
                <td className="px-4 py-3 text-[rgba(0,0,0,0.25)] font-mono text-xs">{l.ip || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <div className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无操作日志</div>}
      </div>

      {total > 30 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-[#D9D9D9] rounded-lg text-sm disabled:opacity-30">上一页</button>
          <span className="px-3 py-1.5 text-sm text-[rgba(0,0,0,0.45)]">第 {page} 页</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 30 >= total} className="px-3 py-1.5 border border-[#D9D9D9] rounded-lg text-sm disabled:opacity-30">下一页</button>
        </div>
      )}
    </div>
  )
}
