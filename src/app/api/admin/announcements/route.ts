import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-jwt'
import { prisma } from '@/lib/prisma'

// GET /api/admin/announcements - List all announcements
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const announcements = await prisma.announcement.findMany({
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ announcements })
}

// POST /api/admin/announcements - Create an announcement
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const body = await request.json()
  const { title, content, type, priority, active, startAt, endAt } = body

  if (!title || !content) {
    return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 })
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      type: type || 'notice',
      priority: priority || 0,
      active: active !== undefined ? active : true,
      startAt: startAt ? new Date(startAt) : null,
      endAt: endAt ? new Date(endAt) : null,
    },
  })

  return NextResponse.json({ success: true, announcement })
}

// PUT /api/admin/announcements - Update an announcement
export async function PUT(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const body = await request.json()
  const { id, title, content, type, priority, active, startAt, endAt } = body

  if (!id) {
    return NextResponse.json({ error: '缺少公告ID' }, { status: 400 })
  }

  const announcement = await prisma.announcement.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(type !== undefined && { type }),
      ...(priority !== undefined && { priority }),
      ...(active !== undefined && { active }),
      ...(startAt !== undefined && { startAt: startAt ? new Date(startAt) : null }),
      ...(endAt !== undefined && { endAt: endAt ? new Date(endAt) : null }),
    },
  })

  return NextResponse.json({ success: true, announcement })
}

// DELETE /api/admin/announcements - Delete an announcement
export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: '缺少公告ID' }, { status: 400 })
  }

  await prisma.announcement.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
