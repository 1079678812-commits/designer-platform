'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => {
        if (res.ok) { setAuthed(true) }
        else { router.replace('/login') }
      })
      .catch(() => router.replace('/login'))
      .finally(() => setChecked(true))
  }, [router])

  if (!checked) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
      <div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!authed) return null

  return <>{children}</>
}
