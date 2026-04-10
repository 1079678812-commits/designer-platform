import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const portfolios = await prisma.portfolio.findMany({
      where: { designerId: req.user.userId },
      orderBy: { sortOrder: 'desc' },
    })
    return NextResponse.json({ portfolios })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '获取作品集失败' }, { status: 500 })
  }
})

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { title, description, coverUrl, images, category, link, sortOrder } = body

    if (!title) return NextResponse.json({ error: '标题为必填项' }, { status: 400 })

    const portfolio = await prisma.portfolio.create({
      data: {
        title,
        description: description || null,
        coverUrl: coverUrl || null,
        images: JSON.stringify(images || []),
        category: category || null,
        link: link || null,
        sortOrder: sortOrder || 0,
        designerId: req.user.userId,
      },
    })
    return NextResponse.json({ portfolio }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '创建作品失败' }, { status: 500 })
  }
})
