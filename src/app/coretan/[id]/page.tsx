import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostById, getSearchEligiblePosts } from '@/lib/storage';
import { postUrl, SITE_URL } from '@/lib/search-policy';
import PostPageClient from './PostPageClient';

export const dynamic = 'force-dynamic';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostById(params.id);
  if (!post) return { title: 'Coretan tidak ditemukan | Koma', robots: { index: false, follow: false } };
  const allowed = (await getSearchEligiblePosts()).some((item) => item.id === post.id);
  const url = postUrl(post.id);
  if (!allowed) return { title: 'Coretan di Koma', robots: { index: false, follow: true, nocache: true }, alternates: { canonical: url }, openGraph: { title: 'Coretan di Koma', url, images: ['/brand/png/koma-app-icon-512.png'] }, twitter: { card: 'summary', title: 'Coretan di Koma' } };
  const title = `${post.content.trim().slice(0, 72)}${post.content.trim().length > 72 ? '…' : ''} | Koma`;
  const description = post.content.trim().slice(0, 155);
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'Koma', locale: 'id_ID', type: 'article', images: ['/brand/png/koma-app-icon-512.png'] },
    twitter: { card: 'summary', title, description, images: ['/brand/png/koma-app-icon-512.png'] },
  };
}

export default async function SinglePostPage({ params }: Props) {
  const post = await getPostById(params.id);
  if (!post) notFound();
  const allowed = (await getSearchEligiblePosts()).some((item) => item.id === post.id);
  const url = postUrl(post.id);
  const schema = allowed ? {
    '@context': 'https://schema.org',
    '@type': post.responseMode === 'boleh_dibalas' ? 'DiscussionForumPosting' : 'SocialMediaPosting',
    '@id': url,
    url,
    text: post.content,
    datePublished: post.createdAt,
    inLanguage: 'id-ID',
    author: { '@type': 'Person', name: post.authorType === 'pseudonim' ? post.authorAlias : 'Penulis anonim' },
    isPartOf: { '@type': 'WebSite', name: 'Koma', url: SITE_URL },
  } : null;
  return <>
    {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />}
    <PostPageClient params={params} initialPost={post} />
  </>;
}
