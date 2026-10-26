import { NextRequest, NextResponse } from 'next/server';
import { addReaction, getPostById } from '@/lib/storage';
import { checkRateLimit } from '@/lib/validation';
import { ReactionType } from '@/types';
import { getOrCreateSessionId, applySessionCookie } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const { sessionId, isNew } = getOrCreateSessionId(request);
    const ip = request.headers.get('x-forwarded-for') || sessionId;

    const rate = checkRateLimit(ip, 'reaction');
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak reaksi.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { reaction } = body;

    const validReactions: ReactionType[] = ['dengerin', 'relate', 'senyum', 'peluk'];
    if (!validReactions.includes(reaction)) {
      return NextResponse.json(
        { success: false, error: 'Jenis reaksi tidak valid' },
        { status: 400 }
      );
    }

    if (!await getPostById(postId)) return NextResponse.json({ success: false, error: 'Coretan tidak tersedia.' }, { status: 404 });
    const updated = await addReaction(postId, reaction, sessionId);
    const response = NextResponse.json({
      success: true,
      reactions: updated.reactions,
      userReactions: updated.userReactions,
    });

    if (isNew) applySessionCookie(response, sessionId);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menambahkan reaksi' },
      { status: 500 }
    );
  }
}
