import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '设计师接单平台 - 专业设计师服务管理',
    template: '%s | 设计师接单平台',
  },
  description: '设计师接单平台 — 专业设计师的服务管理工具，轻松管理客户、订单、合同和发票',
  keywords: ['设计师', '接单', '设计服务', '项目管理', '设计师平台'],
  authors: [{ name: '设计师接单平台' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '设计师接单平台',
    title: '设计师接单平台',
    description: '专业设计师的服务管理工具',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00B578',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
