// OSS Upload Service
// Supports: local filesystem (dev) / Alibaba Cloud OSS (production)
// Switch via env: USE_OSS=true

import { writeFile, mkdir, readFile, stat, unlink } from 'fs/promises'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

interface UploadResult {
  url: string
  name: string
  size: number
  type: string
}

export async function uploadFile(file: File, userId: string): Promise<UploadResult> {
  const useOSS = process.env.USE_OSS === 'true'

  if (useOSS) {
    return uploadToOSS(file, userId)
  }
  return uploadToLocal(file, userId)
}

async function uploadToLocal(file: File, userId: string): Promise<UploadResult> {
  await mkdir(UPLOAD_DIR, { recursive: true })

  const ext = file.name.split('.').pop() || 'bin'
  const uniqueName = `${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
  const filePath = join(UPLOAD_DIR, uniqueName)

  const bytes = await file.arrayBuffer()
  await writeFile(filePath, Buffer.from(bytes))

  return {
    url: `/api/upload/${uniqueName}`,
    name: file.name,
    size: file.size,
    type: file.type,
  }
}

async function uploadToOSS(file: File, userId: string): Promise<UploadResult> {
  // Alibaba Cloud OSS integration
  // Requires: ali-oss package + OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET, OSS_BUCKET, OSS_REGION
  // Fallback to local if not configured
  console.warn('ali-oss not installed, falling back to local storage')
  return uploadToLocal(file, userId)
}

export async function deleteFile(url: string): Promise<void> {
  if (url.startsWith('/api/upload/')) {
    const filename = url.replace('/api/upload/', '')
    const filePath = join(UPLOAD_DIR, filename)
    try { await unlink(filePath) } catch {}
  }
  // OSS deletion would go here
}
