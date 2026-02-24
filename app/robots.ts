import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://precificadora3decom.com.br'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/', '/calculadora', '/historico', '/preferencias'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
