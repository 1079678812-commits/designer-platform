'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [suspended, setSuspended] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => {
        if (res.ok) {
          return res.json()
        } else {
          throw new Error('not authed')
        }
      })
      .then(data => {
        if (data?.user?.status === 'suspended') {
          setSuspended(true)
          setUserName(data.user.name || '')
          setChecked(true)
          return
        }
        setAuthed(true)
        setChecked(true)
      })
      .catch(() => {
        router.replace('/login')
      })
  }, [router])

  if (!checked) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
      <div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (suspended) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
      <div className="bg-white p-8 rounded-2xl border border-[#E8E8E8] max-w-md text-center shadow-sm">
        <div className="w-16 h-16 bg-[#FFF2F0] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#FF4D4F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[rgba(0,0,0,0.85)] mb-2">账户已被暂停</h2>
        <p className="text-[rgba(0,0,0,0.45)] mb-6">{userName ? `${userName}，` : ''}您的账户已被管理员暂停使用。如有疑问请联系平台管理员。</p>
        <button
          onClick={() => {
            fetch('/api/auth/session', { method: 'DELETE' }).finally(() => {
              router.push('/login')
            })
          }}
          className="px-6 py-2.5 bg-[#FF4D4F] text-white rounded-lg text-sm hover:bg-[#CF1322]"
        >
          返回登录
        </button>
      </div>
    </div>
  )

  if (!authed) return null

  return <>{children}</>
}
