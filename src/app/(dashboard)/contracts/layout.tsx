import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '合同管理',
  description: '管理合同签署和文件存档',
}

export default function ContractsLayout({ children }: { children: React.ReactNode }) {
  return children
}
