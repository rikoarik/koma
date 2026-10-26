import { NextRequest, NextResponse } from 'next/server';
import { addReply } from '@/lib/storage';
import { checkRateLimit } from '@/lib/validation';
import { getOrCreateSessionId, applySessionCookie } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const { sessionId, isNew } = getOrCreateSessionId(request);
    const ip = request.headers.get('x-forwarded-for') || sessionId;

    const rate = checkRateLimit(ip, 'reply');
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: `Harap tunggu ${rate.resetInSec} detik sebelum membalas lagi.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { content, authorAlias, authorType, isAiGenerated } = body;

    if (typeof content !== 'string' || content.trim().length < 2 || content.trim().length > 1000 || (authorAlias !== undefined && typeof authorAlias !== 'string') || (authorType && !['tanpa_nama', 'pseudonim'].includes(authorType))) {
      return NextResponse.json(
        { success: false, error: 'Balasan terlalu pendek (minimal 2 karakter).' },
        { status: 400 }
      );
    }

    const result = await addReply(
      postId,
      {
        content,
        authorAlias,
        authorType,
        isAiGenerated,
      },
      sessionId
    );

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const response = NextResponse.json({ success: true, reply: result.reply, moderation: result.moderation }, { status: 201 });
    if (isNew) applySessionCookie(response, sessionId);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Gagal mengirim balasan. Coba lagi nanti.' },
      { status: 500 }
    );
  }
}
