import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const BANNERS_FILE = join(process.cwd(), 'uploads', 'banners.json')

async function getBanners(): Promise<any[]> {
  try {
    const data = await readFile(BANNERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function saveBanners(banners: any[]) {
  await mkdir(join(process.cwd(), 'uploads'), { recursive: true })
  await writeFile(BANNERS_FILE, JSON.stringify(banners, null, 2))
}

// GET - fetch all banners
export const GET = withAuth(async () => {
  const banners = await getBanners()
  return NextResponse.json({ banners })
})

// POST - add a banner
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  const body = await req.json()
  const { url, link } = body

  if (!url) return NextResponse.json({ error: '请提供图片地址' }, { status: 400 })

  const banners = await getBanners()
  const newBanner = {
    id: `banner_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    url,
    link: link || '',
    order: banners.length,
    createdAt: new Date().toISOString(),
  }
  banners.push(newBanner)
  await saveBanners(banners)

  return NextResponse.json({ success: true, banner: newBanner })
})

// DELETE - remove a banner
export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 })

  let banners = await getBanners()
  banners = banners.filter(b => b.id !== id)
  await saveBanners(banners)

  return NextResponse.json({ success: true })
})

// PUT - update a banner (e.g. set link)
export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  const { id, link } = await req.json()
  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 })

  const banners = await getBanners()
  const banner = banners.find(b => b.id === id)
  if (!banner) return NextResponse.json({ error: '未找到' }, { status: 404 })

  banner.link = link ?? banner.link
  await saveBanners(banners)

  return NextResponse.json({ success: true, banner })
})

// PATCH - reorder banners
export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  const { ids } = await req.json() // ordered array of ids
  if (!Array.isArray(ids)) return NextResponse.json({ error: '无效参数' }, { status: 400 })

  let banners = await getBanners()
  const reordered = ids.map((id: string, index: number) => {
    const b = banners.find(x => x.id === id)
    return b ? { ...b, order: index } : null
  }).filter(Boolean)

  await saveBanners(reordered)
  return NextResponse.json({ success: true })
})
