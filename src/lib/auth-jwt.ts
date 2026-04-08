import jwt from 'jsonwebtoken'
import { serialize, parse } from 'cookie'

const JWT_SECRET = process.env.JWT_SECRET || 'designer-platform-secret-key-change-in-production'
const TOKEN_NAME = 'designer_token'
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60 // 7 days

// Warn if using default secret in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('⚠️  FATAL: JWT_SECRET must be set in production!')
}

export interface TokenPayload {
  userId: string
  email: string
  name: string
  role: string
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${TOKEN_MAX_AGE}s` })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function setTokenCookie(token: string): string {
  return serialize(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE,
    path: '/',
  })
}

export function clearTokenCookie(): string {
  return serialize(TOKEN_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: -1,
    path: '/',
  })
}

export function getTokenFromRequest(request: Request): string | null {
  // 1. From cookie
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = parse(cookieHeader)
    if (cookies[TOKEN_NAME]) return cookies[TOKEN_NAME]
  }
  // 2. From Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return null
}

export function getUserFromRequest(request: Request): TokenPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}
