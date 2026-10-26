import type { Metadata } from 'next';
import { getFilteredPosts } from '@/lib/storage';
import JelajahClient from './JelajahClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Jelajah Coretan | Koma',
  description: 'Jelajahi percakapan, cerita kecil, dan pemikiran anonim di Koma.',
  alternates: { canonical: '/jelajah' },
  openGraph: { title: 'Jelajah Coretan | Koma', url: '/jelajah', locale: 'id_ID', type: 'website' },
  robots: { index: false, follow: true }, // The interactive feed includes publicly visible, non-consenting posts.
};

export default async function JelajahPage() {
  const posts = await getFilteredPosts('populer');
  return <JelajahClient initialPosts={posts} />;
}
