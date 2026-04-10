import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '提效工具',
  description: '小应用集合，提升工作效率',
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children
}
