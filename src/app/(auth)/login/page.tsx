'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(data.error || '登录失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const handleFeishuLogin = () => {
    window.location.href = '/api/auth/feishu'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F8F0] via-white to-[#F0F9F4] px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00B578]/5 rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00B578]/5 rounded-full" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#00B578] to-[#009A63] rounded-2xl shadow-lg shadow-[#00B578]/20 mb-4">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[rgba(0,0,0,0.85)]">设计师接单平台</h1>
          <p className="text-[rgba(0,0,0,0.45)] mt-1">登录你的账户</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E8E8] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-8">
          {/* Feishu login */}
          <button
            onClick={handleFeishuLogin}
            className="w-full flex items-center justify-center gap-3 py-3 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.5 9.5C5.5 5.5 9.5 3 14 3c5 0 9 3.5 9 8s-4 8-9 8c-1.5 0-3-.3-4.3-.9L6 20.5c-.3.2-.7 0-.7-.4l.5-3.5C3.5 14.5 2 12 3.5 9.5z"/>
            </svg>
            飞书账号登录
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#E8E8E8]" />
            <span className="text-xs text-[rgba(0,0,0,0.25)]">或使用邮箱登录</span>
            <div className="flex-1 h-px bg-[#E8E8E8]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-[#FFF2F0] border border-[#FFCCC7] rounded-lg text-sm text-[#FF4D4F]">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">邮箱</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="请输入邮箱地址" required
                className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-md text-sm placeholder:text-[rgba(0,0,0,0.25)] focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">密码</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入密码" required
                  className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-md text-sm placeholder:text-[rgba(0,0,0,0.25)] focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 transition-colors pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(0,0,0,0.45)]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[#00B578] text-white rounded-md font-medium hover:bg-[#009A63] disabled:opacity-50 transition-colors shadow-sm">
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-[rgba(0,0,0,0.45)]">还没有账户？</span>
            <Link href="/register" className="text-sm text-[#00B578] hover:text-[#009A63] ml-1">立即注册</Link>
          </div>
        </div>

        <p className="text-center text-xs text-[rgba(0,0,0,0.25)] mt-6">© 2026 设计师接单平台 · 保留所有权利</p>
      </div>
    </div>
  )
}
