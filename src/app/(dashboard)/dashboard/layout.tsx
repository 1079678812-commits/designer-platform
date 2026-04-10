import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '仪表盘',
  description: '设计师工作台 — 概览业务数据和最新动态',
}

export default function DashboardPageLayout({ children }: { children: React.ReactNode }) {
  return children
}
