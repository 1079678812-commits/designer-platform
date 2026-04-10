import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '发票管理',
  description: '管理发票开具和付款追踪',
}

export default function InvoicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
