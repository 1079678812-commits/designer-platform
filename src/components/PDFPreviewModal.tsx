'use client'

import { X, Download, ExternalLink, FileText } from 'lucide-react'

interface PDFPreviewModalProps {
  url: string
  title: string
  onClose: () => void
}

export default function PDFPreviewModal({ url, title, onClose }: PDFPreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 md:p-8" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.25)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0] bg-gradient-to-r from-[#FAFAFA] to-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-[#EF6B5E] to-[#E8635A] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <FileText className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[rgba(0,0,0,0.85)] text-sm truncate">{title}</h3>
              <p className="text-xs text-[rgba(0,0,0,0.35)]">PDF 文档预览</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => window.open(url, '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.85)] hover:bg-[#F5F5F5] rounded-lg transition-colors"
              title="在新窗口打开"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">新窗口</span>
            </button>
            <button
              onClick={() => { const a = document.createElement('a'); a.href = url; a.download = ''; a.click() }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.85)] hover:bg-[#F5F5F5] rounded-lg transition-colors"
              title="下载文件"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">下载</span>
            </button>
            <div className="w-px h-5 bg-[#E8E8E8] mx-1" />
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F5F5F5] rounded-lg text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.85)] transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-[#E8E8E8] p-3 md:p-4 overflow-hidden">
          <div className="w-full h-full rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
            <iframe src={url} className="w-full h-full border-0 bg-white" title={title} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#F0F0F0] bg-[#FAFAFA]">
          <p className="text-xs text-[rgba(0,0,0,0.25)]">按 ESC 关闭</p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.85)] border border-[#E8E8E8] rounded-lg hover:bg-white transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
