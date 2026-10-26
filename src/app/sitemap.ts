import type { MetadataRoute } from 'next';
import { getSearchEligiblePosts } from '@/lib/storage';
import { SITE_URL, postUrl, ARCHIVE_PAGE_SIZE } from '@/lib/search-policy';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getSearchEligiblePosts();
  return [
    ...['', '/tentang', '/aturan', '/privasi', '/dukung'].map((path) => ({ url: `${SITE_URL}${path}` })),
    ...(posts.length ? [{ url: `${SITE_URL}/jelajah/arsip` }] : []),
    ...Array.from({ length: Math.max(0, Math.ceil(posts.length / ARCHIVE_PAGE_SIZE) - 1) }, (_, index) => ({ url: `${SITE_URL}/jelajah/arsip?page=${index + 2}` })),
    ...posts.map((post) => ({ url: postUrl(post.id), lastModified: new Date(post.createdAt) })),
  ];
}
