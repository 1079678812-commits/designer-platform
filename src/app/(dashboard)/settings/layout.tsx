import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '系统设置',
  description: '个人资料和账户设置',
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
