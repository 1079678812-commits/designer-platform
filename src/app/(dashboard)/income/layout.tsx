import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '收入统计',
  description: '收入趋势分析和分类统计',
}

export default function IncomeLayout({ children }: { children: React.ReactNode }) {
  return children
}
