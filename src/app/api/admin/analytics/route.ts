import { NextRequest, NextResponse } from 'next/server';
import { getAdminAnalyticsSummary, getAdminDetailedAnalytics, getSearchVisibilitySummary } from '@/lib/storage';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
    }

    const period = (request.nextUrl.searchParams.get('period') as any) || '7d';
    const validPeriod = ['24h', '7d', '30d', 'all'].includes(period) ? period : '7d';

    const summary = await getAdminAnalyticsSummary();
    const detailed = await getAdminDetailedAnalytics(validPeriod);
    const searchVisibility = await getSearchVisibilitySummary();

    return NextResponse.json({
      success: true,
      analytics: summary,
      detailed,
      searchVisibility,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memuat analitik admin' },
      { status: 500 }
    );
  }
}
