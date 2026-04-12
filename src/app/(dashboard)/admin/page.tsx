'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import {
  LayoutDashboard, Users, FileCheck, DollarSign, AlertCircle,
  CheckCircle, XCircle, Search, Eye, ChevronLeft, ChevronRight,
  BarChart3, Shield, Activity, GitBranch, RotateCcw, Rocket,
  Building2, Palette, BookOpen, Megaphone, Edit3, Trash2,
  Plus, Save, X, ExternalLink, UserCog, ToggleLeft, ToggleRight
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

type Tab = 'overview' | 'tenants' | 'reviews' | 'branding' | 'help' | 'announcements' | 'audit' | 'deploy'

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
    { key: 'tenants', label: '租户管理', icon: Building2 },
    { key: 'reviews', label: '审核中心', icon: FileCheck },
    { key: 'branding', label: '品牌设置', icon: Palette },
    { key: 'help', label: '帮助中心', icon: BookOpen },
    { key: 'announcements', label: '公告管理', icon: Megaphone },
    { key: 'audit', label: '操作日志', icon: Activity },
    { key: 'deploy', label: '版本管理', icon: GitBranch },
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
        {/* Tenants */}
        {tab === 'tenants' && <TenantManagerTab />}

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

        {/* Branding */}
        {tab === 'branding' && <BrandingTab />}

        {/* Help Center CMS */}
        {tab === 'help' && <HelpCenterTab />}

        {/* Announcements */}
        {tab === 'announcements' && <AnnouncementsTab />}

        {/* Audit Log */}
        {tab === 'audit' && <AuditLogTab />}

        {/* Deploy / Version Management */}
        {tab === 'deploy' && <DeployTab />}
      </div>
    </div>
  )
}

// ===== Tenant Manager Tab =====
function TenantManagerTab() {
  const [tenants, setTenants] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedTenant, setSelectedTenant] = useState<any>(null)
  const [impersonating, setImpersonating] = useState(false)

  useEffect(() => { fetchTenants() }, [page, search])

  const fetchTenants = async () => {
    try {
      const qs = `?page=${page}&pageSize=20&search=${search}`
      const res = await fetch(`/api/admin/tenants${qs}`)
      if (res.ok) {
        const data = await res.json()
        setTenants(data.tenants)
        setTotal(data.total)
      }
    } catch {}
  }

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      })
      if (res.ok) {
        fetchTenants()
        if (selectedTenant?.id === userId) {
          setSelectedTenant((prev: any) => ({ ...prev, status: newStatus }))
        }
      }
    } catch {}
  }

  const handleImpersonate = async (userId: string) => {
    if (!confirm('确认登录该租户？你将看到该租户的视图，可随时回到管理员账户。')) return
    setImpersonating(true)
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        const data = await res.json()
        // Save admin context for returning
        try {
          localStorage.setItem('impersonating_admin', JSON.stringify({
            id: data.adminUser.id,
            name: data.adminUser.name,
          }))
        } catch {}
        window.location.href = '/dashboard'
      }
    } catch {} finally { setImpersonating(false) }
  }

  const viewDetail = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/tenants/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedTenant(data.tenant)
      }
    } catch {}
  }

  // Detail modal
  if (selectedTenant) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedTenant(null)} className="text-sm text-[rgba(0,0,0,0.45)] hover:text-[#00B578] flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />返回租户列表
        </button>

        <div className="bg-white p-6 rounded-xl border border-[#E8E8E8]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#00B578]/10 rounded-full flex items-center justify-center text-[#00B578] font-bold text-xl">{selectedTenant.name[0]}</div>
              <div>
                <h2 className="text-xl font-bold text-[rgba(0,0,0,0.85)]">{selectedTenant.name}</h2>
                <p className="text-sm text-[rgba(0,0,0,0.45)]">{selectedTenant.email} · {selectedTenant.title || '设计师'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleStatus(selectedTenant.id, selectedTenant.status)}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-1 ${selectedTenant.status === 'active' ? 'bg-[#FFF2F0] text-[#FF4D4F] hover:bg-[#FFCCC7]' : 'bg-[#F6FFED] text-[#52C41A] hover:bg-[#D9F7BE]'}`}>
                {selectedTenant.status === 'active' ? <><ToggleRight className="w-4 h-4" />禁用</> : <><ToggleLeft className="w-4 h-4" />启用</>}
              </button>
              <button onClick={() => handleImpersonate(selectedTenant.id)} disabled={impersonating}
                className="px-4 py-2 bg-[#1890FF] text-white rounded-lg text-sm hover:bg-[#096DD9] flex items-center gap-1 disabled:opacity-50">
                <UserCog className="w-4 h-4" />登录租户
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-6">
            {[
              { label: '服务数', value: selectedTenant._count?.services || 0 },
              { label: '订单数', value: selectedTenant._count?.orders || 0 },
              { label: '客户数', value: selectedTenant._count?.clients || 0 },
              { label: '合同数', value: selectedTenant._count?.contracts || 0 },
              { label: '发票数', value: selectedTenant._count?.invoices || 0 },
            ].map(s => (
              <div key={s.label} className="bg-[#FAFAFA] p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-[rgba(0,0,0,0.85)]">{s.value}</p>
                <p className="text-xs text-[rgba(0,0,0,0.45)] mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {selectedTenant.services?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-3">服务列表</h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedTenant.services.map((s: any) => (
                  <div key={s.id} className="bg-[#FAFAFA] p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm text-[rgba(0,0,0,0.85)]">{s.name}</p>
                      <p className="text-xs text-[rgba(0,0,0,0.45)]">{s.category} · ¥{s.price}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${s.status === 'active' ? 'bg-[#F6FFED] text-[#52C41A]' : 'bg-[#F5F5F5] text-[#8C8C8C]'}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTenant.orders?.length > 0 && (
            <div>
              <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-3">最近订单</h3>
              <div className="space-y-2">
                {selectedTenant.orders.map((o: any) => (
                  <div key={o.id} className="bg-[#FAFAFA] p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm text-[rgba(0,0,0,0.85)]">{o.title}</p>
                      <p className="text-xs text-[rgba(0,0,0,0.45)]">{o.orderNo} · {o.client?.name || '-'} · ¥{o.amount}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      o.status === 'completed' ? 'bg-[#F6FFED] text-[#52C41A]' :
                      o.status === 'in_progress' ? 'bg-[#E6F7FF] text-[#1890FF]' :
                      o.status === 'cancelled' ? 'bg-[#FFF2F0] text-[#FF4D4F]' :
                      'bg-[#FFFBE6] text-[#FAAD14]'
                    }`}>{o.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-[#E8E8E8] flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.45)]" />
          <input type="text" placeholder="搜索租户名称或邮箱..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578]" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAFAFA]">
            <tr>
              {['名称', '邮箱', '公司', '服务', '订单', '收入', '状态', '操作'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-[rgba(0,0,0,0.45)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {tenants.map(t => (
              <tr key={t.id} className="hover:bg-[#FAFAFA]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#00B578]/10 rounded-full flex items-center justify-center text-[#00B578] font-medium text-sm">{t.name[0]}</div>
                    <span className="font-medium text-[rgba(0,0,0,0.85)]">{t.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[rgba(0,0,0,0.45)]">{t.email}</td>
                <td className="px-4 py-3 text-[rgba(0,0,0,0.45)]">{t.company || '-'}</td>
                <td className="px-4 py-3 text-[rgba(0,0,0,0.45)]">{t._count?.services || 0}</td>
                <td className="px-4 py-3 text-[rgba(0,0,0,0.45)]">{t._count?.orders || 0}</td>
                <td className="px-4 py-3 text-[rgba(0,0,0,0.65)] font-medium">¥{(t.revenue || 0).toLocaleString()}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${t.status === 'active' ? 'bg-[#F6FFED] text-[#52C41A]' : 'bg-[#FFF2F0] text-[#FF4D4F]'}`}>{t.status === 'active' ? '正常' : '已暂停'}</span></td>
                <td className="px-4 py-3 text-[rgba(0,0,0,0.45)] whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString('zh-CN')}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => viewDetail(t.id)} className="px-2 py-1 text-xs text-[#1890FF] hover:bg-[#E6F7FF] rounded flex items-center gap-1"><Eye className="w-3 h-3" />详情</button>
                    <button onClick={() => toggleStatus(t.id, t.status)}
                      className={`px-2 py-1 text-xs rounded ${t.status === 'active' ? 'text-[#FF4D4F] hover:bg-[#FFF2F0]' : 'text-[#52C41A] hover:bg-[#F6FFED]'}`}>
                      {t.status === 'active' ? '暂停' : '启用'}
                    </button>
                    <button onClick={() => handleImpersonate(t.id)} disabled={impersonating}
                      className="px-2 py-1 text-xs text-[#722ED1] hover:bg-[#F9F0FF] rounded flex items-center gap-1 disabled:opacity-50"><ExternalLink className="w-3 h-3" />登录租户</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tenants.length === 0 && <div className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无租户</div>}
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-[#D9D9D9] rounded-lg text-sm disabled:opacity-30">上一页</button>
          <span className="px-3 py-1.5 text-sm text-[rgba(0,0,0,0.45)]">第 {page} 页</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="px-3 py-1.5 border border-[#D9D9D9] rounded-lg text-sm disabled:opacity-30">下一页</button>
        </div>
      )}
    </div>
  )
}

// ===== Branding Tab =====
function BrandingTab() {
  const [config, setConfig] = useState({ siteName: '', logoUrl: '', themeColor: '#00B578' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/branding').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.config) setConfig({ siteName: d.config.siteName, logoUrl: d.config.logoUrl || '', themeColor: d.config.themeColor })
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {} finally { setSaving(false) }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return alert('图片大小不能超过5MB')
    if (!file.type.startsWith('image/')) return alert('请上传图片文件')

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'logo')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setConfig(p => ({ ...p, logoUrl: data.url || data.fileUrl || '' }))
      } else {
        alert('上传失败')
      }
    } catch { alert('上传失败') } finally { setUploading(false) }
  }

  const handleRemoveLogo = () => {
    setConfig(p => ({ ...p, logoUrl: '' }))
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white p-6 rounded-xl border border-[#E8E8E8] space-y-5">
        <h3 className="font-semibold text-[rgba(0,0,0,0.85)] text-lg">品牌设置</h3>

        <div>
          <label className="block text-sm font-medium text-[rgba(0,0,0,0.65)] mb-1.5">平台名称</label>
          <input type="text" value={config.siteName} onChange={e => setConfig(p => ({ ...p, siteName: e.target.value }))}
            className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578]" placeholder="设计师平台" />
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgba(0,0,0,0.65)] mb-1.5">平台 Logo</label>
          <div className="flex items-start gap-4">
            <div className="relative group">
              {config.logoUrl ? (
                <div className="relative w-[160px] h-[160px] rounded-xl border-2 border-[#E8E8E8] overflow-hidden bg-[#FAFAFA]">
                  <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain p-3" />
                  <button onClick={handleRemoveLogo}
                    className="absolute top-1 right-1 w-6 h-6 bg-[rgba(0,0,0,0.5)] text-white rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.7)] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="w-[160px] h-[160px] rounded-xl border-2 border-dashed border-[#D9D9D9] bg-[#FAFAFA] flex flex-col items-center justify-center cursor-pointer hover:border-[#00B578] hover:bg-[#E8F8F0]/30 transition-colors">
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  {uploading ? (
                    <span className="w-6 h-6 border-2 border-[#00B578] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-8 h-8 text-[#D9D9D9] mb-1" />
                      <span className="text-xs text-[rgba(0,0,0,0.25)]">上传 Logo</span>
                    </>
                  )}
                </label>
              )}
            </div>
            <div className="flex-1 pt-2">
              <p className="text-sm text-[rgba(0,0,0,0.45)] mb-3">建议上传 400×400 像素的 PNG 或 SVG 图片，作为平台 Logo 显示在导航栏和登录页。</p>
              {config.logoUrl && (
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D9D9D9] rounded-lg text-sm text-[rgba(0,0,0,0.65)] hover:bg-[#FAFAFA] cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  替换图片
                </label>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgba(0,0,0,0.65)] mb-1.5">主题色</label>
          <div className="flex gap-3 items-center">
            <input type="color" value={config.themeColor} onChange={e => setConfig(p => ({ ...p, themeColor: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-[#D9D9D9] cursor-pointer" />
            <input type="text" value={config.themeColor} onChange={e => setConfig(p => ({ ...p, themeColor: e.target.value }))}
              className="flex-1 px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578] font-mono" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63] disabled:opacity-50 flex items-center gap-2">
            {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />保存中...</> : <><Save className="w-4 h-4" />保存设置</>}
          </button>
          {saved && <span className="text-sm text-[#52C41A]">✓ 已保存，全站即时生效</span>}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white p-6 rounded-xl border border-[#E8E8E8]">
        <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-4">效果预览</h3>
        <div className="bg-[#F5F5F5] p-4 rounded-lg">
          <div className="bg-white p-4 rounded-lg border border-[#E8E8E8] flex items-center gap-3">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="" className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: config.themeColor }}>D</div>
            )}
            <span className="font-bold text-lg text-[rgba(0,0,0,0.85)]">{config.siteName || '设计师平台'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== Help Center CMS Tab =====
function HelpCenterTab() {
  const [articles, setArticles] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', category: '其他', content: '', sortOrder: 0, published: false })

  useEffect(() => { fetchArticles() }, [])

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/admin/help')
      if (res.ok) { const data = await res.json(); setArticles(data.articles) }
    } catch {}
  }

  const openNew = () => {
    setEditing(null)
    setForm({ title: '', category: '其他', content: '', sortOrder: 0, published: false })
    setShowForm(true)
  }

  const openEdit = (article: any) => {
    setEditing(article)
    setForm({ title: article.title, category: article.category, content: article.content, sortOrder: article.sortOrder, published: article.published })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.content) return alert('标题和内容不能为空')
    try {
      const url = editing ? '/api/admin/help' : '/api/admin/help'
      const method = editing ? 'PUT' : 'POST'
      const body = editing ? { id: editing.id, ...form } : form
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { setShowForm(false); fetchArticles() }
    } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此文章？')) return
    try {
      const res = await fetch(`/api/admin/help?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchArticles()
    } catch {}
  }

  const categories = ['新手指南', '订单管理', '账户设置', '常见问题', '其他']

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-[rgba(0,0,0,0.85)]">帮助文章管理</h3>
        <button onClick={openNew} className="px-4 py-2 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63] flex items-center gap-1"><Plus className="w-4 h-4" />新建文章</button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-[#E8E8E8] space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-[rgba(0,0,0,0.85)]">{editing ? '编辑文章' : '新建文章'}</h4>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-[#F5F5F5] rounded"><X className="w-4 h-4" /></button>
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgba(0,0,0,0.65)] mb-1.5">标题</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578]" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.65)] mb-1.5">分类</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578] bg-white">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.65)] mb-1.5">排序</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgba(0,0,0,0.65)] mb-1.5">内容（Markdown）</label>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578] min-h-[200px] font-mono" placeholder="支持 Markdown 格式" />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[rgba(0,0,0,0.65)]">
              <input type="checkbox" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))}
                className="w-4 h-4 text-[#00B578] rounded border-[#D9D9D9]" />
              发布
            </label>
            <button onClick={handleSave} className="px-4 py-2 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63] flex items-center gap-1"><Save className="w-4 h-4" />保存</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAFAFA]">
            <tr>
              {['标题', '分类', '排序', '状态', '更新时间', '操作'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-[rgba(0,0,0,0.45)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {articles.map(a => (
              <tr key={a.id} className="hover:bg-[#FAFAFA]">
                <td className="px-4 py-3 font-medium text-[rgba(0,0,0,0.85)]">{a.title}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#E6F7FF] text-[#1890FF] rounded-full text-xs">{a.category}</span></td>
                <td className="px-4 py-3 text-[rgba(0,0,0,0.45)]">{a.sortOrder}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${a.published ? 'bg-[#F6FFED] text-[#52C41A]' : 'bg-[#F5F5F5] text-[#8C8C8C]'}`}>{a.published ? '已发布' : '草稿'}</span></td>
                <td className="px-4 py-3 text-[rgba(0,0,0,0.45)] whitespace-nowrap">{new Date(a.updatedAt).toLocaleDateString('zh-CN')}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(a)} className="px-2 py-1 text-xs text-[#1890FF] hover:bg-[#E6F7FF] rounded flex items-center gap-1"><Edit3 className="w-3 h-3" />编辑</button>
                    <button onClick={() => handleDelete(a.id)} className="px-2 py-1 text-xs text-[#FF4D4F] hover:bg-[#FFF2F0] rounded flex items-center gap-1"><Trash2 className="w-3 h-3" />删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && <div className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无帮助文章</div>}
      </div>
    </div>
  )
}

// ===== Announcements Tab =====
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ title: '', content: '', type: 'notice', priority: 0, active: true, startAt: '', endAt: '' })

  useEffect(() => { fetchAnnouncements() }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements')
      if (res.ok) { const data = await res.json(); setAnnouncements(data.announcements) }
    } catch {}
  }

  const openNew = () => {
    setEditing(null)
    setForm({ title: '', content: '', type: 'notice', priority: 0, active: true, startAt: '', endAt: '' })
    setShowForm(true)
  }

  const openEdit = (a: any) => {
    setEditing(a)
    setForm({
      title: a.title, content: a.content, type: a.type, priority: a.priority, active: a.active,
      startAt: a.startAt ? new Date(a.startAt).toISOString().slice(0, 16) : '',
      endAt: a.endAt ? new Date(a.endAt).toISOString().slice(0, 16) : '',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.content) return alert('标题和内容不能为空')
    try {
      const method = editing ? 'PUT' : 'POST'
      const body: any = editing ? { id: editing.id, ...form } : form
      if (!form.startAt) body.startAt = null
      if (!form.endAt) body.endAt = null
      const res = await fetch('/api/admin/announcements', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { setShowForm(false); fetchAnnouncements() }
    } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此公告？')) return
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchAnnouncements()
    } catch {}
  }

  const typeLabels: Record<string, { label: string; color: string }> = {
    notice: { label: '通知', color: 'bg-[#E6F7FF] text-[#1890FF]' },
    maintenance: { label: '维护', color: 'bg-[#FFFBE6] text-[#FAAD14]' },
    update: { label: '更新', color: 'bg-[#F6FFED] text-[#52C41A]' },
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-[rgba(0,0,0,0.85)]">公告管理</h3>
        <button onClick={openNew} className="px-4 py-2 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63] flex items-center gap-1"><Plus className="w-4 h-4" />新建公告</button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-[#E8E8E8] space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-[rgba(0,0,0,0.85)]">{editing ? '编辑公告' : '新建公告'}</h4>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-[#F5F5F5] rounded"><X className="w-4 h-4" /></button>
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgba(0,0,0,0.65)] mb-1.5">标题</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgba(0,0,0,0.65)] mb-1.5">内容</label>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578] min-h-[100px]" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.65)] mb-1.5">类型</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578] bg-white">
                <option value="notice">通知</option>
                <option value="maintenance">维护</option>
                <option value="update">更新</option>
              </select>
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.65)] mb-1.5">优先级</label>
              <input type="number" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578]" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.65)] mb-1.5">生效开始时间</label>
              <input type="datetime-local" value={form.startAt} onChange={e => setForm(p => ({ ...p, startAt: e.target.value }))}
                className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578]" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.65)] mb-1.5">生效结束时间</label>
              <input type="datetime-local" value={form.endAt} onChange={e => setForm(p => ({ ...p, endAt: e.target.value }))}
                className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#00B578]" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[rgba(0,0,0,0.65)]">
              <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
                className="w-4 h-4 text-[#00B578] rounded border-[#D9D9D9]" />
              启用
            </label>
            <button onClick={handleSave} className="px-4 py-2 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63] flex items-center gap-1"><Save className="w-4 h-4" />保存</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAFAFA]">
            <tr>
              {['标题', '类型', '优先级', '状态', '生效时间', '操作'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-[rgba(0,0,0,0.45)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {announcements.map(a => {
              const tl = typeLabels[a.type] || typeLabels.notice
              return (
                <tr key={a.id} className="hover:bg-[#FAFAFA]">
                  <td className="px-4 py-3 font-medium text-[rgba(0,0,0,0.85)]">{a.title}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${tl.color}`}>{tl.label}</span></td>
                  <td className="px-4 py-3 text-[rgba(0,0,0,0.45)]">{a.priority}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${a.active ? 'bg-[#F6FFED] text-[#52C41A]' : 'bg-[#F5F5F5] text-[#8C8C8C]'}`}>{a.active ? '启用' : '禁用'}</span></td>
                  <td className="px-4 py-3 text-[rgba(0,0,0,0.45)] text-xs whitespace-nowrap">
                    {a.startAt ? new Date(a.startAt).toLocaleDateString('zh-CN') : '不限'} ~ {a.endAt ? new Date(a.endAt).toLocaleDateString('zh-CN') : '不限'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(a)} className="px-2 py-1 text-xs text-[#1890FF] hover:bg-[#E6F7FF] rounded flex items-center gap-1"><Edit3 className="w-3 h-3" />编辑</button>
                      <button onClick={() => handleDelete(a.id)} className="px-2 py-1 text-xs text-[#FF4D4F] hover:bg-[#FFF2F0] rounded flex items-center gap-1"><Trash2 className="w-3 h-3" />删除</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {announcements.length === 0 && <div className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无公告</div>}
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

// Deploy / Version Management Tab
function DeployTab() {
  const [logs, setLogs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [currentHash, setCurrentHash] = useState('')
  const [currentMsg, setCurrentMsg] = useState('')
  const [rollingBack, setRollingBack] = useState<string | null>(null)
  const [confirmHash, setConfirmHash] = useState<string | null>(null)
  const [result, setResult] = useState<{ success: boolean; msg: string } | null>(null)

  useEffect(() => { fetchDeploys() }, [page])

  const fetchDeploys = async () => {
    try {
      const res = await fetch(`/api/admin/deploy?page=${page}&pageSize=20`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
        setTotal(data.total)
        setCurrentHash(data.currentHash || '')
        setCurrentMsg(data.currentMsg || '')
      }
    } catch {}
  }

  const handleRollback = async (commitHash: string) => {
    setRollingBack(commitHash)
    setResult(null)
    try {
      const res = await fetch('/api/admin/deploy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitHash }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setResult({ success: true, msg: `已回滚到 ${commitHash}` })
        fetchDeploys()
      } else {
        setResult({ success: false, msg: data.error || data.detail || '回滚失败' })
      }
    } catch (err: any) {
      setResult({ success: false, msg: err.message || '回滚失败' })
    } finally {
      setRollingBack(null)
      setConfirmHash(null)
    }
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    success: { label: '部署成功', color: 'bg-[#E8F8F0] text-[#00B578]' },
    failed: { label: '部署失败', color: 'bg-[#FFF2F0] text-[#FF4D4F]' },
    rolled_back: { label: '已回滚', color: 'bg-[#FFFBE6] text-[#FAAD14]' },
  }

  return (
    <div className="space-y-4">
      {/* 当前版本信息 */}
      <div className="bg-white p-5 rounded-xl border border-[#E8E8E8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8F8F0] rounded-xl flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-[#00B578]" />
            </div>
            <div>
              <p className="font-semibold text-[rgba(0,0,0,0.85)]">当前线上版本</p>
              <p className="text-sm text-[rgba(0,0,0,0.45)] mt-0.5">
                <code className="px-1.5 py-0.5 bg-[#F5F5F5] rounded text-xs font-mono">{currentHash || '未知'}</code>
                {currentMsg && <span className="ml-2">{currentMsg}</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 操作结果提示 */}
      {result && (
        <div className={`p-4 rounded-xl border ${result.success ? 'bg-[#F6FFED] border-[#B7EB8F] text-[#52C41A]' : 'bg-[#FFF2F0] border-[#FFCCC7] text-[#FF4D4F]'}`}>
          {result.msg}
        </div>
      )}

      {/* 回滚确认弹窗 */}
      {confirmHash && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setConfirmHash(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FFFBE6] rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[#FAAD14]" />
              </div>
              <div>
                <p className="font-semibold text-[rgba(0,0,0,0.85)]">确认回滚</p>
                <p className="text-sm text-[rgba(0,0,0,0.45)]">此操作将把线上代码回退到此版本</p>
              </div>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl p-4 mb-4">
              <p className="text-sm text-[rgba(0,0,0,0.45)]">目标版本</p>
              <code className="text-sm font-mono text-[rgba(0,0,0,0.85)]">{confirmHash}</code>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmHash(null)} className="px-4 py-2.5 border border-[#D9D9D9] rounded-xl text-sm hover:bg-[#F5F5F5]">取消</button>
              <button onClick={() => handleRollback(confirmHash)} disabled={!!rollingBack}
                className="px-4 py-2.5 bg-[#FF4D4F] text-white rounded-xl text-sm hover:bg-[#CF1322] disabled:opacity-50 flex items-center gap-2">
                {rollingBack ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />回滚中...</> : <><RotateCcw className="w-4 h-4" />确认回滚</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 部署历史 */}
      <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h3 className="font-semibold text-[rgba(0,0,0,0.85)]">部署历史</h3>
          <span className="text-sm text-[rgba(0,0,0,0.45)]">共 {total} 次部署</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#FAFAFA]">
            <tr>
              {['时间', '版本', '提交信息', '部署人', '状态', '操作'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-[rgba(0,0,0,0.45)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {logs.map(l => {
              const st = statusLabels[l.status] || statusLabels.success
              const isCurrent = l.commitHash === currentHash
              return (
                <tr key={l.id} className={`hover:bg-[#FAFAFA] ${isCurrent ? 'bg-[#E8F8F0]/30' : ''}`}>
                  <td className="px-4 py-3 text-[rgba(0,0,0,0.45)] whitespace-nowrap text-xs">{new Date(l.createdAt).toLocaleString('zh-CN')}</td>
                  <td className="px-4 py-3">
                    <code className="px-1.5 py-0.5 bg-[#F5F5F5] rounded text-xs font-mono">{l.commitHash.slice(0, 8)}</code>
                    {isCurrent && <span className="ml-1.5 px-1.5 py-0.5 bg-[#00B578] text-white rounded text-[10px]">当前</span>}
                  </td>
                  <td className="px-4 py-3 text-[rgba(0,0,0,0.65)] max-w-xs truncate">{l.commitMsg}</td>
                  <td className="px-4 py-3 text-[rgba(0,0,0,0.45)]">{l.deployedBy || '-'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${st.color}`}>{st.label}</span></td>
                  <td className="px-4 py-3">
                    {!isCurrent && (
                      <button onClick={() => setConfirmHash(l.commitHash)} disabled={!!rollingBack}
                        className="px-2.5 py-1 text-xs text-[#FAAD14] hover:bg-[#FFFBE6] rounded-lg flex items-center gap-1 disabled:opacity-30">
                        <RotateCcw className="w-3.5 h-3.5" />回退
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="text-center py-12 text-[rgba(0,0,0,0.45)]">
            <Rocket className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>暂无部署记录</p>
            <p className="text-xs mt-1">每次部署会自动记录到这里</p>
          </div>
        )}
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-[#D9D9D9] rounded-lg text-sm disabled:opacity-30">上一页</button>
          <span className="px-3 py-1.5 text-sm text-[rgba(0,0,0,0.45)]">第 {page} 页</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="px-3 py-1.5 border border-[#D9D9D9] rounded-lg text-sm disabled:opacity-30">下一页</button>
        </div>
      )}
    </div>
  )
}
