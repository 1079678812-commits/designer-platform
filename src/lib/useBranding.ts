'use client'

import { useState, useEffect } from 'react'

interface PlatformBranding {
  siteName: string
  logoUrl: string
  themeColor: string
}

const defaultBranding: PlatformBranding = {
  siteName: '设计师平台',
  logoUrl: '',
  themeColor: '#00B578',
}

export function useBranding() {
  const [branding, setBranding] = useState<PlatformBranding>(defaultBranding)

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.siteName) setBranding(prev => ({
          ...prev,
          siteName: d.siteName,
          logoUrl: d.logoUrl || prev.logoUrl,
          themeColor: d.themeColor || prev.themeColor,
        }))
      })
      .catch(() => {})
  }, [])

  return branding
}
