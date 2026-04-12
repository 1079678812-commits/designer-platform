import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/config - Public platform config (no auth required)
export async function GET() {
  let config = await prisma.platformConfig.findFirst()
  if (!config) {
    config = await prisma.platformConfig.create({ data: {} })
  }

  return NextResponse.json({
    siteName: config.siteName,
    logoUrl: config.logoUrl,
    themeColor: config.themeColor,
  })
}
