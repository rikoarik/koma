import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/search-policy';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'PerplexityBot'], allow: '/', disallow: ['/admin', '/api/', '/pesan'] },
      { userAgent: ['GPTBot', 'Google-Extended', 'ClaudeBot', 'CCBot'], disallow: '/' },
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/pesan'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
