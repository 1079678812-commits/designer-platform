import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/announcements - Get active announcements (public)
export async function GET() {
  const now = new Date()

  const announcements = await prisma.announcement.findMany({
    where: {
      active: true,
      OR: [
        { startAt: null, endAt: null },
        { startAt: { lte: now }, endAt: null },
        { startAt: null, endAt: { gte: now } },
        { startAt: { lte: now }, endAt: { gte: now } },
      ],
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    take: 5,
  })

  return NextResponse.json({ announcements })
}
