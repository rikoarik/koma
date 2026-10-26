import { NextRequest, NextResponse } from 'next/server';
import { getFilteredPosts, createPost } from '@/lib/storage';
import { checkRateLimit, validatePostContent, extractTopicFromContent } from '@/lib/validation';
import { FeedFilter } from '@/types';
import { getOrCreateSessionId, applySessionCookie, generateAuthorSecret } from '@/lib/session';
import { isAllowedImage } from '@/lib/image-upload';

export async function GET(request: NextRequest) {
  try {
    const { sessionId, isNew } = getOrCreateSessionId(request);
    const searchParams = request.nextUrl.searchParams;
    const filter = (searchParams.get('filter') as FeedFilter) || 'terbaru';
    const topic = searchParams.get('topic') || undefined;
    const search = searchParams.get('search') || undefined;

    const posts = await getFilteredPosts(filter, topic, search, sessionId);
    const response = NextResponse.json({ success: true, posts, totalCount: posts.length });

    if (isNew) {
      applySessionCookie(response, sessionId);
    }
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memuat kiriman' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, isNew } = getOrCreateSessionId(request);
    const ip = request.headers.get('x-forwarded-for') || sessionId;

    // Check rate limit
    const rate = checkRateLimit(ip, 'post');
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Terlalu cepat. Harap tunggu ${rate.resetInSec} detik sebelum mengirim lagi.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { content, authorAlias, authorType, topic, responseMode, imageUrl, uploadToken, isAiGenerated, aiPrompt, paperColor, searchConsent } = body;
    if (searchConsent !== undefined && typeof searchConsent !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Izin pencarian tidak valid.' }, { status: 400 });
    }
    if (typeof content !== 'string' || (authorAlias !== undefined && typeof authorAlias !== 'string') || (authorType && !['tanpa_nama', 'pseudonim'].includes(authorType)) || (responseMode && !['boleh_dibalas', 'cukup_didengar'].includes(responseMode)) || (aiPrompt && (typeof aiPrompt !== 'string' || aiPrompt.length > 2000))) {
      return NextResponse.json({ success: false, error: 'Isi coretan tidak valid.' }, { status: 400 });
    }

    // Content validation (length, format)
    const validation = validatePostContent(content || '');
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    if (!isAllowedImage(imageUrl, uploadToken, sessionId)) {
      return NextResponse.json({ success: false, error: 'Gambar belum diverifikasi atau izin unggahan sudah kedaluwarsa.' }, { status: 400 });
    }

    const resolvedTopic = extractTopicFromContent(content || '', typeof topic === 'string' ? topic : 'isi-kepala');

    const authorSecret = generateAuthorSecret();
    const result = await createPost(
      {
        content,
        authorAlias,
        authorType,
        topic: resolvedTopic,
        responseMode,
        imageUrl,
        isAiGenerated,
        aiPrompt,
        paperColor,
        searchConsent: searchConsent === true,
      },
      sessionId,
      authorSecret,
      uploadToken
    );

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status || 400 });
    }

    const response = NextResponse.json(
      { success: true, post: result.post, moderation: result.moderation, authorSecret },
      { status: 201 }
    );

    applySessionCookie(response, sessionId);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan kiriman. Coba lagi nanti.' },
      { status: 500 }
    );
  }
}
