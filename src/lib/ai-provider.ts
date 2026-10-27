import OpenAI from 'openai';

// Server-only check: never expose API keys to the browser
if (typeof window !== 'undefined') {
  throw new Error('AI Provider can only be executed on the server side.');
}

export type StudioCategory =
  | 'random_thoughts'
  | 'humor_receh'
  | 'questions'
  | 'discussion_topics'
  | 'rewrite_shorten';

export interface StudioGenerationParams {
  category: StudioCategory;
  inputPrompt?: string;
  draftContent?: string; // used for 'rewrite_shorten'
}

export interface StudioGenerationResult {
  suggestions: [string, string, string];
  category: StudioCategory;
  modelUsed: string;
  source: 'primary';
}

export class StudioUnavailableError extends Error {
  constructor() {
    super('Studio AI belum tersedia. Coba lagi nanti.');
    this.name = 'StudioUnavailableError';
  }
}

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) return null;

  return new OpenAI({
    baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: apiKey,
    timeout: 10000, // 10 seconds timeout
    maxRetries: 0, // We handle fallback explicitly
  });
}

function buildPrompt(category: StudioCategory, inputPrompt?: string, draftContent?: string): string {
  const instructions = `
Kamu adalah asisten kurasi zine digital anonim Indonesia bernama "Koma".
Tugasmu: Buat TEPAT 3 (TIGA) variasi tulisan singkat dalam Bahasa Indonesia.

Kategori yang diminta: ${category}
${inputPrompt ? `Topik / Kata Kunci Pengguna: "${inputPrompt}"` : ''}
${draftContent ? `Draft teks yang perlu ditulis ulang & dipersingkat: "${draftContent}"` : ''}

Pedoman Gaya Bahasa & Nada:
- Nada bicara: Casual, witty, hangat, santai, percakapan manusiawi (conversational).
- HINDARI jargon korporat, kalimat klise motivasi palsu, atau bahasa terjemahan kaku.
- Gunakan bahasa sehari-hari yang wajar (ga lebay, ga kaku, berbobot).
- Setiap variasi panjangnya antara 1 sampai 3 kalimat (maksimal 220 karakter).
- Format output: Kembalikan persis format JSON berikut TANPA teks pendahulu atau pembungkus lain:
{"suggestions": ["saran pertama", "saran kedua", "saran ketiga"]}
`.trim();

  return instructions;
}

function parseAndValidateSuggestions(rawText: string): [string, string, string] | null {
  try {
    // Only a complete JSON response with exactly three short strings is accepted.
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed?.suggestions) && parsed.suggestions.length === 3 &&
        parsed.suggestions.every((s: unknown) => typeof s === 'string' && s.trim().length > 5 && s.length <= 220)) {
      return parsed.suggestions.map((s: string) => s.trim()) as [string, string, string];
    }
  } catch {
    // Invalid or incomplete provider output is not a successful generation.
  }
  return null;
}

export async function generateStudioSuggestions(
  params: StudioGenerationParams
): Promise<StudioGenerationResult> {
  const { category, inputPrompt, draftContent } = params;
  const primaryModel = process.env.AI_MODEL?.trim();
  if (!process.env.AI_API_KEY?.trim() || !primaryModel) throw new StudioUnavailableError();

  try {
    const client = getOpenAIClient();
    if (!client) throw new StudioUnavailableError();
    const completion = await client.chat.completions.create({
      model: primaryModel,
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah asisten studio konten kreatif zine Koma. Balas hanya dengan format JSON: {"suggestions": ["...", "...", "..."]}',
        },
        { role: 'user', content: buildPrompt(category, inputPrompt, draftContent) },
      ],
      temperature: 0.85,
      max_tokens: 650,
    });

    const validated = parseAndValidateSuggestions(completion.choices[0]?.message?.content || '');
    if (!validated) throw new Error('Invalid studio response');
    return { suggestions: validated, category, modelUsed: primaryModel, source: 'primary' };
  } catch (error) {
    // Do not log prompts, provider response bodies or credentials.
    console.error('[AI Studio] provider failure', {
      type: error instanceof Error ? error.name : 'UnknownError',
      status: error instanceof OpenAI.APIError ? error.status : undefined,
    });
    throw new StudioUnavailableError();
  }
}

/**
 * Separate Image Generation Provider
 * Decoupled from text generation; only invoked when explicitly configured.
 */
export async function generateAIImage(prompt: string): Promise<string | null> {
  const imageBaseUrl = process.env.AI_IMAGE_BASE_URL || process.env.AI_BASE_URL;
  const imageApiKey = process.env.AI_IMAGE_API_KEY || process.env.AI_API_KEY;
  const imageModel = process.env.AI_IMAGE_MODEL;

  if (!imageApiKey || !imageModel) {
    return null;
  }

  try {
    const client = new OpenAI({
      baseURL: imageBaseUrl,
      apiKey: imageApiKey,
      timeout: 20000,
    });

    const response = await client.images.generate({
      model: imageModel,
      prompt: `Analog Indonesian zine Risograph style artwork: ${prompt}`,
      n: 1,
      size: '512x512',
    });

    return response.data?.[0]?.url || null;
  } catch (err) {
    console.warn('[AI Image] Generation failed:', err);
    return null;
  }
}
