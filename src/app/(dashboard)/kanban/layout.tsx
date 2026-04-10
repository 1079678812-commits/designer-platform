import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '项目管理',
  description: '看板视图管理项目进度',
}

export default function KanbanLayout({ children }: { children: React.ReactNode }) {
  return children
}
