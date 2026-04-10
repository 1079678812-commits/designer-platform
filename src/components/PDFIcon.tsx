'use client'

export default function PDFIcon({ size = 20 }: { size?: number }) {
  const s = size
  const r = s * 0.15 // corner radius
  const fold = s * 0.3 // fold size

  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document body */}
      <path d="M6 2 L14 2 L20 8 L20 22 L6 22 Z" fill="#FF4D4F" rx={r} />
      {/* Fold triangle */}
      <path d="M14 2 L14 8 L20 8 Z" fill="#CF1322" />
      {/* White highlight line */}
      <rect x="8" y="11" width="8" height="1.2" rx="0.6" fill="white" opacity="0.9" />
      <rect x="8" y="14" width="6" height="1.2" rx="0.6" fill="white" opacity="0.7" />
      <rect x="8" y="17" width="7" height="1.2" rx="0.6" fill="white" opacity="0.5" />
    </svg>
  )
}
