import crypto from 'crypto';
import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { moderateImage } from '@/lib/image-moderation';
import { signImageUpload } from '@/lib/image-upload';
import { getOrCreateSessionId, applySessionCookie } from '@/lib/session';
import { checkRateLimit } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // This token belongs to the dedicated public store; the unprefixed token may
  // point to the existing private store, which cannot serve post images.
  const blobToken = process.env.KOMA_PUBLIC_READ_WRITE_TOKEN?.trim();
  const signingSecret = process.env.IMAGE_UPLOAD_SIGNING_SECRET?.trim();
  if (!blobToken || !signingSecret) {
    return NextResponse.json({ success: false, error: 'Unggah gambar belum tersedia.' }, { status: 503 });
  }

  const { sessionId } = getOrCreateSessionId(request);
  const rate = checkRateLimit(sessionId, 'upload');
  if (!rate.allowed) {
    return NextResponse.json({ success: false, error: `Terlalu banyak unggahan. Coba lagi dalam ${rate.resetInSec} detik.` }, { status: 429 });
  }
  if (Number(request.headers.get('content-length')) > 6 * 1024 * 1024) {
    return NextResponse.json({ success: false, error: 'Berkas terlalu besar (maksimal 5 MB).' }, { status: 413 });
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'Pilih satu gambar untuk diunggah.' }, { status: 400 });
    }
    const result = await moderateImage(file);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }

    // Public storage is reachable immediately, so no unreviewed bytes may be put here.
    const blob = await put(`koma/uploads/${crypto.randomUUID()}.webp`, result.image, {
      access: 'public',
      contentType: 'image/webp',
      token: blobToken,
      addRandomSuffix: false,
    });
    const response = NextResponse.json({ success: true, url: blob.url, uploadToken: signImageUpload(blob.url, sessionId) });
    applySessionCookie(response, sessionId);
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal menyimpan gambar. Coba lagi nanti.' }, { status: 500 });
  }
}
