import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { getAdminMessages, markAdminMessageRead } from '@/lib/storage';

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
  try {
    const messages = await getAdminMessages();
    return NextResponse.json({ success: true, messages }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal memuat pesan.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdminAuth(request)) return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ success: false, error: 'Permintaan tidak diizinkan.' }, { status: 403 });
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || !('id' in body) || typeof body.id !== 'string' || !/^msg-[0-9a-f-]{36}$/.test(body.id)) {
      return NextResponse.json({ success: false, error: 'ID pesan tidak valid.' }, { status: 400 });
    }
    const found = await markAdminMessageRead(body.id);
    if (!found) return NextResponse.json({ success: false, error: 'Pesan tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal menandai pesan.' }, { status: 500 });
  }
}
