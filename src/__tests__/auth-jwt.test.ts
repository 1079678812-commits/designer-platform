import { describe, it, expect } from 'vitest'
import { verifyToken, signToken } from '@/lib/auth-jwt'

describe('JWT Auth', () => {
  it('should sign and verify a token', () => {
    const payload = { userId: 'test-123', email: 'test@test.com', name: 'Test', role: 'designer' }
    const token = signToken(payload)
    expect(token).toBeTruthy()

    const decoded = verifyToken(token)
    expect(decoded).not.toBeNull()
    expect(decoded!.userId).toBe('test-123')
    expect(decoded!.email).toBe('test@test.com')
  })

  it('should return null for invalid token', () => {
    const result = verifyToken('invalid.token.here')
    expect(result).toBeNull()
  })

  it('should return null for empty token', () => {
    const result = verifyToken('')
    expect(result).toBeNull()
  })
})
