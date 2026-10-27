import crypto from 'node:crypto';
import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { MAX_QRIS_BYTES, prepareQrisImage } from '@/lib/qris-image';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
  }
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return NextResponse.json({ success: false, error: 'Permintaan tidak diizinkan.' }, { status: 403 });
  }
  const token = process.env.KOMA_PUBLIC_READ_WRITE_TOKEN?.trim();
  if (!token) {
    return NextResponse.json({ success: false, error: 'Penyimpanan gambar publik belum dikonfigurasi.' }, { status: 503 });
  }
  if (Number(request.headers.get('content-length')) > MAX_QRIS_BYTES + 1024 * 1024) {
    return NextResponse.json({ success: false, error: 'Gambar terlalu besar (maksimal 5 MB).' }, { status: 413 });
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'Pilih foto QRIS terlebih dahulu.' }, { status: 400 });
    }
    let image: Buffer;
    try {
      image = await prepareQrisImage(file);
    } catch (error) {
      return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Gambar QRIS tidak valid.' }, { status: 400 });
    }
    const blob = await put(`koma/qris/${crypto.randomUUID()}.png`, image, {
      access: 'public',
      contentType: 'image/png',
      token,
      addRandomSuffix: false,
    });
    return NextResponse.json({ success: true, url: blob.url });
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal mengunggah QRIS. Coba lagi.' }, { status: 500 });
  }
}
