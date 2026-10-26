import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSearchEligiblePosts } from '@/lib/storage';
import { ARCHIVE_PAGE_SIZE } from '@/lib/search-policy';

export const dynamic = 'force-dynamic';

type Props = { searchParams: { page?: string } };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = Number(searchParams.page || '1');
  return { title: 'Arsip Coretan | Koma', robots: { index: false, follow: true },
    alternates: { canonical: page > 1 ? `/jelajah/arsip?page=${page}` : '/jelajah/arsip' } };
}

export default async function ArchivePage({ searchParams }: Props) {
  const raw = searchParams.page || '1';
  if (!/^[1-9]\d*$/.test(raw) || Number(raw) > 100000) notFound();
  const page = Number(raw);
  const eligible = await getSearchEligiblePosts();
  const pages = Math.max(1, Math.ceil(eligible.length / ARCHIVE_PAGE_SIZE));
  if (page > pages) notFound();
  const posts = eligible.slice((page - 1) * ARCHIVE_PAGE_SIZE, page * ARCHIVE_PAGE_SIZE);
  return <main className="min-h-screen bg-paper text-ink max-w-4xl mx-auto px-4 py-12 font-sans">
    <Link href="/jelajah" className="font-mono text-xs">← Kembali ke Jelajah</Link>
    <h1 className="font-serif font-black text-3xl mt-8 mb-4">Arsip coretan</h1>
    <p className="text-sm text-ink-muted mb-8">Hanya coretan yang diizinkan penulis dan memenuhi syarat pencarian.</p>
    <ol className="space-y-4">{posts.map((post) => <li key={post.id} className="border-b border-ink/15 pb-4">
      <Link href={`/coretan/${post.id}`} className="font-serif font-bold hover:underline">{post.content.slice(0, 160)}{post.content.length > 160 ? '…' : ''}</Link>
      <div className="text-xs text-ink-muted mt-1"><time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString('id-ID')}</time> · #{post.topic}</div>
    </li>)}</ol>
    <nav aria-label="Halaman arsip" className="flex gap-6 mt-8 font-mono text-sm">
      {page > 1 && <Link href={page === 2 ? '/jelajah/arsip' : `/jelajah/arsip?page=${page - 1}`}>← Sebelumnya</Link>}
      {page < pages && <Link href={`/jelajah/arsip?page=${page + 1}`}>Berikutnya →</Link>}
    </nav>
  </main>;
}
