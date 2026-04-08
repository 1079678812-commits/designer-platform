'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { User, Bell, Shield, Palette, Save, Camera } from 'lucide-react'

export default function SettingsPage() {
  const { user, loading: authLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState({ name: '', email: '', title: '', bio: '' })
  const [notify, setNotify] = useState({ order: true, message: true, payment: true, system: true })
  const [theme, setTheme] = useState('blue')

  useEffect(() => {
    if (user) {
      setProfile({ name: user?.name || '', email: user?.email || '', title: '高级设计师', bio: '' })
    }
  }, [user])

  const saveProfile = async () => {
    setLoading(true); setMessage('')
    try {
      const res = await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) })
      if (res.ok) { setMessage('✅ 保存成功') } else { setMessage('❌ 保存失败') }
    } catch { setMessage('❌ 网络错误') } finally { setLoading(false) }
  }

  const handleLogout = () => { logout() }

  if (authLoading) return (<div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>)

  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'security', label: '安全设置', icon: Shield },
    { id: 'preferences', label: '偏好设置', icon: Palette },
  ]

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">设置</h1>
          <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">管理你的账户设置和偏好</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left menu */}
          <div className="md:w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-[#E8E8E8] p-2 space-y-1">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-[#E8F8F0] text-[#00B578]' : 'text-[rgba(0,0,0,0.45)] hover:bg-[#F5F5F5]'}`}>
                  <tab.icon className="w-4 h-4" />{tab.label}
                </button>
              ))}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#FF4D4F] hover:bg-[#FFF2F0] transition-colors">
                退出登录
              </button>
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1 max-w-2xl">
            {message && <div className="mb-4 p-3 bg-[#F5F5F5] rounded-lg text-sm">{message}</div>}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl border border-[#E8E8E8] p-5 md:p-6">
                <h2 className="text-lg font-semibold text-[rgba(0,0,0,0.85)] mb-6">个人资料</h2>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#00B578] to-[#009A63] rounded-full flex items-center justify-center text-white text-2xl font-bold">{profile.name?.[0] || '?'}</div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-[#D9D9D9] rounded-lg text-sm text-[rgba(0,0,0,0.45)] hover:bg-[#F5F5F5]"><Camera className="w-4 h-4" /> 修改头像</button>
                </div>
                <div className="space-y-5">
                  <div><label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">姓名</label><input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 text-sm" /></div>
                  <div><label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">邮箱</label><input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 text-sm" /></div>
                  <div><label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">职称</label><input type="text" value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })} className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 text-sm" placeholder="如：高级UI/UX设计师" /></div>
                  <div><label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">个人简介</label><textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 text-sm resize-none" /></div>
                  <button onClick={saveProfile} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] disabled:opacity-50"><Save className="w-4 h-4" /> {loading ? '保存中...' : '保存修改'}</button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl border border-[#E8E8E8] p-5 md:p-6">
                <h2 className="text-lg font-semibold text-[rgba(0,0,0,0.85)] mb-6">通知设置</h2>
                <div className="space-y-4">
                  {[
                    { key: 'order', label: '订单通知', desc: '新订单、状态变更时通知' },
                    { key: 'message', label: '消息通知', desc: '收到新消息时通知' },
                    { key: 'payment', label: '支付通知', desc: '付款、收款时通知' },
                    { key: 'system', label: '系统通知', desc: '系统公告、更新时通知' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-[#F0F0F0] last:border-0">
                      <div><p className="font-medium text-[rgba(0,0,0,0.85)]">{item.label}</p><p className="text-sm text-[rgba(0,0,0,0.45)]">{item.desc}</p></div>
                      <button onClick={() => setNotify({ ...notify, [item.key]: !notify[item.key as keyof typeof notify] })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${notify[item.key as keyof typeof notify] ? 'bg-[#00B578]' : 'bg-[#D9D9D9]'}`}>
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notify[item.key as keyof typeof notify] ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-xl border border-[#E8E8E8] p-5 md:p-6">
                <h2 className="text-lg font-semibold text-[rgba(0,0,0,0.85)] mb-6">安全设置</h2>
                <div className="space-y-5">
                  <div><label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">当前密码</label><input type="password" placeholder="请输入当前密码" className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 text-sm" /></div>
                  <div><label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">新密码</label><input type="password" placeholder="请输入新密码" className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 text-sm" /></div>
                  <div><label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">确认新密码</label><input type="password" placeholder="再次输入新密码" className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 text-sm" /></div>
                  <button className="px-6 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63]">修改密码</button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-white rounded-xl border border-[#E8E8E8] p-5 md:p-6">
                <h2 className="text-lg font-semibold text-[rgba(0,0,0,0.85)] mb-6">偏好设置</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-2">主题色</label>
                    <div className="flex gap-3">
                      {[{ key: 'blue', color: 'bg-[#00B578]' }, { key: 'purple', color: 'bg-[#722ED1]' }, { key: 'green', color: 'bg-[#52C41A]' }].map(t => (
                        <button key={t.key} onClick={() => setTheme(t.key)} className={`w-10 h-10 rounded-full ${t.color} ${theme === t.key ? 'ring-4 ring-offset-2 ring-[#00B578]/30' : ''}`} />
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#F0F0F0]">
                    <p className="text-sm text-[rgba(0,0,0,0.45)]">登录邮箱：{user?.email}</p>
                    <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">用户角色：设计师</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
