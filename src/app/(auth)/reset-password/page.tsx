'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const success = searchParams.get('success')

  const isValidPassword = (p: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(p)
  const hasMinLen = newPassword.length >= 8
  const hasUpper = /[A-Z]/.test(newPassword)
  const hasLower = /[a-z]/.test(newPassword)
  const hasDigit = /\d/.test(newPassword)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidPassword(newPassword)) {
      setError('新密码不符合要求')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, oldPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/login?success=1')
      } else {
        setError(data.error || '重置失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-[rgba(0,0,0,0.85)]">重置密码</h1>
          <p className="text-[rgba(0,0,0,0.45)] mt-1">设置你的新密码</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E8E8] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-8">
          {success && (
            <div className="p-3 bg-[#F6FFED] border border-[#B7EB8F] rounded-lg text-sm text-[#52C41A] mb-5">密码重置成功，请重新登录！</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-[#FFF2F0] border border-[#FFCCC7] rounded-lg text-sm text-[#FF4D4F]">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">邮箱</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="请输入邮箱地址" required
                className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-md text-sm placeholder:text-[rgba(0,0,0,0.25)] focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">当前密码</label>
              <div className="relative">
                <input type={showOld ? 'text' : 'password'} value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="请输入当前密码" required
                  className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-md text-sm placeholder:text-[rgba(0,0,0,0.25)] focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 transition-colors pr-10" />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(0,0,0,0.45)]">
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">新密码</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="请输入新密码" required
                  className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-md text-sm placeholder:text-[rgba(0,0,0,0.25)] focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 transition-colors pr-10" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(0,0,0,0.45)]">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="mt-2 space-y-1 text-xs">
                  <div className={`flex items-center gap-1 ${hasMinLen ? 'text-[#52C41A]' : 'text-[rgba(0,0,0,0.25)]'}`}>
                    <span>{hasMinLen ? '✓' : '○'}</span> 至少8个字符
                  </div>
                  <div className={`flex items-center gap-1 ${hasUpper ? 'text-[#52C41A]' : 'text-[rgba(0,0,0,0.25)]'}`}>
                    <span>{hasUpper ? '✓' : '○'}</span> 包含大写字母
                  </div>
                  <div className={`flex items-center gap-1 ${hasLower ? 'text-[#52C41A]' : 'text-[rgba(0,0,0,0.25)]'}`}>
                    <span>{hasLower ? '✓' : '○'}</span> 包含小写字母
                  </div>
                  <div className={`flex items-center gap-1 ${hasDigit ? 'text-[#52C41A]' : 'text-[rgba(0,0,0,0.25)]'}`}>
                    <span>{hasDigit ? '✓' : '○'}</span> 包含数字
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1.5">确认新密码</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="请再次输入新密码" required
                className="w-full px-4 py-2.5 border border-[#D9D9D9] rounded-md text-sm placeholder:text-[rgba(0,0,0,0.25)] focus:outline-none focus:border-[#00B578] focus:ring-2 focus:ring-[#00B578]/20 transition-colors" />
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-[#FF4D4F]">两次输入的密码不一致</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[#00B578] text-white rounded-md font-medium hover:bg-[#009A63] disabled:opacity-50 transition-colors shadow-sm">
              {loading ? '重置中...' : '重置密码'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-[#00B578] hover:text-[#009A63]">返回登录</Link>
          </div>
        </div>

        <p className="text-center text-xs text-[rgba(0,0,0,0.25)] mt-6">© 2026 设计师接单平台 · 保留所有权利</p>
      </div>
    </div>
  )
}
