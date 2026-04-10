import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '订单管理',
  description: '管理设计订单，跟踪项目进度和费用',
}

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children
}
