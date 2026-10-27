import { NextRequest, NextResponse } from 'next/server';
import { getAdminAnalyticsSummary, getAdminDetailedAnalytics, getSearchVisibilitySummary } from '@/lib/storage';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { getGoogleSearchConsoleReport, getBingSearchReport } from '@/lib/search-console';

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 401, headers: { 'Cache-Control': 'private, no-store' } });
    }

    const period = (request.nextUrl.searchParams.get('period') as any) || '7d';
    const validPeriod = ['24h', '7d', '30d', 'all'].includes(period) ? period : '7d';

    const summary = await getAdminAnalyticsSummary();
    const detailed = await getAdminDetailedAnalytics(validPeriod);
    const [searchVisibility, googleSearch, bingSearch] = await Promise.all([
      getSearchVisibilitySummary(), getGoogleSearchConsoleReport(), getBingSearchReport(),
    ]);

    return NextResponse.json({
      success: true,
      analytics: summary,
      detailed,
      searchVisibility: { ...searchVisibility, googleSearch, bingSearch },
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memuat analitik admin' },
      { status: 500, headers: { 'Cache-Control': 'private, no-store' } }
    );
  }
}
