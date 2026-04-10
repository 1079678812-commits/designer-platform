import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '我的服务',
  description: '管理设计服务项目，展示专业能力',
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
