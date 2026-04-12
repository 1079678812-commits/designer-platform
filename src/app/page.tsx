'use client'

import Link from 'next/link'
import { Briefcase, LayoutDashboard, FileText, BarChart3, Shield } from 'lucide-react'
import { useBranding } from '@/lib/useBranding'

export default function Home() {
  const { siteName, logoUrl, themeColor } = useBranding()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[#F0F0F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-[#00B578] to-[#009A63] rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="font-bold text-lg text-[rgba(0,0,0,0.85)]">{siteName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-[rgba(0,0,0,0.65)] hover:text-[#00B578] transition-colors">
              登录
            </Link>
            <Link href="/register" className="px-4 py-2 bg-[#00B578] text-white rounded-md text-sm font-medium hover:bg-[#009A63] transition-colors">
              免费注册
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8F8F0]/60 via-transparent to-[#F0F9F4]/60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[rgba(0,0,0,0.85)] leading-tight">
              展示才华<br className="sm:hidden" />连接无限可能
            </h1>
            <p className="mt-6 text-lg md:text-xl text-[rgba(0,0,0,0.45)] max-w-2xl mx-auto">
              专业的设计师服务管理平台，从项目管理到合同发票，一站式搞定你的设计业务
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="px-8 py-3 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] transition-colors shadow-lg shadow-[#00B578]/20">
                免费开始使用
              </Link>
              <Link href="/login" className="px-8 py-3 border border-[#D9D9D9] text-[rgba(0,0,0,0.65)] rounded-lg font-medium hover:border-[#00B578] hover:text-[#00B578] transition-colors">
                已有账户，登录
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[rgba(0,0,0,0.85)]">一站式设计业务管理</h2>
            <p className="mt-4 text-[rgba(0,0,0,0.45)]">从接单到交付，覆盖设计业务全流程</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: LayoutDashboard, title: '项目看板', desc: '可视化看板管理项目进度，一目了然' },
              { icon: FileText, title: '合同发票', desc: '专业合同与发票管理，保障交易安全' },
              { icon: BarChart3, title: '数据分析', desc: '深度业务洞察，驱动决策优化' },
              { icon: Shield, title: '安全可靠', desc: '数据加密存储，权限精细管控' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E8E8E8] p-6 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow">
                <div className="w-12 h-12 bg-[#E8F8F0] rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-[#00B578]" />
                </div>
                <h3 className="text-lg font-semibold text-[rgba(0,0,0,0.85)] mb-2">{f.title}</h3>
                <p className="text-sm text-[rgba(0,0,0,0.45)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-[#00B578] to-[#009A63] rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">准备好开始了吗？</h2>
            <p className="text-white/80 mb-8">免费注册，立即体验专业设计业务管理</p>
            <Link href="/register" className="inline-block px-8 py-3 bg-white text-[#00B578] rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg">
              立即注册
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#F0F0F0] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-[rgba(0,0,0,0.45)]">
          © 2026 {siteName} · 保留所有权利
        </div>
      </footer>
    </div>
  )
}
