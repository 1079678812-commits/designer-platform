import { describe, it, expect, vi } from 'vitest'
import { rateLimit } from '@/lib/rate-limit'

describe('Rate Limiting', () => {
  it('should allow requests under the limit', () => {
    const result = rateLimit('test-key-1')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9)
  })

  it('should block requests over the limit', () => {
    for (let i = 0; i < 10; i++) {
      rateLimit('test-key-2')
    }
    const result = rateLimit('test-key-2')
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should track different keys independently', () => {
    rateLimit('test-key-3')
    rateLimit('test-key-3')
    const result = rateLimit('test-key-4')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9)
  })
})
