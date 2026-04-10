import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '作品集',
  description: '管理设计作品展示',
}

export default function WorksLayout({ children }: { children: React.ReactNode }) {
  return children
}
