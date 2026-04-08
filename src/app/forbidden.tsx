import Link from 'next/link'
import { Shield, Home } from 'lucide-react'

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="text-center">
        <Shield className="w-16 h-16 text-[#FF4D4F] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[rgba(0,0,0,0.85)] mb-2">无权访问</h1>
        <p className="text-[rgba(0,0,0,0.45)] mb-6">你没有权限访问此页面</p>
        <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00B578] text-white rounded-lg hover:bg-[#009A63]">
          <Home className="w-4 h-4" />返回首页
        </Link>
      </div>
    </div>
  )
}
