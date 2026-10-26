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
    const { prompt, tone, topic, category } = body;

    // Map old tone/topic to new StudioCategory if needed
    let resolvedCategory: StudioCategory = 'random_thoughts';
    if (category) {
      resolvedCategory = category;
    } else if (tone === 'lucu') {
      resolvedCategory = 'humor_receh';
    } else if (topic === 'tanya-tanpa-nama') {
      resolvedCategory = 'questions';
    }

    const result = await generateStudioSuggestions({
      category: resolvedCategory,
      inputPrompt: prompt,
    });

    return NextResponse.json({
      success: true,
      data: {
        text: result.suggestions[0],
        suggestions: result.suggestions,
        topic: topic || 'isi-kepala',
        tone: tone || 'reflektif',
        suggestedPrompt: prompt,
        modelUsed: result.modelUsed,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memproses inspirasi AI' },
      { status: 500 }
    );
  }
}
