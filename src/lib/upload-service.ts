// OSS Upload Service
// Supports: local filesystem (dev) / Alibaba Cloud OSS (production)
// Switch via env: USE_OSS=true

import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

interface UploadResult {
  url: string
  name: string
  size: number
  type: string
}

function getOSSConfig() {
  return {
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
    region: process.env.OSS_REGION,
    endpoint: process.env.OSS_ENDPOINT,
  }
}

function isOSSConfigured(): boolean {
  const cfg = getOSSConfig()
  return !!(cfg.accessKeyId && cfg.accessKeySecret && cfg.bucket && (cfg.region || cfg.endpoint))
}

export async function uploadFile(file: File, userId: string): Promise<UploadResult> {
  const useOSS = process.env.USE_OSS === 'true'

  if (useOSS && isOSSConfigured()) {
    return uploadToOSS(file, userId)
  }
  if (useOSS) {
    console.warn('OSS requested but not fully configured, falling back to local storage')
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
  try {
    const OSS = (await import('ali-oss')).default
    const cfg = getOSSConfig()

    const client = new OSS({
      accessKeyId: cfg.accessKeyId!,
      accessKeySecret: cfg.accessKeySecret!,
      bucket: cfg.bucket!,
      region: cfg.region || undefined,
      endpoint: cfg.endpoint || undefined,
    })

    const ext = file.name.split('.').pop() || 'bin'
    const ossPath = `uploads/${userId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())
    await client.put(ossPath, buffer)

    // Build public URL
    const baseUrl = cfg.endpoint
      ? `https://${cfg.bucket}.${cfg.endpoint.replace(/^https?:\/\//, '')}`
      : `https://${cfg.bucket}.${cfg.region}.aliyuncs.com`
    const publicUrl = `${baseUrl}/${ossPath}`

    return {
      url: publicUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    }
  } catch (err) {
    console.error('OSS upload failed, falling back to local:', err)
    return uploadToLocal(file, userId)
  }
}

export async function deleteFile(url: string): Promise<void> {
  if (url.startsWith('/api/upload/')) {
    const filename = url.replace('/api/upload/', '')
    const filePath = join(UPLOAD_DIR, filename)
    try { await unlink(filePath) } catch {}
  } else if (url.includes('.aliyuncs.com/') || url.includes('.oss-')) {
    await deleteFromOSS(url)
  }
}

async function deleteFromOSS(url: string): Promise<void> {
  try {
    const OSS = (await import('ali-oss')).default
    const cfg = getOSSConfig()

    if (!isOSSConfigured()) return

    const client = new OSS({
      accessKeyId: cfg.accessKeyId!,
      accessKeySecret: cfg.accessKeySecret!,
      bucket: cfg.bucket!,
      region: cfg.region || undefined,
      endpoint: cfg.endpoint || undefined,
    })

    // Extract object path from URL
    const urlObj = new URL(url)
    const ossPath = urlObj.pathname.slice(1) // remove leading /
    await client.delete(ossPath)
  } catch (err) {
    console.error('OSS delete failed:', err)
  }
}
