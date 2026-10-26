import { pgTable, text, timestamp, boolean, integer, real, uniqueIndex } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  authorAlias: text('author_alias').notNull().default('Tanpa Nama'),
  authorType: text('author_type').notNull().default('tanpa_nama'), // 'tanpa_nama' | 'pseudonim'
  sessionId: text('session_id').notNull(), // Opaque anonymous actor ID
  deleteSecretHash: text('delete_secret_hash'), // For author edit/delete
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  topic: text('topic').notNull().default('isi-kepala'),
  responseMode: text('response_mode').notNull().default('boleh_dibalas'), // 'boleh_dibalas' | 'cukup_didengar'
  isAiGenerated: boolean('is_ai_generated').notNull().default(false),
  aiPrompt: text('ai_prompt'),
  paperColor: text('paper_color').notNull().default('cream'), // 'cream' | 'kraft' | 'lavender' | 'charcoal'
  rotation: real('rotation').default(0),
  moderationState: text('moderation_state').notNull().default('published'), // 'published' | 'held_for_review' | 'removed'
  reportCount: integer('report_count').notNull().default(0),
  isHidden: boolean('is_hidden').notNull().default(false),
  isPinned: boolean('is_pinned').notNull().default(false),
  searchConsent: boolean('search_consent').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const replies = pgTable('replies', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull(),
  authorAlias: text('author_alias').notNull().default('Tanpa Nama'),
  authorType: text('author_type').notNull().default('tanpa_nama'),
  content: text('content').notNull(),
  isAiGenerated: boolean('is_ai_generated').notNull().default(false),
  moderationState: text('moderation_state').notNull().default('published'),
  isHidden: boolean('is_hidden').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const reactions = pgTable(
  'reactions',
  {
    id: text('id').primaryKey(),
    postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    reactionType: text('reaction_type').notNull(), // 'dengerin' | 'relate' | 'senyum' | 'peluk'
    sessionId: text('session_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqueReaction: uniqueIndex('idx_unique_post_reaction_session').on(
      table.postId,
      table.reactionType,
      table.sessionId
    ),
  })
);

export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  targetType: text('target_type').notNull().default('post'), // 'post' | 'reply'
  targetId: text('target_id').notNull(),
  reason: text('reason').notNull(), // 'spam' | 'doxxing' | 'kebencian' | 'kekerasan' | 'lainnya'
  notes: text('notes'),
  status: text('status').notNull().default('PENDING'), // 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED'
  reporterSession: text('reporter_session').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const moderationRules = pgTable('moderation_rules', {
  id: text('id').primaryKey(),
  wordOrPattern: text('word_or_pattern').notNull(),
  ruleType: text('rule_type').notNull().default('banned_word'), // 'banned_word' | 'allowlist' | 'regex'
  action: text('action').notNull().default('reject'), // 'allow' | 'warn' | 'review' | 'reject'
  severity: text('severity').notNull().default('medium'), // 'low' | 'medium' | 'high' | 'critical'
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const analyticsEvents = pgTable('analytics_events', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  eventType: text('event_type').notNull(), // 'pageview' | 'post_created' | 'reply_created' | 'reaction_added' | 'ai_generated' | 'donation_viewed'
  path: text('path'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const moderationCases = pgTable('moderation_cases', {
  id: text('id').primaryKey(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  status: text('status').notNull().default('pending'),
  source: text('source').notNull(),
  category: text('category').notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
});

export const adminAuditLogs = pgTable('admin_audit_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  target: text('target').notNull(),
  details: text('details').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const adminMessages = pgTable('admin_messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  category: text('category').notNull(),
  content: text('content').notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
