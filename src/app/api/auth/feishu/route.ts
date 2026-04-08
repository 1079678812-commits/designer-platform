import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken, setTokenCookie } from '@/lib/auth-jwt'

const FEISHU_APP_ID = process.env.FEISHU_APP_ID || ''
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || ''
const FEISHU_BASE = 'https://open.feishu.cn/open-apis'

// Step 1: Redirect to Feishu OAuth
export async function GET(req: NextRequest) {
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/feishu/callback`
  const state = Math.random().toString(36).slice(2)
  
  const url = `${FEISHU_BASE}/authen/v1/authorize?app_id=${FEISHU_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
  
  return NextResponse.redirect(url)
}
