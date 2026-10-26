import { z } from 'zod';

export const moderationRuleInput = z.object({
  wordOrPattern: z.string().trim().min(1).max(120),
  ruleType: z.enum(['banned_word', 'allowlist', 'regex']),
  action: z.enum(['allow', 'warn', 'review', 'reject']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().trim().max(240).optional(),
}).strict().superRefine((rule, ctx) => {
  if (rule.ruleType !== 'regex') return;
  // Untrusted patterns run synchronously on user text; reject common nested-quantifier ReDoS shapes.
  if (/\([^)]*[+*][^)]*\)[+*{]|\([^)]*\|[^)]*\)[+*{]|\\[1-9]|\(\?/.test(rule.wordOrPattern)) {
    ctx.addIssue({ code: 'custom', message: 'Pola regex terlalu kompleks.', path: ['wordOrPattern'] });
    return;
  }
  try { new RegExp(rule.wordOrPattern, 'i'); }
  catch { ctx.addIssue({ code: 'custom', message: 'Pola regex tidak valid.', path: ['wordOrPattern'] }); }
});
