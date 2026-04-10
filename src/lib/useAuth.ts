'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface AuthUser {
  userId: string
  email: string
  name: string
  role: string
  title?: string
  avatar?: string
}

export function useAuth(requireAuth = true) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
        if (requireAuth) router.push('/login')
      }
    } catch {
      setUser(null)
      if (requireAuth) router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [requireAuth, router])

  useEffect(() => { fetchUser() }, [fetchUser])

  const logout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' })
    setUser(null)
    router.push('/login')
  }

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch {}
  }, [])

  return { user, loading, logout, refresh }
}
