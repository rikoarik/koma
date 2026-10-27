import { NextRequest, NextResponse } from 'next/server';
import { updatePost, deletePost, getPostById, withdrawSearchConsent } from '@/lib/storage';
import { getOrCreateSessionId, applySessionCookie } from '@/lib/session';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const { sessionId, isNew } = getOrCreateSessionId(request);

    const post = await getPostById(postId, sessionId);
    if (!post) {
      return NextResponse.json({ success: false, error: 'Coretan tidak ditemukan' }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, post });
    if (isNew) applySessionCookie(response, sessionId);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memuat coretan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const { sessionId, isNew } = getOrCreateSessionId(request);
    const body = await request.json();
    const { content, authorSecret, withdrawSearch } = body;
    if (typeof authorSecret !== 'undefined' && typeof authorSecret !== 'string') return NextResponse.json({ success: false, error: 'Kunci penulis tidak valid.' }, { status: 400 });
    if (withdrawSearch === true && content === undefined) {
      const withdrawn = await withdrawSearchConsent(postId, sessionId, authorSecret);
      if (!withdrawn) return NextResponse.json({ success: false, error: 'Coretan tidak ditemukan atau akses ditolak.' }, { status: 403 });
      const response = NextResponse.json({ success: true, message: 'Izin pencarian dicabut.' }, { headers: { 'Cache-Control': 'no-store' } });
      if (isNew) applySessionCookie(response, sessionId);
      return response;
    }
    if (withdrawSearch !== undefined || typeof content !== 'string') return NextResponse.json({ success: false, error: 'Isi coretan tidak valid.' }, { status: 400 });

    const result = await updatePost(postId, content, sessionId, authorSecret);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 403 });
    }

    const response = NextResponse.json({ success: true, moderation: result.moderation, message: result.moderation?.state === 'published' ? 'Coretan berhasil diperbarui.' : 'Perubahan disimpan dan menunggu peninjauan.' });
    if (isNew) applySessionCookie(response, sessionId);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Gagal menyunting coretan. Coba lagi nanti.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const { sessionId, isNew } = getOrCreateSessionId(request);
    const authorSecret = request.nextUrl.searchParams.get('secret') || undefined;

    const result = await deletePost(postId, sessionId, authorSecret);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 403 });
    }

    const response = NextResponse.json({ success: true, message: 'Coretan berhasil dihapus.' });
    if (isNew) applySessionCookie(response, sessionId);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menghapus coretan' },
      { status: 500 }
    );
  }
}
