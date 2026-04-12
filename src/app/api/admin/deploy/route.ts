import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'
import { execSync } from 'child_process'

// GET /api/admin/deploy — 获取部署历史
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  if (req.user.role !== 'admin') {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }

  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20')

    const [logs, total] = await Promise.all([
      prisma.deployLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.deployLog.count(),
    ])

    // 获取当前 git 信息
    let currentHash = ''
    let currentMsg = ''
    try {
      currentHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
      currentMsg = execSync('git log -1 --pretty=%s', { encoding: 'utf-8' }).trim()
    } catch {}

    return NextResponse.json({ logs, total, page, pageSize, currentHash, currentMsg })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '获取部署日志失败' }, { status: 500 })
  }
})

// POST /api/admin/deploy — 记录部署 & 部署到服务器
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  if (req.user.role !== 'admin') {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { commitHash, commitMsg, deployedBy, status, rollbackFrom, buildTime } = body

    const log = await prisma.deployLog.create({
      data: {
        commitHash: commitHash || 'unknown',
        commitMsg: commitMsg || '',
        deployedBy: deployedBy || req.user.name || 'admin',
        status: status || 'success',
        rollbackFrom: rollbackFrom || null,
        buildTime: buildTime || null,
      },
    })

    return NextResponse.json({ log })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '记录部署日志失败' }, { status: 500 })
  }
})

// PUT /api/admin/deploy — 回滚到指定版本
export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  if (req.user.role !== 'admin') {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 })
  }

  try {
    const { commitHash } = await req.json()
    if (!commitHash) {
      return NextResponse.json({ error: '缺少 commitHash' }, { status: 400 })
    }

    // 在服务器上执行回滚
    const sshCmd = `ssh -o ConnectTimeout=15 -p 2222 ubuntu@43.138.38.254`
    const remoteCmd = `cd /home/ubuntu/designer-platform && git fetch origin && git reset --hard ${commitHash} && rm -rf .next && npx next build && pm2 restart designer-platform && pm2 save`

    try {
      const output = execSync(`${sshCmd} "${remoteCmd}"`, {
        encoding: 'utf-8',
        timeout: 180000,
      })

      // 记录回滚日志
      await prisma.deployLog.create({
        data: {
          commitHash,
          commitMsg: `回滚到 ${commitHash}`,
          deployedBy: req.user.name || 'admin',
          status: 'rolled_back',
        },
      })

      return NextResponse.json({ success: true, output: output.slice(-500) })
    } catch (err: any) {
      return NextResponse.json({ error: '回滚失败', detail: err.message?.slice(-200) }, { status: 500 })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '回滚失败' }, { status: 500 })
  }
})
