import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '在家平台 - 专业设计师服务管理',
    template: '%s | 在家平台',
  },
  description: '在家平台 — 专业设计师的服务管理工具，轻松管理客户、订单、合同和发票，提升设计业务效率',
  keywords: ['设计师', '接单', '设计服务', '项目管理', '设计师平台', '在家办公', '自由设计师', '设计接单', '合同管理', '发票管理'],
  authors: [{ name: '在家平台', url: 'https://zaijia.me' }],
  creator: '在家平台',
  publisher: '在家平台',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://zaijia.me',
    siteName: '在家平台',
    title: '在家平台 - 专业设计师服务管理',
    description: '专业设计师的服务管理工具，轻松管理客户、订单、合同和发票',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '在家平台' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '在家平台 - 专业设计师服务管理',
    description: '专业设计师的服务管理工具',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: 'https://zaijia.me' },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: '在家平台',
              description: '专业设计师的服务管理工具',
              url: 'https://zaijia.me',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'CNY',
              },
              author: {
                '@type': 'Organization',
                name: '在家平台',
                url: 'https://zaijia.me',
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
