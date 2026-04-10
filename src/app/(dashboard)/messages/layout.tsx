import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '消息中心',
  description: '会话消息和通知管理',
}

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return children
}
