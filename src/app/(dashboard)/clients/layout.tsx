import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '客户管理',
  description: '管理客户信息和公司资料',
}

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return children
}
