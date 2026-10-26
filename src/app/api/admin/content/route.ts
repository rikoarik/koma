import { NextRequest, NextResponse } from 'next/server';
import { getAllPostsForAdmin, adminUpdatePost, adminDeletePost } from '@/lib/storage';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const search = searchParams.get('search') || undefined;
    const topic = searchParams.get('topic') || undefined;
    const status = (searchParams.get('status') as any) || 'all';
    const sortBy = (searchParams.get('sortBy') as any) || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as any) || 'desc';

    const result = await getAllPostsForAdmin({
      page,
      limit,
      search,
      topic,
      status,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memuat daftar coretan' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, isHidden, isPinned, moderationState } = body;

    if (typeof postId !== 'string' || !postId || (isHidden !== undefined && typeof isHidden !== 'boolean') || (isPinned !== undefined && typeof isPinned !== 'boolean')) {
      return NextResponse.json({ success: false, error: 'Parameter coretan tidak valid.' }, { status: 400 });
    }

    if (moderationState !== undefined && !['published', 'held_for_review', 'removed'].includes(moderationState)) {
      return NextResponse.json({ success: false, error: 'Status moderasi tidak valid.' }, { status: 400 });
    }
    const ok = await adminUpdatePost(postId, { isHidden, isPinned, moderationState });
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Coretan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Status coretan berhasil diperbarui.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memperbarui coretan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
    }

    const idFromQuery = request.nextUrl.searchParams.get('id');
    let postId = idFromQuery;
    if (!postId) {
      try {
        const body = await request.json();
        postId = body.postId;
      } catch {}
    }

    if (!postId) {
      return NextResponse.json({ success: false, error: 'ID coretan diperlukan' }, { status: 400 });
    }

    const ok = await adminDeletePost(postId);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Coretan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Coretan berhasil dihapus secara permanen.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menghapus coretan' },
      { status: 500 }
    );
  }
}
