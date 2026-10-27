import { SITE_URL } from './search-policy';

export type SearchMetric = { clicks: number; impressions: number; ctr: number };
export type SearchRow = SearchMetric & { label: string };
export type SearchConsoleReport = {
  status: 'not_configured' | 'available' | 'error';
  message: string;
  totals: SearchMetric | null;
  pages: SearchRow[];
  queries: SearchRow[];
  sitemap: { submitted: boolean; errors: number | null; warnings: number | null; submittedUrls: number | null; indexedUrls: number | null } | null;
};

function metric(row: Record<string, unknown>): SearchMetric {
  if (typeof row.clicks !== 'number' || typeof row.impressions !== 'number' || typeof row.ctr !== 'number') {
    throw new Error('Unexpected Search Console metrics');
  }
  return { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr };
}

export async function getGoogleSearchConsoleReport(): Promise<SearchConsoleReport> {
  const token = process.env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN?.trim();
  const property = process.env.GOOGLE_SEARCH_CONSOLE_PROPERTY?.trim();
  const empty: SearchConsoleReport = { status: 'not_configured', message: 'Token akses baca-saja dan properti Google Search Console belum dikonfigurasi.', totals: null, pages: [], queries: [], sitemap: null };
  if (!token || !property) return empty;
  const base = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}`;
  const today = new Date();
  const end = new Date(today.getTime() - 3 * 86400000).toISOString().slice(0, 10);
  const start = new Date(today.getTime() - 30 * 86400000).toISOString().slice(0, 10);
  const auth = { Authorization: `Bearer ${token}` };
  const query = async (dimensions: string[]) => {
    const response = await fetch(`${base}/searchAnalytics/query`, {
      method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: start, endDate: end, type: 'web', dimensions, rowLimit: 25 }),
      cache: 'no-store', signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`Search Console HTTP ${response.status}`);
    return (await response.json()) as { rows?: Array<Record<string, unknown> & { keys?: string[] }> };
  };
  try {
    const [summary, pages, queries, sitemapResponse] = await Promise.all([
      query([]), query(['page']), query(['query']),
      fetch(`${base}/sitemaps`, { headers: auth, cache: 'no-store', signal: AbortSignal.timeout(8000) }),
    ]);
    if (!sitemapResponse.ok) throw new Error(`Sitemap HTTP ${sitemapResponse.status}`);
    const sitemaps = (await sitemapResponse.json()) as { sitemap?: Array<{ path?: string; errors?: string; warnings?: string; contents?: Array<{ type?: string; submitted?: string; indexed?: string }> }> };
    const submitted = sitemaps.sitemap?.find((item) => item.path === `${SITE_URL}/sitemap.xml`);
    const urls = submitted?.contents?.find((item) => item.type === 'web');
    const numberOrNull = (value: string | undefined) => value !== undefined && Number.isFinite(Number(value)) ? Number(value) : null;
    return {
      status: 'available', message: `Data Search Console (${start}–${end}); angka indeks hanya tersedia jika dilaporkan oleh API sitemap.`,
      totals: summary.rows?.[0] ? metric(summary.rows[0]) : { clicks: 0, impressions: 0, ctr: 0 },
      pages: (pages.rows || []).filter((row) => typeof row.keys?.[0] === 'string' && row.keys[0].startsWith(SITE_URL + '/')).map((row) => ({ label: row.keys![0], ...metric(row) })),
      queries: (queries.rows || []).filter((row) => typeof row.keys?.[0] === 'string').map((row) => ({ label: row.keys![0], ...metric(row) })),
      sitemap: { submitted: Boolean(submitted), errors: numberOrNull(submitted?.errors), warnings: numberOrNull(submitted?.warnings), submittedUrls: numberOrNull(urls?.submitted), indexedUrls: numberOrNull(urls?.indexed) },
    };
  } catch {
    return { ...empty, status: 'error', message: 'Search Console tidak dapat dibaca. Periksa izin properti, token OAuth, dan koneksi; tidak ada metrik yang diasumsikan.' };
  }
}

export type BingSearchReport = { status: 'not_configured' | 'available' | 'error'; message: string; totals: SearchMetric | null };
export async function getBingSearchReport(): Promise<BingSearchReport> {
  const key = process.env.BING_WEBMASTER_API_KEY?.trim();
  if (!key) return { status: 'not_configured', message: 'Kunci Bing Webmaster Tools belum dikonfigurasi.', totals: null };
  try {
    const endpoint = new URL('https://ssl.bing.com/webmaster/api.svc/json/GetRankAndTrafficStats');
    endpoint.searchParams.set('apikey', key);
    endpoint.searchParams.set('url', `${SITE_URL}/`);
    const response = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Bing Webmaster unavailable');
    const result = (await response.json()) as { d?: Array<{ Date?: string; Clicks?: number; Impressions?: number }> };
    if (!Array.isArray(result.d) || result.d.some((row) => !row || typeof row.Clicks !== 'number' || typeof row.Impressions !== 'number' || typeof row.Date !== 'string')) {
      throw new Error('Unexpected Bing response');
    }
    const start = Date.now() - 30 * 86400000;
    const recent = result.d.filter((row) => {
      const raw = row.Date || '';
      const timestamp = /^\/Date\(\d+/.test(raw) ? Number(raw.match(/^\/Date\((\d+)/)?.[1]) : new Date(raw).getTime();
      return Number.isFinite(timestamp) && timestamp >= start;
    });
    const clicks = recent.reduce((sum, row) => sum + (Number(row.Clicks) || 0), 0);
    const impressions = recent.reduce((sum, row) => sum + (Number(row.Impressions) || 0), 0);
    return { status: 'available', message: 'Bing Webmaster: 30 hari terakhir (rank dan trafik pencarian). Sitasi Copilot tidak tersedia sebagai metrik terpisah.', totals: { clicks, impressions, ctr: impressions ? clicks / impressions : 0 } };
  } catch {
    return { status: 'error', message: 'Bing Webmaster tidak dapat dibaca; periksa akses API dan properti situs.', totals: null };
  }
}
