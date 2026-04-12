import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/help - Public help articles (published only)
export async function GET() {
  const articles = await prisma.helpArticle.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ articles })
}
