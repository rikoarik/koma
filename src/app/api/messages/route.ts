import { NextRequest, NextResponse } from 'next/server';
import { adminMessageInput } from '@/lib/admin-message-input';
import { createAdminMessage } from '@/lib/storage';
import { applySessionCookie, getOrCreateSessionId } from '@/lib/session';
import { checkRateLimit } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json({ success: false, error: 'Permintaan tidak diizinkan.' }, { status: 403 });
    }
    if (Number(request.headers.get('content-length') || 0) > 5000) {
      return NextResponse.json({ success: false, error: 'Pesan terlalu panjang.' }, { status: 413 });
    }
    const raw = await request.text();
    if (raw.length > 5000) return NextResponse.json({ success: false, error: 'Pesan terlalu panjang.' }, { status: 413 });
    let body: unknown;
    try { body = JSON.parse(raw); } catch {
      return NextResponse.json({ success: false, error: 'Format pesan tidak valid.' }, { status: 400 });
    }
    const parsed = adminMessageInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Pesan tidak valid.' }, { status: 400 });
    }
    const { sessionId, isNew } = getOrCreateSessionId(request);
    if (!checkRateLimit(sessionId, 'message').allowed) {
      return NextResponse.json({ success: false, error: 'Terlalu banyak pesan. Coba lagi nanti.' }, { status: 429 });
    }
    const result = await createAdminMessage(parsed.data, sessionId);
    if (result === 'limited') {
      return NextResponse.json({ success: false, error: 'Batas tiga pesan per jam tercapai. Coba lagi nanti.' }, { status: 429 });
    }
    const response = NextResponse.json({ success: true }, { status: 201 });
    if (isNew) applySessionCookie(response, sessionId);
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Pesan belum terkirim. Coba lagi nanti.' }, { status: 500 });
  }
}
