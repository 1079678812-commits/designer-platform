// 共享session存储（内存，生产环境用Redis）
export const sessions = new Map<string, { userId: string; expires: number }>()

export function verifySession(sessionId: string | undefined) {
  if (!sessionId) return null
  const session = sessions.get(sessionId)
  if (!session || session.expires < Date.now()) {
    sessions.delete(sessionId)
    return null
  }
  return session
}

export function createSession(userId: string, maxAge = 30 * 24 * 60 * 60 * 1000) {
  const sessionId = require('crypto').randomBytes(32).toString('hex')
  const expires = Date.now() + maxAge
  sessions.set(sessionId, { userId, expires })
  return { sessionId, expires }
}

export function deleteSession(sessionId: string) {
  sessions.delete(sessionId)
}
