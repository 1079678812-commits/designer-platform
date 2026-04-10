'use client'

import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Wrench, Plus, Search } from 'lucide-react'

interface ToolApp {
  id: string
  name: string
  description: string
  icon: string
  href: string
  status: 'active' | 'coming' | 'beta'
}

const tools: ToolApp[] = [
  // 后续在这里添加小应用
]

export default function ToolsPage() {
  const { user, loading: authLoading } = useAuth()

  if (authLoading) return (
    <div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>
  )

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">提效工具</h1>
          <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">小应用集合，让你的工作更高效</p>
        </div>

        {tools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {tools.map(tool => (
              <a
                key={tool.id}
                href={tool.href}
                className="bg-white rounded-xl border border-[#E8E8E8] p-5 hover:border-[#00B578]/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E8F8F0] flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-[#00B578] group-hover:text-white transition-colors">
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[rgba(0,0,0,0.85)] text-sm">{tool.name}</h3>
                      {tool.status === 'beta' && <span className="px-1.5 py-0.5 bg-[#FFFBE6] text-[#FAAD14] text-[10px] rounded font-medium">Beta</span>}
                      {tool.status === 'coming' && <span className="px-1.5 py-0.5 bg-[#F5F5F5] text-[rgba(0,0,0,0.25)] text-[10px] rounded font-medium">即将上线</span>}
                    </div>
                    <p className="text-xs text-[rgba(0,0,0,0.45)] line-clamp-2">{tool.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 bg-[#E8F8F0] rounded-2xl flex items-center justify-center mb-6">
              <Wrench className="w-10 h-10 text-[#00B578]" />
            </div>
            <h3 className="text-lg font-medium text-[rgba(0,0,0,0.85)] mb-2">提效工具箱</h3>
            <p className="text-sm text-[rgba(0,0,0,0.45)] text-center max-w-md">这里将汇集各种实用小应用，帮你自动化重复工作、快速生成内容、简化流程。敬请期待！</p>
          </div>
        )}
      </div>
    </div>
  )
}
