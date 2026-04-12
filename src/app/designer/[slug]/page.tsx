import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Briefcase, Star, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const designer = await prisma.user.findUnique({ where: { slug }, select: { name: true, title: true, bio: true } })
  if (!designer) return { title: '设计师未找到' }

  // 读取品牌配置
  let platformName = '在家平台'
  try {
    const config = await prisma.platformConfig.findFirst()
    if (config?.siteName) platformName = config.siteName
  } catch {}

  const title = `${designer.name} - ${designer.title || '设计师'} | ${platformName}`
  const description = designer.bio || `${designer.name}的专业设计师主页，查看服务项目和作品集`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      siteName: '在家平台',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function DesignerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const designer = await prisma.user.findUnique({
    where: { slug },
    include: {
      services: { where: { status: 'active' }, orderBy: { orderCount: 'desc' } },
      portfolios: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!designer || designer.status !== 'active') notFound()

  // 读取品牌配置
  let siteName = '在家平台'
  let logoUrl = ''
  try {
    const config = await prisma.platformConfig.findFirst()
    if (config?.siteName) siteName = config.siteName
    if (config?.logoUrl) logoUrl = config.logoUrl
  } catch {}

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#F0F0F0]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
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
          <Link href="/login" className="text-sm text-[#00B578] hover:text-[#009A63]">登录/注册</Link>
        </div>
      </header>

      {/* Profile Hero */}
      <section className="bg-gradient-to-r from-[#00B578] to-[#009A63] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 md:w-28 md:h-28 bg-white/20 rounded-full flex items-center justify-center text-4xl md:text-5xl font-bold border-4 border-white/30">
              {designer.name[0]}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{designer.name}</h1>
              {designer.title && <p className="text-white/80 mt-1 text-lg">{designer.title}</p>}
              {designer.bio && <p className="text-white/70 mt-3 max-w-xl">{designer.bio}</p>}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <span className="flex items-center gap-1.5 text-white/80"><CheckCircle className="w-4 h-4" />已认证设计师</span>
                <span className="flex items-center gap-1.5 text-white/80"><Star className="w-4 h-4" />{designer.services.length > 0 ? (designer.services.reduce((s, sv) => s + sv.rating, 0) / designer.services.length).toFixed(1) : '暂无'} 评分</span>
                <span className="flex items-center gap-1.5 text-white/80"><Briefcase className="w-4 h-4" />{designer.services.reduce((s, sv) => s + sv.orderCount, 0)} 个订单</span>
              </div>
            </div>
            <a href={`mailto:${designer.email}`} className="flex items-center gap-2 px-6 py-3 bg-white text-[#00B578] rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg">
              <Mail className="w-4 h-4" />联系我
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-12">
        {/* Services */}
        {designer.services.length > 0 && (
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)] mb-6">我的服务</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {designer.services.map(service => {
                let tags: string[] = []
                try { tags = JSON.parse(service.tags) } catch { tags = [] }
                return (
                  <div key={service.id} className="bg-white rounded-xl border border-[#E8E8E8] p-5 md:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-[#E8F8F0] text-[#00B578] rounded-full text-xs font-medium">{service.category}</span>
                      {service.rating > 0 && <span className="flex items-center gap-1 text-xs text-[#FAAD14]"><Star className="w-3 h-3 fill-current" />{service.rating}</span>}
                    </div>
                    <h3 className="font-semibold text-[rgba(0,0,0,0.85)] text-lg mb-2">{service.name}</h3>
                    {service.description && <p className="text-sm text-[rgba(0,0,0,0.45)] mb-3 line-clamp-2">{service.description}</p>}
                    {tags.length > 0 && <div className="flex flex-wrap gap-1.5 mb-4">{tags.slice(0, 4).map(t => <span key={t} className="px-2 py-0.5 bg-[#F5F5F5] text-[rgba(0,0,0,0.45)] rounded text-xs">{t}</span>)}</div>}
                    <div className="flex items-center justify-between pt-4 border-t border-[#F0F0F0]">
                      <span className="text-xl font-bold text-[#00B578]">¥{service.price.toLocaleString()}</span>
                      <span className="text-sm text-[rgba(0,0,0,0.45)]">{service.orderCount} 人已下单</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Portfolio */}
        {designer.portfolios.length > 0 && (
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)] mb-6">作品集</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {designer.portfolios.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-[#E8F8F0] to-[#F0F9F4] flex items-center justify-center">
                    {p.coverUrl ? <img src={p.coverUrl} alt={p.title} className="w-full h-full object-cover" /> : <Briefcase className="w-12 h-12 text-[#00B578]/20" />}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[rgba(0,0,0,0.85)] mb-1">{p.title}</h3>
                    {p.description && <p className="text-sm text-[rgba(0,0,0,0.45)] line-clamp-2">{p.description}</p>}
                    {p.category && <span className="inline-block mt-2 px-2 py-0.5 bg-[#F5F5F5] text-[rgba(0,0,0,0.45)] rounded text-xs">{p.category}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {designer.services.length === 0 && designer.portfolios.length === 0 && (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-[rgba(0,0,0,0.1)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[rgba(0,0,0,0.85)]">该设计师正在完善主页</h3>
            <p className="text-sm text-[rgba(0,0,0,0.45)] mt-2">敬请期待</p>
          </div>
        )}
      </div>

      <footer className="border-t border-[#F0F0F0] py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-[rgba(0,0,0,0.45)]">© 2026 设计师接单平台 · 保留所有权利</div>
      </footer>
    </div>
  )
}
