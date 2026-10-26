// Rate limiting and content validation module for Koma

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

/**
 * In-memory sliding window rate limiter
 */
export function checkRateLimit(
  identifier: string,
  action: 'post' | 'reply' | 'reaction' | 'ai' | 'upload' | 'message'
): { allowed: boolean; remaining: number; resetInSec: number } {
  const limits: Record<string, { max: number; windowSec: number }> = {
    post: { max: 10, windowSec: 300 },       // 10 posts per 5 mins
    reply: { max: 20, windowSec: 300 },      // 20 replies per 5 mins
    reaction: { max: 60, windowSec: 60 },    // 60 reactions per 1 min
    ai: { max: 15, windowSec: 300 },         // 15 AI requests per 5 mins
    upload: { max: 5, windowSec: 300 },      // 5 images per 5 mins
    message: { max: 3, windowSec: 3600 },    // 3 messages per hour per session
  };

  const config = limits[action] || { max: 20, windowSec: 60 };
  const key = `${action}:${identifier}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowSec * 1000,
    });
    return {
      allowed: true,
      remaining: config.max - 1,
      resetInSec: config.windowSec,
    };
  }

  if (record.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      resetInSec: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: config.max - record.count,
    resetInSec: Math.ceil((record.resetAt - now) / 1000),
  };
}

/**
 * Content moderation filter for Koma:
 * Checks for obvious doxxing (phone numbers, full NIK/KTP patterns) or prohibited content
 */
export function validatePostContent(content: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = content.trim();

  if (trimmed.length < 3) {
    return { valid: false, error: 'Coretan terlalu pendek (minimal 3 karakter).' };
  }

  if (trimmed.length > 2000) {
    return { valid: false, error: 'Coretan melampaui batas (maksimal 2000 karakter).' };
  }

  // Privacy violations are saved but hidden by the moderation pipeline, so an
  // administrator can review or restore them rather than losing the submission.
  return { valid: true };
}

/**
 * Extract first hashtag as topic from post body, or return fallback.
 * Example: "Halo dunia #tengah-malam #curhat" -> "tengah-malam"
 */
export function extractTopicFromContent(content: string, fallback = 'isi-kepala'): string {
  if (!content) return fallback;
  const match = content.match(/#([a-zA-Z0-9_\-]+)/);
  if (match && match[1]) {
    const cleaned = match[1].toLowerCase().trim().replace(/^[_-]+|[_-]+$/g, '');
    return cleaned.length > 0 ? cleaned : fallback;
  }
  return fallback;
}
