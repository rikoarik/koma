import { NextRequest, NextResponse } from 'next/server';
import { reportTarget } from '@/lib/storage';
import { getOrCreateSessionId, applySessionCookie } from '@/lib/session';
import { checkRateLimit } from '@/lib/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const { sessionId, isNew } = getOrCreateSessionId(request);
    const rate = checkRateLimit(sessionId, 'post');
    if (!rate.allowed) return NextResponse.json({ success: false, error: 'Terlalu banyak laporan. Coba lagi nanti.' }, { status: 429 });
    const body = await request.json();
    const { reason, notes, targetType } = body;
    if ((targetType && !['post', 'reply'].includes(targetType)) || (notes !== undefined && (typeof notes !== 'string' || notes.length > 500)) || (reason && !['spam', 'doxxing', 'kebencian', 'kekerasan', 'lainnya'].includes(reason))) {
      return NextResponse.json({ success: false, error: 'Laporan tidak valid.' }, { status: 400 });
    }

    const result = await reportTarget(
      {
        postId,
        targetType: targetType || 'post',
        reason: reason || 'lainnya',
        notes,
      },
      sessionId
    );
    if (!result.success) return NextResponse.json({ success: false, error: 'Konten tidak ditemukan.' }, { status: 404 });

    const response = NextResponse.json({ success: true, message: 'Laporan telah dicatat untuk moderasi.' });
    if (isNew) applySessionCookie(response, sessionId);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Gagal mengirim laporan. Coba lagi nanti.' },
      { status: 500 }
    );
  }
}
