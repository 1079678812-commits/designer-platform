import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, TokenPayload } from './auth-jwt'

export type AuthenticatedRequest = NextRequest & { user: TokenPayload }

type Handler = (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>

/**
 * API 路由认证 + 租户隔离中间件
 * 自动从 JWT 获取当前用户，注入到 request.user
 * 未登录返回 401
 */
export function withAuth(handler: Handler) {
  return async (req: NextRequest, context?: any) => {
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }
    const authenticatedReq = req as AuthenticatedRequest
    authenticatedReq.user = user
    return handler(authenticatedReq, context)
  }
}

/**
 * 管理员权限检查
 */
export function withAdmin(handler: Handler) {
  return withAuth(async (req, context) => {
    if (req.user.role !== 'admin') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
    }
    return handler(req, context)
  })
}
