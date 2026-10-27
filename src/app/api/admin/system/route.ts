import { NextRequest, NextResponse } from 'next/server';
import { getSystemHealth, logAdminAudit } from '@/lib/storage';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { generateStudioSuggestions, StudioUnavailableError } from '@/lib/ai-provider';

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
    }

    const health = await getSystemHealth();
    return NextResponse.json({ success: true, ...health });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memuat status sistem' },
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
    const { action } = body;

    if (action === 'test_ai') {
      const startTime = Date.now();
      try {
        const result = await generateStudioSuggestions({
          category: 'random_thoughts',
          inputPrompt: 'uji koneksi dasbor pengelola',
        });
        const latencyMs = Date.now() - startTime;

        await logAdminAudit(
          'AI_TEST_PING',
          'ai_engine',
          `Uji koneksi AI berhasil: ${result.source} (${result.modelUsed}) dalam ${latencyMs}ms`
        );

        return NextResponse.json({
          success: true,
          status: 'ok',
          latencyMs,
          source: result.source,
          modelUsed: result.modelUsed,
          sampleResult: result.suggestions[0],
        });
      } catch (err: any) {
        const latencyMs = Date.now() - startTime;
        await logAdminAudit(
          'AI_TEST_FAILED',
          'ai_engine',
          `Uji koneksi AI gagal (${latencyMs}ms): ${err?.message || 'Unknown error'}`
        );
        return NextResponse.json({
          success: false,
          status: 'error',
          latencyMs,
          error: err instanceof StudioUnavailableError ? err.message : 'Gagal menghubungi penyedia AI',
        }, { status: 503 });
      }
    }

    return NextResponse.json({ success: false, error: 'Tindakan tidak dikenal' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memproses permintaan' },
      { status: 500 }
    );
  }
}
