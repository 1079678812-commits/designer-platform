'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    match: password === confirmPassword && confirmPassword.length > 0,
  }

  const allValid = checks.length && checks.upper && checks.lower && checks.number && checks.match

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allValid) { setError('请满足密码要求'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(data.error || '注册失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const CheckItem = ({ ok, text }: { ok: boolean; text: string }) => (
    <div className={`flex items-center gap-1.5 text-xs ${ok ? 'text-[#52C41A]' : 'text-[rgba(0,0,0,0.25)]'}`}>
      {ok ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{text}
    </div>
  )

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
          <h1 className="text-2xl font-bold text-[rgba(0,0,0,0.85)]">创建账户</h1>
          <p className="text-[rgba(0,0,0,0.45)] mt-1">开始你的设计师之旅</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E8E8] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-[#FFF2F0] border border-[#FFCCC7] rounded-lg text-sm text-[#FF4D4F]">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">姓名</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="你的姓名或品牌名" required
                className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-md text-sm placeholder:text-[rgba(0,0,0,0.25)] focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">邮箱</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
                className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-md text-sm placeholder:text-[rgba(0,0,0,0.25)] focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">密码</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="至少8位" required
                  className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-md text-sm placeholder:text-[rgba(0,0,0,0.25)] focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(0,0,0,0.45)]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                  <CheckItem ok={checks.length} text="至少8位" />
                  <CheckItem ok={checks.upper} text="包含大写字母" />
                  <CheckItem ok={checks.lower} text="包含小写字母" />
                  <CheckItem ok={checks.number} text="包含数字" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">确认密码</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="再次输入密码" required
                className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-md text-sm placeholder:text-[rgba(0,0,0,0.25)] focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20" />
              {confirmPassword.length > 0 && <CheckItem ok={checks.match} text="密码一致" />}
            </div>

            <button type="submit" disabled={loading || !allValid}
              className="w-full py-2.5 bg-[#00B578] text-white rounded-md font-medium hover:bg-[#009A63] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-[rgba(0,0,0,0.45)]">已有账户？</span>
            <Link href="/login" className="text-sm text-[#00B578] hover:text-[#009A63] ml-1">立即登录</Link>
          </div>
        </div>

        <p className="text-center text-xs text-[rgba(0,0,0,0.25)] mt-6">© 2026 设计师接单平台 · 保留所有权利</p>
      </div>
    </div>
  )
}
