import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '数据分析',
  description: '业务数据统计分析与趋势洞察',
}

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children
}
