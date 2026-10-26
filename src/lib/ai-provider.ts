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
  source: 'primary' | 'fallback_model' | 'curated_bank';
}

// Curated Indonesian authentic seed bank (guaranteed zero-downtime fallback)
const CURATED_STUDIO_BANK: Record<StudioCategory, [string, string, string]> = {
  random_thoughts: [
    'Kadang jam 2 pagi itu bukan soal belum ngantuk, tapi heran kenapa semua hal yang harusnya udah selesai malah antre minta dibahas ulang waktu lampu kamar mati.',
    'Menjadi dewasa ternyata bukan tentang tahu jawaban atas segala hal, tapi belajar tetap tenang saat ga tahu apa-apa.',
    'Pernah ga ngerasa asing sama foto diri sendiri tiga tahun lalu? Bukan mukanya yang beda, tapi tatapan matanya yang dulu masih percaya banyak hal.',
  ],
  humor_receh: [
    'Tadi mau sok misterius jalan kaki malam-malam pakai hoodie, eh malah kesandung paving block copot di depan pos satpam.',
    'Resolusi minggu ini sederhana: jangan buka email kerja setelah jam 8 malam kecuali kantor kebakaran dan aku pemadamnya.',
    'Kekuatan super orang kita: bisa menyimpulkan semua masalah hidup yang ruwet cuma dengan satu kalimat: "Ya namanya juga hidup."',
  ],
  questions: [
    'Kapan terakhir kali kamu ngerasa bener-bener aman buat cerita apa adanya tanpa mikir bakal dihakimi?',
    'Kalau kamu bisa ngirim satu pesan singkat ke diri sendiri lima tahun lalu tanpa penjelasan tambahan, apa yang bakal kamu tulis?',
    'Hal kecil apa hari ini yang bikin kamu diem-diem ngerasa bersyukur masih ada di sini?',
  ],
  discussion_topics: [
    'Kenapa makin dewasa, punya satu teman yang ga nuntut obrolan berbobot itu jauh lebih berharga daripada seratus kenalan?',
    'Momen di mana kamu sadar kalau rumah ternyata bukan lagi sebuah tempat atau bangunan, melainkan orang tertentu.',
    'Cara orang bertahan hidup di kota besar: pura-pura kuat di jam kerja, terus luluh cuma gara-gara lagu lama di radio taksi.',
  ],
  rewrite_shorten: [
    'Gue cuma pengen bilang: capek itu manusiawi. Tarik napas dulu, malam ini simpan dulu bebanmu di sini.',
    'Ternyata ga semua hal harus diselesaikan malam ini. Kadang tidur adalah bentuk perlawanan paling jujur.',
    'Terlalu sibuk kelihatan baik-baik saja sampai lupa cara bernapas lega. Semoga malam ini lebih ramah padamu.',
  ],
};

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.AI_API_KEY;
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
    // 1. Try JSON parsing
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed?.suggestions) && parsed.suggestions.length >= 3) {
      const s0 = String(parsed.suggestions[0]).trim().replace(/^["'\d\.\-\s]+/, '');
      const s1 = String(parsed.suggestions[1]).trim().replace(/^["'\d\.\-\s]+/, '');
      const s2 = String(parsed.suggestions[2]).trim().replace(/^["'\d\.\-\s]+/, '');
      if (s0.length > 5 && s1.length > 5 && s2.length > 5) {
        return [s0, s1, s2];
      }
    }
  } catch {
    // 2. Fallback to line split parsing
    const lines = rawText
      .split('\n')
      .map((l) => l.trim().replace(/^["'\d\.\-\s]+/, '').replace(/["']$/, ''))
      .filter((l) => l.length > 10);

    if (lines.length >= 3) {
      return [lines[0], lines[1], lines[2]];
    }
  }
  return null;
}

export async function generateStudioSuggestions(
  params: StudioGenerationParams
): Promise<StudioGenerationResult> {
  const { category, inputPrompt, draftContent } = params;
  const client = getOpenAIClient();

  const primaryModel = process.env.AI_MODEL;
  const fallbackModel = process.env.AI_FALLBACK_MODEL;
  const systemPrompt = buildPrompt(category, inputPrompt, draftContent);

  // 1. Attempt Primary Model
  if (client && primaryModel) {
    try {
      const completion = await client.chat.completions.create({
        model: primaryModel,
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah asisten studio konten kreatif zine Koma. Balas hanya dengan format JSON: {"suggestions": ["...", "...", "..."]}',
          },
          { role: 'user', content: systemPrompt },
        ],
        temperature: 0.85,
        max_tokens: 350,
      });

      const text = completion.choices[0]?.message?.content || '';
      const validated = parseAndValidateSuggestions(text);
      if (validated) {
        return {
          suggestions: validated,
          category,
          modelUsed: primaryModel,
          source: 'primary',
        };
      }
    } catch (primaryErr) {
      console.warn(`[AI Studio] Primary model (${primaryModel}) failed:`, (primaryErr as any)?.message || primaryErr);
    }
  }

  // 2. Attempt Fallback Model
  if (client && fallbackModel && fallbackModel !== primaryModel) {
    try {
      const fallbackCompletion = await client.chat.completions.create({
        model: fallbackModel,
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah asisten studio konten kreatif zine Koma. Balas hanya dengan format JSON: {"suggestions": ["...", "...", "..."]}',
          },
          { role: 'user', content: systemPrompt },
        ],
        temperature: 0.85,
        max_tokens: 350,
      });

      const text = fallbackCompletion.choices[0]?.message?.content || '';
      const validated = parseAndValidateSuggestions(text);
      if (validated) {
        return {
          suggestions: validated,
          category,
          modelUsed: fallbackModel,
          source: 'fallback_model',
        };
      }
    } catch (fallbackErr) {
      console.warn(`[AI Studio] Fallback model (${fallbackModel}) failed:`, (fallbackErr as any)?.message || fallbackErr);
    }
  }

  // 3. Fallback to Curated Bank
  const fallbackList = CURATED_STUDIO_BANK[category] || CURATED_STUDIO_BANK.random_thoughts;
  return {
    suggestions: [fallbackList[0], fallbackList[1], fallbackList[2]],
    category,
    modelUsed: 'curated-indonesian-bank',
    source: 'curated_bank',
  };
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
