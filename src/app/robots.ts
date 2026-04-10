import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/settings/', '/admin/'],
      },
    ],
    sitemap: 'https://zaijia.me/sitemap.xml',
  }
}
