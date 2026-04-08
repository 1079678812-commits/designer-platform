import { NextRequest, NextResponse } from 'next/server'

// CSRF protection middleware
// Validates that state-changing requests come from our own origin

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  process.env.NEXT_PUBLIC_BASE_URL,
].filter(Boolean)

export function csrfCheck(req: NextRequest): boolean {
  // Only check state-changing methods
  const method = req.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return true

  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')

  // If no origin/referer, allow for API-only calls (like curl)
  // In production with SameSite cookies, this is redundant but defense-in-depth
  if (!origin && !referer) return true

  // Check origin
  if (origin) {
    return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))
  }

  // Fallback to referer
  if (referer) {
    return ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed))
  }

  return false
}
