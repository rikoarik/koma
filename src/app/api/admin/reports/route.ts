import { NextRequest, NextResponse } from 'next/server';
import { getAdminModerationQueue, resolveAdminReport } from '@/lib/storage';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
    }

    const queue = await getAdminModerationQueue();
    return NextResponse.json({ success: true, reports: queue });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memuat antrean laporan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
    }

    const body = await request.json();
    const { reportId, action } = body;
    if (typeof reportId !== 'string' || !['DISMISSED', 'RESOLVED_HIDE', 'RESOLVED_DELETE', 'PUBLISH'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Tindakan tidak valid.' }, { status: 400 });
    }

    const ok = await resolveAdminReport(reportId, action);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Laporan berhasil ditindaklanjuti.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Gagal memproses laporan.' },
      { status: 500 }
    );
  }
}
