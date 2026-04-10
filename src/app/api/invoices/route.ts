import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'

const execFileAsync = promisify(execFile)

async function compressPdf(filePath: string): Promise<string> {
  try {
    const parsed = path.parse(filePath)
    const compressedPath = path.join(parsed.dir, `${parsed.name}_compressed.pdf`)
    await execFileAsync('gs', [
      '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4',
      '-dPDFSETTINGS=/prepress', '-dNOPAUSE', '-dQUIET', '-dBATCH',
      `-sOutputFile=${compressedPath}`, filePath,
    ], { timeout: 30000 })
    const [origStat, compStat] = await Promise.all([fs.stat(filePath), fs.stat(compressedPath)])
    if (compStat.size < origStat.size) {
      await fs.rename(compressedPath, filePath)
      return filePath
    }
    await fs.unlink(compressedPath)
    return filePath
  } catch {
    return filePath
  }
}

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const where: any = { designerId: req.user.userId }
    if (status) where.status = status

    const invoices = await prisma.invoice.findMany({
      where, include: { order: { include: { client: true } } }, orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ invoices })
  } catch (err) { return NextResponse.json({ error: '获取发票失败' }, { status: 500 }) }
})

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { title, amount, orderId, dueDate, fileUrl } = body
    if (!title || !orderId || amount === undefined) return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })

    const order = await prisma.order.findFirst({ where: { id: orderId, designerId: req.user.userId } })
    if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 })

    let finalFileUrl = fileUrl
    if (finalFileUrl && finalFileUrl.startsWith('/uploads/')) {
      const localPath = path.join(process.cwd(), 'public', finalFileUrl)
      await compressPdf(localPath)
    }

    const invoiceNo = `INV${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo, title, amount: Number(amount), orderId,
        designerId: req.user.userId,
        dueDate: dueDate ? new Date(dueDate) : null,
        fileUrl: finalFileUrl,
      },
    })
    return NextResponse.json({ invoice }, { status: 201 })
  } catch (err) { return NextResponse.json({ error: '创建发票失败' }, { status: 500 }) }
})
