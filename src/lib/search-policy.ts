import type { Post } from '@/types';

export const SITE_URL = 'https://ruangkoma.web.id';
export const ARCHIVE_PAGE_SIZE = 20;

// A conservative publication gate, not a general profanity filter. A false positive
// only withholds search discovery; it never removes a published community post.
export function searchExclusion(post: Pick<Post, 'content' | 'moderationState' | 'isHidden' | 'searchConsent' | 'reportCount' | 'isAiGenerated' | 'imageUrl'>): string | null {
  if (post.moderationState !== 'published' || post.isHidden) return 'moderasi';
  if (post.searchConsent !== true) return 'tanpa izin pencarian';
  if (post.reportCount > 0) return 'dilaporkan';
  if (post.isAiGenerated) return 'dibantu AI';
  // Image moderation is separate from text moderation; avoid syndicating images
  // whose visual content cannot be screened by this text-only search gate.
  if (post.imageUrl) return 'foto unggahan';
  const content = post.content.trim();
  if (content.length < 120 || content.split(/\s+/u).length < 20) return 'konten pendek';
  if (/https?:\/\/|www\.|(?:\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b)|(?:\+?62|0)8[\d\s().-]{8,}|\b\d{16}\b/iu.test(content)) return 'tautan atau data pribadi';
  if (/(.)\1{12,}/u.test(content)) return 'pola berulang';
  // Avoid automatically syndicating safety-sensitive disclosures to search.
  if (/\b(?:bunuh diri|ingin mati|melukai diri|self harm|pemerkosaan|kekerasan seksual|alamat rumah|nomor ktp)\b/iu.test(content)) return 'perlu tinjauan privasi';
  return null;
}

export function eligiblePosts(posts: Post[]): Post[] {
  const seen = new Set<string>();
  return [...posts].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)).filter((post) => {
    if (searchExclusion(post)) return false;
    const fingerprint = post.content.toLocaleLowerCase('id-ID').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
    if (seen.has(fingerprint)) return false;
    seen.add(fingerprint);
    return true;
  }).reverse();
}

export function postUrl(id: string): string {
  return `${SITE_URL}/coretan/${encodeURIComponent(id)}`;
}
