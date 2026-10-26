import type { Metadata } from 'next';
import { getFilteredPosts, getSearchEligiblePosts } from '@/lib/storage';
import JelajahClient from './JelajahClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Jelajah Coretan | Koma',
  description: 'Jelajahi percakapan, cerita kecil, dan pemikiran anonim di Koma.',
  alternates: { canonical: '/jelajah' },
  openGraph: { title: 'Jelajah Coretan | Koma', url: '/jelajah', locale: 'id_ID', type: 'website' },
};

export default async function JelajahPage() {
  const [posts, eligible] = await Promise.all([getFilteredPosts('populer'), getSearchEligiblePosts()]);
  return <JelajahClient initialPosts={posts} archiveLinks={eligible.slice(0, 20).map(({ id, content }) => ({ id, content }))} />;
}
