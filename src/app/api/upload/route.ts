import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'
import { uploadFile } from '@/lib/upload-service'

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
]

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const category = formData.get('category') as string || 'general'

    if (!file) return NextResponse.json({ error: '请选择文件' }, { status: 400 })
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: '文件大小不能超过20MB' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
      return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 })
    }

    const result = await uploadFile(file, req.user.userId)

    return NextResponse.json({
      success: true,
      file: { ...result, category },
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
})
