import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.userId, read: false },
      data: { read: true },
    })
    return NextResponse.json({ success: true })
  } catch (err) { return NextResponse.json({ error: '操作失败' }, { status: 500 }) }
})
