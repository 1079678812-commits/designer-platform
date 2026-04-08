import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  webp: 'image/webp', svg: 'image/svg+xml', pdf: 'application/pdf',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  zip: 'application/zip',
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: '无效文件名' }, { status: 400 })
    }

    const filePath = join(UPLOAD_DIR, filename)

    // Check file exists
    try {
      await stat(filePath)
    } catch {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 })
    }

    const buffer = await readFile(filePath)
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    const contentType = MIME_MAP[ext] || 'application/octet-stream'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: '读取文件失败' }, { status: 500 })
  }
}
