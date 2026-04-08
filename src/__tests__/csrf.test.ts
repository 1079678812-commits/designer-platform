import { describe, it, expect } from 'vitest'
import { csrfCheck } from '@/lib/csrf'

describe('CSRF Protection', () => {
  it('should allow GET requests', () => {
    const req = new Request('http://localhost:3000/api/test', { method: 'GET' })
    expect(csrfCheck(req as any)).toBe(true)
  })

  it('should block POST from unknown origin', () => {
    const req = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { origin: 'https://evil-site.com' },
    })
    expect(csrfCheck(req as any)).toBe(false)
  })

  it('should allow POST from localhost', () => {
    const req = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000' },
    })
    expect(csrfCheck(req as any)).toBe(true)
  })
})
