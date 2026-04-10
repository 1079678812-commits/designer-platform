'use client'

interface PDFThumbnailProps {
  url?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export default function PDFThumbnail({ url, name, size = 'md', onClick }: PDFThumbnailProps) {
  const sizeMap = { sm: 'w-8 h-10', md: 'w-10 h-13', lg: 'w-14 h-18' }
  const textSize = { sm: 'text-[7px]', md: 'text-[8px]', lg: 'text-[10px]' }

  if (!url) {
    return (
      <div className={`${sizeMap[size]} rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] flex flex-col items-center justify-center flex-shrink-0`}>
        <span className={`${textSize[size]} font-bold text-[rgba(0,0,0,0.12)] tracking-wide`}>PDF</span>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={`${sizeMap[size]} rounded-lg overflow-hidden cursor-pointer hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all relative flex-shrink-0`}
      style={{ background: 'linear-gradient(180deg, #EF6B5E 0%, #E8635A 55%, rgba(255,255,255,0.85) 55%, #F5F0EE 100%)' }}
    >
      {/* Glass highlight */}
      <div className="absolute top-0 left-0 right-0 h-[55%]" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.03) 100%)' }} />
      <div className="absolute inset-0 flex items-end justify-center pb-[8%]">
        <span className={`${textSize[size]} font-extrabold text-[#C0392B] tracking-wider relative z-10`}>PDF</span>
      </div>
      {onClick && (
        <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors z-20" />
      )}
    </div>
  )
}
