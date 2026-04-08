import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'
import { sendNotification } from '@/lib/notification-service'

// PATCH /api/admin/review - Approve or reject a service/user
export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  if (req.user.role !== 'admin') {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { type, id, action, reason } = body // type: service|user, action: approve|reject

    if (!type || !id || !action) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    if (type === 'service') {
      const service = await prisma.service.findUnique({ where: { id } })
      if (!service) return NextResponse.json({ error: '服务不存在' }, { status: 404 })

      const newStatus = action === 'approve' ? 'active' : 'rejected'
      await prisma.service.update({ where: { id }, data: { status: newStatus } })

      // Notify designer
      await sendNotification({
        userId: service.designerId,
        title: action === 'approve' ? '服务审核通过' : '服务审核未通过',
        content: action === 'approve'
          ? `你的服务「${service.name}」已通过审核，现在可以在主页展示。`
          : `你的服务「${service.name}」未通过审核。${reason ? `原因：${reason}` : '请修改后重新提交。'}`,
        type: 'review',
      })

      return NextResponse.json({ success: true, status: newStatus })
    }

    if (type === 'user') {
      const user = await prisma.user.findUnique({ where: { id } })
      if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

      const newStatus = action === 'approve' ? 'active' : 'banned'
      await prisma.user.update({ where: { id }, data: { status: newStatus } })

      if (action === 'reject') {
        await sendNotification({
          userId: user.id,
          title: '账号审核通知',
          content: `你的账号未通过审核。${reason ? `原因：${reason}` : ''}`,
          type: 'system',
        })
      }

      return NextResponse.json({ success: true, status: newStatus })
    }

    return NextResponse.json({ error: '不支持的类型' }, { status: 400 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '审核操作失败' }, { status: 500 })
  }
})
