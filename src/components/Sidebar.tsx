'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Briefcase, Users, FileText, Settings,
  Bell, HelpCircle, LogOut, Receipt, FileSignature,
  Menu, X, Shield, MessageCircle, Wallet, Palette
} from 'lucide-react'
import { useAuth } from '@/lib/useAuth'

const Kanban = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <rect x="7" y="7" width="3" height="10" />
    <rect x="14" y="7" width="3" height="7" />
  </svg>
)

const ToolBox = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7" />
    <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
    <path d="M12 3v3" />
    <path d="M9 15l3-3 3 3" />
    <path d="M9 18l3-3 3 3" />
  </svg>
)

const menuItems = [
  { icon: LayoutDashboard, label: '仪表盘', href: '/dashboard' },
  { icon: Briefcase, label: '我的服务', href: '/services' },
  { icon: Users, label: '客户管理', href: '/clients' },
  { icon: FileText, label: '订单管理', href: '/orders' },
  { icon: Kanban, label: '项目管理', href: '/kanban' },
  { icon: FileSignature, label: '合同管理', href: '/contracts' },
  { icon: Receipt, label: '发票管理', href: '/invoices' },
  { icon: Wallet, label: '收入与数据', href: '/income' },
  { icon: ToolBox, label: '提效工具', href: '/tools' },
  { icon: Bell, label: '消息中心', href: '/messages' },
  { icon: Palette, label: '作品集', href: '/works' },
  { icon: Settings, label: '设置', href: '/settings' },
]

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { user, logout } = useAuth(false)

  const handleLogout = () => {
    logout()
    if (onNavigate) onNavigate()
  }

  const adminItems = user?.role === 'admin' ? [{ icon: Shield, label: '管理后台', href: '/admin' }] : []
  const allItems = [...menuItems, ...adminItems]

  return (
    <>
      <div className="p-6 border-b border-[#F0F0F0]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00B578] to-[#009A63] rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-[rgba(0,0,0,0.85)]">设计师平台</span>
          </div>
          {onNavigate && (
            <button onClick={onNavigate} className="p-1 hover:bg-[#FAFAFA] rounded-lg">
              <X className="w-5 h-5 text-[rgba(0,0,0,0.45)]" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-3">
          {(user as any)?.avatar ? (
            <img src={(user as any).avatar} alt="" className="w-10 h-10 rounded-full object-contain border border-[#E8E8E8] p-0.5 bg-[#FAFAFA]" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-[#00B578] to-[#009A63] rounded-full flex items-center justify-center text-white font-medium">
              {user?.name?.[0] || 'D'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[rgba(0,0,0,0.85)] truncate">{user?.name || '设计师'}</p>
            <p className="text-sm text-[rgba(0,0,0,0.45)] truncate">{(user as any)?.title || '设计师'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {allItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#E8F8F0] text-[#00B578] font-medium'
                  : 'text-[rgba(0,0,0,0.65)] hover:bg-[#FAFAFA] hover:text-[rgba(0,0,0,0.85)]'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#F0F0F0] space-y-2">
        <button className="flex items-center gap-3 px-4 py-3 text-[rgba(0,0,0,0.65)] hover:bg-[#FAFAFA] rounded-lg w-full">
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          <span>帮助中心</span>
        </button>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-[#FF4D4F] hover:bg-[#FFF2F0] rounded-lg w-full">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>退出登录</span>
        </button>
      </div>
    </>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-[#E8E8E8] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.06)] active:bg-[#FAFAFA]"
      >
        <Menu className="w-5 h-5 text-[rgba(0,0,0,0.85)]" />
      </button>

      <div className="hidden md:flex flex-col h-screen bg-white border-r border-[#F0F0F0] w-64 flex-shrink-0">
        <NavContent />
      </div>

      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
          <div className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-[0_6px_16px_rgba(0,0,0,0.08)] flex flex-col">
            <NavContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}
