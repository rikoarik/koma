import { AIGeneratedContent } from '@/types';
import { generateStudioSuggestions, StudioCategory } from './ai-provider';

export async function generateAIText(
  prompt: string,
  tone: 'puitis' | 'santai' | 'lucu' | 'reflektif' = 'reflektif',
  topic: string = 'isi-kepala'
): Promise<AIGeneratedContent> {
  let category: StudioCategory = 'random_thoughts';
  if (tone === 'lucu') {
    category = 'humor_receh';
  } else if (topic === 'tanya-tanpa-nama') {
    category = 'questions';
  }

  const result = await generateStudioSuggestions({
    category,
    inputPrompt: prompt,
  });

  return {
    text: result.suggestions[0],
    topic,
    tone,
    suggestedPrompt: prompt || 'Refleksi sejenak di sudut Koma',
  };
}
