import crypto from 'crypto';

export const PRESET_ARTWORKS = [
  '/assets/section-writing.webp',
  '/assets/section-discovering.webp',
  '/assets/section-connecting.webp',
  '/assets/hero-main.webp',
];

const TOKEN_LIFETIME_MS = 15 * 60 * 1000;

function signingKey(): string | null {
  return process.env.IMAGE_UPLOAD_SIGNING_SECRET?.trim() || null;
}

export function signImageUpload(url: string, sessionId: string): string {
  const key = signingKey();
  if (!key) throw new Error('Image upload signing secret missing');
  const expires = String(Date.now() + TOKEN_LIFETIME_MS);
  const signature = crypto.createHmac('sha256', key).update(`${sessionId}\n${url}\n${expires}`).digest('hex');
  return `${expires}.${signature}`;
}

export function isAllowedImage(url: unknown, token: unknown, sessionId: string): boolean {
  if (url === undefined || url === null || url === '') return true;
  if (typeof url !== 'string') return false;
  if (PRESET_ARTWORKS.includes(url)) return true;
  const key = signingKey();
  if (!key || typeof token !== 'string' || !/^\d{13}\.[a-f0-9]{64}$/.test(token)) return false;
  const [expires, signature] = token.split('.');
  if (Number(expires) < Date.now() || Number(expires) > Date.now() + TOKEN_LIFETIME_MS) return false;
  try {
    const parsed = new URL(url);
    // Only accept images from Koma's moderated public store, not arbitrary
    // public Vercel Blob URLs minted elsewhere.
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'hmpot4xs7ppc9ux4.public.blob.vercel-storage.com' || !parsed.pathname.startsWith('/koma/uploads/')) return false;
  } catch { return false; }
  const expected = crypto.createHmac('sha256', key).update(`${sessionId}\n${url}\n${expires}`).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}
