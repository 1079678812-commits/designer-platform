// Auth is handled via JWT - see auth-jwt.ts
// This file provides compatibility exports

export const auth = {
  async session() {
    return null
  }
}

export const handlers = {
  GET: async () => new Response('Use /api/auth/login', { status: 400 }),
  POST: async () => new Response('Use /api/auth/login', { status: 400 }),
}
