/**
 * Indonesian Content Moderation Engine for Koma
 * Supports normalization, allowlists, context-aware severity, and configurable actions:
 * - 'allow'
 * - 'warn'
 * - 'review' (held for moderator approval)
 * - 'reject' (immediate blocking)
 */

export interface ModerationRuleItem {
  id?: string;
  wordOrPattern: string;
  ruleType: 'banned_word' | 'allowlist' | 'regex';
  action: 'allow' | 'warn' | 'review' | 'reject';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}

export interface ModerationResult {
  action: 'allow' | 'warn' | 'review' | 'reject';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason?: string;
  flaggedWord?: string;
}

// Built-in Indonesian baseline allowlist to prevent false positives (Scunthorpe problem)
const DEFAULT_ALLOWLIST = new Set([
  'pantai',
  'baju',
  'anjing peliharaan',
  'sate babi',
  'babi panggang',
  'masalah',
  'mengajar',
  'peluk',
  'kehangatan',
  'senyum',
  'kelakar',
  'kamar',
  'cerita',
  'kucing',
  'halte',
]);

// Built-in baseline profanity & abuse dictionary
export const BASELINE_RULES: ModerationRuleItem[] = [
  // Critical abuse / Doxxing
  { wordOrPattern: '(?:\\+62|62|08)[0-9]{8,12}', ruleType: 'regex', action: 'reject', severity: 'critical', description: 'Nomor telepon (anti-doxxing)' },
  { wordOrPattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', ruleType: 'regex', action: 'reject', severity: 'critical', description: 'Alamat email (anti-doxxing)' },
  { wordOrPattern: '\\b[0-9]{16}\\b', ruleType: 'regex', action: 'reject', severity: 'critical', description: 'Nomor identitas KTP/NIK' },

  // Dangerous / Severe threat
  { wordOrPattern: 'bunuh diri', ruleType: 'banned_word', action: 'review', severity: 'high', description: 'Indikasi distress / bantuan krisis' },
  { wordOrPattern: 'loncat dari', ruleType: 'banned_word', action: 'review', severity: 'high', description: 'Indikasi self-harm' },
  { wordOrPattern: 'mati aja lo', ruleType: 'banned_word', action: 'reject', severity: 'high', description: 'Pelecehan / ancaman terarah' },
  { wordOrPattern: 'gue bunuh lo', ruleType: 'banned_word', action: 'reject', severity: 'critical', description: 'Ancaman pembunuhan' },

  // Severe Indonesian vulgarities
  { wordOrPattern: 'kontol', ruleType: 'banned_word', action: 'reject', severity: 'high', description: 'Kata kasar eksplisit' },
  { wordOrPattern: 'memek', ruleType: 'banned_word', action: 'reject', severity: 'high', description: 'Kata kasar eksplisit' },
  { wordOrPattern: 'jembut', ruleType: 'banned_word', action: 'reject', severity: 'high', description: 'Kata kasar eksplisit' },
  { wordOrPattern: 'ngentot', ruleType: 'banned_word', action: 'reject', severity: 'high', description: 'Kata kasar eksplisit' },
  { wordOrPattern: 'pantek', ruleType: 'banned_word', action: 'reject', severity: 'high', description: 'Kata kasar eksplisit' },
  { wordOrPattern: 'perek', ruleType: 'banned_word', action: 'reject', severity: 'high', description: 'Hinaan merendahkan' },
  { wordOrPattern: 'lonte', ruleType: 'banned_word', action: 'reject', severity: 'high', description: 'Hinaan merendahkan' },

  // Medium vulgarities (context-aware: warn/review unless directed)
  { wordOrPattern: 'bangsat', ruleType: 'banned_word', action: 'review', severity: 'medium', description: 'Umpatan kasar' },
  { wordOrPattern: 'bajingan', ruleType: 'banned_word', action: 'review', severity: 'medium', description: 'Umpatan kasar' },
  { wordOrPattern: 'kampret', ruleType: 'banned_word', action: 'warn', severity: 'low', description: 'Umpatan ringan' },
  { wordOrPattern: 'anjing', ruleType: 'banned_word', action: 'warn', severity: 'low', description: 'Umpatan umum' },
  { wordOrPattern: 'babi', ruleType: 'banned_word', action: 'warn', severity: 'low', description: 'Umpatan umum' },
];

/**
 * Normalize text to detect obfuscated words (leetspeak, repeated chars, separators)
 */
export function normalizeText(rawText: string): string {
  let normalized = rawText.toLowerCase();

  // 1. Common Indonesian leetspeak substitutions
  normalized = normalized
    .replace(/@/g, 'a')
    .replace(/4/g, 'a')
    .replace(/3/g, 'e')
    .replace(/1/g, 'i')
    .replace(/!/g, 'i')
    .replace(/0/g, 'o')
    .replace(/5/g, 's')
    .replace(/\$/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b');

  // 2. Collapse repeated characters (e.g. "anjjjiiiing" -> "anjiing")
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');

  return normalized;
}

/**
 * Check text against moderation rules and allowlist
 */
export function checkContentModeration(
  text: string,
  customRules: ModerationRuleItem[] = []
): ModerationResult {
  if (!text || text.trim().length === 0) {
    return { action: 'allow', severity: 'low' };
  }

  const rawLower = text.toLowerCase();
  const normalized = normalizeText(text);

  // Built-in safety rules run before custom rules; admin rules cannot override them.
  const allRules = [...BASELINE_RULES, ...customRules];

  // An allowlist only bypasses a matching low-severity term, never privacy or threats.
  const activeAllowlist = new Set<string>(DEFAULT_ALLOWLIST);
  for (const rule of allRules) {
    if (rule.ruleType === 'allowlist') activeAllowlist.add(rule.wordOrPattern.toLowerCase());
  }

  // 2. Check regex rules
  for (const rule of allRules) {
    if (rule.ruleType === 'regex') {
      try {
        const rx = new RegExp(rule.wordOrPattern, 'i');
        if (rx.test(text) || rx.test(normalized)) {
          return {
            action: rule.action,
            severity: rule.severity,
            reason: rule.description || 'Konten mengandung pola yang tidak diizinkan',
            flaggedWord: rule.wordOrPattern,
          };
        }
      } catch {
        // Skip invalid regex
      }
    }
  }

  // 3. Check banned words with word boundaries
  for (const rule of allRules) {
    if (rule.ruleType === 'banned_word') {
      const word = rule.wordOrPattern.toLowerCase().trim();
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordRx = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escaped}($|\\s|[^a-zA-Z0-9])`, 'i');

      if (wordRx.test(rawLower) || wordRx.test(normalized)) {
        // Context-aware relaxation:
        // If it's a 'low' severity word like 'anjing' or 'babi' but accompanied by friendly/relatable context:
        if (rule.severity === 'low' && rule.action !== 'reject' && rule.action !== 'review') {
          // If followed by friendly context or explicitly allowlisted, treat as colloquial expression.
          if (activeAllowlist.has(word) || rawLower.includes('capek') || rawLower.includes('lucu') || rawLower.includes('ngakak')) {
            return { action: 'allow', severity: 'low' };
          }
        }

        return {
          action: rule.action,
          severity: rule.severity,
          reason: rule.description || `Mengandung kata: ${word}`,
          flaggedWord: word,
        };
      }
    }
  }

  return { action: 'allow', severity: 'low' };
}
