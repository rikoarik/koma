import { NextRequest, NextResponse } from 'next/server';
import { generateStudioSuggestions, StudioUnavailableError } from '@/lib/ai-provider';
import { checkRateLimit } from '@/lib/validation';
import { z } from 'zod';

const requestSchema = z.object({
  prompt: z.string().max(300).optional(),
  tone: z.enum(['lucu', 'puitis', 'santai', 'reflektif']).optional(),
  topic: z.string().max(100).optional(),
  category: z.enum(['random_thoughts', 'humor_receh', 'questions', 'discussion_topics']).optional(),
}).strict();

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

    const body = requestSchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ success: false, error: 'Permintaan studio tidak valid.' }, { status: 400 });
    }
    const { prompt, tone, topic, category } = body.data;
    const resolvedCategory = category || (tone === 'lucu' ? 'humor_receh' : topic === 'tanya-tanpa-nama' ? 'questions' : 'random_thoughts');

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
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof StudioUnavailableError ? error.message : 'Gagal memproses inspirasi AI' },
      { status: error instanceof StudioUnavailableError ? 503 : 400 }
    );
  }
}
