import type { Metadata } from 'next'
import AuthGuard from '@/components/AuthGuard'

export const metadata: Metadata = {
  title: {
    default: '工作台 - 设计师接单平台',
    template: '%s | 设计师接单平台',
  },
  description: '设计师接单平台 — 管理客户、订单、合同和发票，提升设计业务效率',
  robots: {
    index: false, // Dashboard pages shouldn't be indexed
    follow: false,
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}
