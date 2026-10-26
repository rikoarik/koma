import { z } from 'zod';

export const adminMessageInput = z.object({
  category: z.enum(['masukan', 'kendala', 'lainnya']),
  content: z.string().trim().min(10, 'Pesan minimal 10 karakter.').max(2000, 'Pesan maksimal 2000 karakter.'),
}).strict();

export type AdminMessageInput = z.infer<typeof adminMessageInput>;
