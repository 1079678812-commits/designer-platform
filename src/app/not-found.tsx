import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="text-center">
        <FileQuestion className="w-16 h-16 text-[rgba(0,0,0,0.15)] mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-[rgba(0,0,0,0.15)] mb-2">404</h1>
        <p className="text-lg text-[rgba(0,0,0,0.45)] mb-6">页面不存在</p>
        <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00B578] text-white rounded-lg hover:bg-[#009A63]">
          <Home className="w-4 h-4" />返回首页
        </Link>
      </div>
    </div>
  )
}
