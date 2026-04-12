import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-jwt'
import { prisma } from '@/lib/prisma'

// GET /api/admin/help - List all help articles
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const articles = await prisma.helpArticle.findMany({
    orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ articles })
}

// POST /api/admin/help - Create a help article
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const body = await request.json()
  const { title, category, content, sortOrder, published } = body

  if (!title || !content) {
    return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 })
  }

  const article = await prisma.helpArticle.create({
    data: {
      title,
      category: category || '其他',
      content,
      sortOrder: sortOrder || 0,
      published: published || false,
    },
  })

  return NextResponse.json({ success: true, article })
}

// PUT /api/admin/help - Update a help article
export async function PUT(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const body = await request.json()
  const { id, title, category, content, sortOrder, published } = body

  if (!id) {
    return NextResponse.json({ error: '缺少文章ID' }, { status: 400 })
  }

  const article = await prisma.helpArticle.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(category !== undefined && { category }),
      ...(content !== undefined && { content }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(published !== undefined && { published }),
    },
  })

  return NextResponse.json({ success: true, article })
}

// DELETE /api/admin/help - Delete a help article
export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: '缺少文章ID' }, { status: 400 })
  }

  await prisma.helpArticle.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
