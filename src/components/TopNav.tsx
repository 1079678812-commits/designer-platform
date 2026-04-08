'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Briefcase, LayoutDashboard, Users, FileText, Settings, Bell, BarChart3, Receipt, FileSignature, Menu, Home, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  { icon: Home, label: '首页', href: '/' },
  { icon: LayoutDashboard, label: '仪表盘', href: '/dashboard' },
  { icon: Briefcase, label: '我的服务', href: '/services' },
  { icon: Users, label: '客户管理', href: '/clients' },
  { icon: FileText, label: '订单管理', href: '/orders' },
  { icon: FileSignature, label: '项目管理', href: '/kanban' },
  { icon: Receipt, label: '合同管理', href: '/contracts' },
  { icon: FileSignature, label: '发票管理', href: '/invoices' },
  { icon: BarChart3, label: '数据分析', href: '/analytics' },
  { icon: Bell, label: '消息通知', href: '/notifications' },
  { icon: Settings, label: '设置', href: '/settings' },
]

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('userName')
      if (name) setUserName(name)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    router.push('/login')
  }

  return (
    <>
      <div className="hidden md:block bg-white border-b border-[#F0F0F0]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00B578] to-[#009A63] rounded-lg flex items-center justify-center mr-3">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-[rgba(0,0,0,0.85)]">设计师平台</span>
              {userName && <span className="ml-4 px-3 py-1 bg-[#E8F8F0] text-[#00B578] text-sm font-medium rounded-full">{userName}</span>}
            </div>
            <div className="flex items-center space-x-1 overflow-x-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${isActive ? 'bg-[#00B578] text-white' : 'text-[rgba(0,0,0,0.45)] hover:bg-[#F5F5F5] hover:text-[rgba(0,0,0,0.85)]'}`}>
                    <item.icon className="w-4 h-4 mr-2" />{item.label}
                  </Link>
                )
              })}
            </div>
            <button onClick={handleLogout} className="flex items-center px-3 py-2 text-sm text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.85)] hover:bg-[#F5F5F5] rounded-lg">
              <LogOut className="w-4 h-4 mr-2" />退出
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden bg-white border-b border-[#F0F0F0] sticky top-0 z-50">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-[#F5F5F5] mr-2">
                <Menu className="w-5 h-5 text-[rgba(0,0,0,0.85)]" />
              </button>
              <div className="w-7 h-7 bg-gradient-to-br from-[#00B578] to-[#009A63] rounded-lg flex items-center justify-center mr-2">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-[rgba(0,0,0,0.85)]">设计师平台</span>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-[#F5F5F5]"><LogOut className="w-4 h-4 text-[rgba(0,0,0,0.45)]" /></button>
          </div>
          {mobileMenuOpen && (
            <div className="absolute top-14 left-0 right-0 bg-white border-b border-[#E8E8E8] shadow-lg z-40 max-h-[70vh] overflow-y-auto">
              <div className="py-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-medium ${isActive ? 'bg-[#E8F8F0] text-[#00B578]' : 'text-[rgba(0,0,0,0.45)] hover:bg-[#F5F5F5]'}`}>
                      <item.icon className="w-4 h-4 mr-3" />{item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
