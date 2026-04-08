'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-[#FF4D4F] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[rgba(0,0,0,0.85)] mb-2">出错了</h1>
        <p className="text-[rgba(0,0,0,0.45)] mb-6">服务器发生了错误，请稍后重试</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="flex items-center gap-2 px-5 py-2.5 bg-[#00B578] text-white rounded-lg hover:bg-[#009A63]">
            <RefreshCw className="w-4 h-4" />重试
          </button>
          <Link href="/" className="flex items-center gap-2 px-5 py-2.5 border border-[#D9D9D9] rounded-lg text-[rgba(0,0,0,0.65)] hover:border-[#00B578] hover:text-[#00B578]">
            <Home className="w-4 h-4" />返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
