import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-jwt'
import { prisma } from '@/lib/prisma'

// GET /api/admin/branding - Get branding config
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  let config = await prisma.platformConfig.findFirst()
  if (!config) {
    config = await prisma.platformConfig.create({ data: {} })
  }

  return NextResponse.json({ config })
}

// PUT /api/admin/branding - Update branding config
export async function PUT(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const body = await request.json()
  const { siteName, logoUrl, themeColor } = body

  let config = await prisma.platformConfig.findFirst()
  if (!config) {
    config = await prisma.platformConfig.create({
      data: {
        siteName: siteName || '设计师平台',
        logoUrl: logoUrl || null,
        themeColor: themeColor || '#00B578',
      },
    })
  } else {
    config = await prisma.platformConfig.update({
      where: { id: config.id },
      data: {
        ...(siteName !== undefined && { siteName }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(themeColor !== undefined && { themeColor }),
      },
    })
  }

  return NextResponse.json({ success: true, config })
}
