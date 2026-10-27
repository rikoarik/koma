import { NextRequest, NextResponse } from 'next/server';
import { generateStudioSuggestions, StudioUnavailableError } from '@/lib/ai-provider';
import { checkRateLimit } from '@/lib/validation';
import { z } from 'zod';

const requestSchema = z.object({
  category: z.enum(['random_thoughts', 'humor_receh', 'questions', 'discussion_topics', 'rewrite_shorten']),
  inputPrompt: z.string().max(300).optional(),
  draftContent: z.string().max(1000).optional(),
}).strict().refine((value) => value.category !== 'rewrite_shorten' || Boolean(value.draftContent?.trim()));

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
    const result = await generateStudioSuggestions(body.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof StudioUnavailableError ? error.message : 'Gagal memproses inspirasi studio AI.' },
      { status: error instanceof StudioUnavailableError ? 503 : 400 }
    );
  }
}
