'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * For login/register pages: redirect to /dashboard if already logged in
 */
export function useRedirectIfAuth() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => { if (res.ok) router.replace('/dashboard') })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [router])

  return checking
}
