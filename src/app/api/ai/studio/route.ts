import { NextRequest, NextResponse } from 'next/server';
import { generateStudioSuggestions, StudioCategory } from '@/lib/ai-provider';
import { checkRateLimit } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous-user';
    const rate = checkRateLimit(ip, 'ai');
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: `Batas studio tercapai. Tunggu ${rate.resetInSec} detik.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { category, inputPrompt, draftContent } = body;

    const validCategories: StudioCategory[] = [
      'random_thoughts',
      'humor_receh',
      'questions',
      'discussion_topics',
      'rewrite_shorten',
    ];

    const resolvedCategory: StudioCategory = validCategories.includes(category)
      ? category
      : 'random_thoughts';

    const result = await generateStudioSuggestions({
      category: resolvedCategory,
      inputPrompt: typeof inputPrompt === 'string' ? inputPrompt.slice(0, 300) : undefined,
      draftContent: typeof draftContent === 'string' ? draftContent.slice(0, 1000) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[AI Studio Route Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memproses inspirasi studio AI.' },
      { status: 500 }
    );
  }
}
