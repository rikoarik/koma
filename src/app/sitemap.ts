import type { MetadataRoute } from 'next';
import { getSearchEligiblePosts } from '@/lib/storage';
import { SITE_URL, postUrl } from '@/lib/search-policy';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getSearchEligiblePosts();
  return [
    ...['', '/jelajah', '/tentang', '/aturan', '/privasi', '/dukung'].map((path) => ({ url: `${SITE_URL}${path}` })),
    ...posts.map((post) => ({ url: postUrl(post.id), lastModified: new Date(post.createdAt) })),
  ];
}
