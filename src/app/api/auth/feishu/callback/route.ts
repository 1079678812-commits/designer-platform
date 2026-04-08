import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, setTokenCookie } from '@/lib/auth-jwt'

const FEISHU_APP_ID = process.env.FEISHU_APP_ID || ''
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || ''
const FEISHU_BASE = 'https://open.feishu.cn/open-apis'

async function getFeishuToken() {
  const res = await fetch(`${FEISHU_BASE}/auth/v3/app_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET }),
  })
  const data = await res.json()
  return data.app_access_token
}

async function getUserInfo(appAccessToken: string, code: string) {
  // Get user access token
  const tokenRes = await fetch(`${FEISHU_BASE}/authen/v1/oidc/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${appAccessToken}` },
    body: JSON.stringify({ grant_type: 'authorization_code', code }),
  })
  const tokenData = await tokenRes.json()
  if (tokenData.code !== 0) throw new Error('获取飞书token失败')

  // Get user info
  const userRes = await fetch(`${FEISHU_BASE}/authen/v1/user_info`, {
    headers: { 'Authorization': `Bearer ${tokenData.data.access_token}` },
  })
  const userData = await userRes.json()
  if (userData.code !== 0) throw new Error('获取飞书用户信息失败')

  return userData.data
}

function generateSlug(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  const suffix = Math.random().toString(36).slice(2, 6)
  return base ? `${base}-${suffix}` : `designer-${suffix}`
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')
    if (!code) {
      return NextResponse.redirect(new URL('/login?error=飞书授权失败', req.url))
    }

    // Get app access token
    const appAccessToken = await getFeishuToken()

    // Get user info from Feishu
    const feishuUser = await getUserInfo(appAccessToken, code)
    const { name, email, open_id, avatar_url } = feishuUser

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { email: email || `${open_id}@feishu` },
    })

    if (!user) {
      // Auto-register
      const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
      const hashedPassword = await import('bcryptjs').then(b => b.default.hash(randomPassword, 10))
      const slug = generateSlug(name || 'designer')

      user = await prisma.user.create({
        data: {
          name: name || '飞书用户',
          email: email || `${open_id}@feishu`,
          password: hashedPassword,
          role: 'designer',
          slug,
          avatar: avatar_url || null,
        },
      })
    }

    // Sign JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    const response = NextResponse.redirect(new URL('/dashboard', req.url))
    response.headers.set('Set-Cookie', setTokenCookie(token))
    return response
  } catch (err: any) {
    console.error('Feishu OAuth error:', err)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err.message || '飞书登录失败')}`, req.url))
  }
}
