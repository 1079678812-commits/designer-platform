import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'

// 代理：保护API和页面路由（Next.js 15+ 替代middleware）
// 开发环境：暂时禁用保护
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 开发环境：允许所有访问
  if (process.env.NODE_ENV === 'development') {
    console.log('DEV: Allowing access to:', pathname)
    return NextResponse.next()
  }
  
  // 生产环境的保护逻辑（暂时留空）
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
