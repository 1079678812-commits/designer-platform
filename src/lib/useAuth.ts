'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface AuthUser {
  userId: string
  email: string
  name: string
  role: string
}

export function useAuth(requireAuth = true) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setUser(data.user)
        } else {
          if (!cancelled) {
            setUser(null)
            if (requireAuth) router.push('/login')
          }
        }
      } catch {
        if (!cancelled) {
          setUser(null)
          if (requireAuth) router.push('/login')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchUser()
    return () => { cancelled = true }
  }, [requireAuth, router])

  const logout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' })
    setUser(null)
    router.push('/login')
  }

  return { user, loading, logout }
}
