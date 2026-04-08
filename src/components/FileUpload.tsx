'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'

interface FileUploadProps {
  onUpload: (url: string, file: File) => void
  accept?: string
  category?: string
  maxSize?: number // MB
  preview?: boolean
  className?: string
}

export default function FileUpload({
  onUpload,
  accept = 'image/*',
  category = 'general',
  maxSize = 20,
  preview = true,
  className = '',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError('')

    if (file.size > maxSize * 1024 * 1024) {
      setError(`文件大小不能超过${maxSize}MB`)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok) {
        if (preview && file.type.startsWith('image/')) {
          setPreviewUrl(data.file.url)
        }
        onUpload(data.file.url, file)
      } else {
        setError(data.error || '上传失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setUploading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="relative border-2 border-dashed border-[#D9D9D9] rounded-lg p-6 text-center cursor-pointer hover:border-[#00B578] hover:bg-[#E8F8F0]/30 transition-colors"
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-[#00B578] animate-spin" />
            <p className="text-sm text-[rgba(0,0,0,0.45)]">上传中...</p>
          </div>
        ) : previewUrl ? (
          <div className="relative">
            <img src={previewUrl} alt="preview" className="max-h-32 mx-auto rounded" />
            <button onClick={e => { e.stopPropagation(); setPreviewUrl(null) }} className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF4D4F] rounded-full flex items-center justify-center">
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-[rgba(0,0,0,0.25)]" />
            <p className="text-sm text-[rgba(0,0,0,0.45)]">点击或拖拽文件到此处上传</p>
            <p className="text-xs text-[rgba(0,0,0,0.25)]">支持 JPG、PNG、PDF，最大 {maxSize}MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-[#FF4D4F] mt-2">{error}</p>}
    </div>
  )
}
