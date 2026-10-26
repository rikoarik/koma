import { z } from 'zod';

export const donationInput = z.object({
  enabled: z.boolean().optional(),
  qrisImageUrl: z.string().trim().max(500).refine((value) => !value || value.startsWith('/assets/') || value.startsWith('https://'), 'URL QRIS harus HTTPS atau aset lokal.').optional(),
  externalLinkUrl: z.string().trim().max(500).url().refine((value) => value.startsWith('https://'), 'Tautan donasi harus HTTPS.').optional(),
  customMessage: z.string().trim().max(1000).optional(),
}).strict();
