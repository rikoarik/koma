import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from './schema';

if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}
if (!process.env.POSTGRES_URL && process.env.STORAGE_URL) {
  process.env.POSTGRES_URL = process.env.STORAGE_URL;
}

export const isPostgresConfigured = Boolean(
  process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.STORAGE_URL
);

export const db = isPostgresConfigured
  ? drizzle({ client: sql, schema })
  : null;

/**
 * Auto-initializes PostgreSQL tables if running on Vercel Postgres for the first time.
 */
export async function ensurePostgresTables() {
  if (!isPostgresConfigured || !sql) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id text PRIMARY KEY,
        author_alias text NOT NULL DEFAULT 'Tanpa Nama',
        author_type text NOT NULL DEFAULT 'tanpa_nama',
        session_id text NOT NULL,
        delete_secret_hash text,
        content text NOT NULL,
        image_url text,
        topic text NOT NULL DEFAULT 'isi-kepala',
        response_mode text NOT NULL DEFAULT 'boleh_dibalas',
        is_ai_generated boolean NOT NULL DEFAULT false,
        ai_prompt text,
        paper_color text NOT NULL DEFAULT 'cream',
        rotation real DEFAULT 0,
        moderation_state text NOT NULL DEFAULT 'published',
        report_count integer NOT NULL DEFAULT 0,
        is_hidden boolean NOT NULL DEFAULT false,
        is_pinned boolean NOT NULL DEFAULT false,
        search_consent boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS replies (
        id text PRIMARY KEY,
        post_id text NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        session_id text NOT NULL,
        author_alias text NOT NULL DEFAULT 'Tanpa Nama',
        author_type text NOT NULL DEFAULT 'tanpa_nama',
        content text NOT NULL,
        is_ai_generated boolean NOT NULL DEFAULT false,
        moderation_state text NOT NULL DEFAULT 'published',
        is_hidden boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    // Existing deployments may have created these tables before moderation states existed.
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS moderation_state text NOT NULL DEFAULT 'published'`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_consent boolean NOT NULL DEFAULT false`;
    await sql`ALTER TABLE replies ADD COLUMN IF NOT EXISTS moderation_state text NOT NULL DEFAULT 'published'`;

    await sql`
      CREATE TABLE IF NOT EXISTS reactions (
        id text PRIMARY KEY,
        post_id text NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        reaction_type text NOT NULL,
        session_id text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_post_reaction_session 
      ON reactions (post_id, reaction_type, session_id);
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS reports (
        id text PRIMARY KEY,
        target_type text NOT NULL DEFAULT 'post',
        target_id text NOT NULL,
        reason text NOT NULL,
        notes text,
        status text NOT NULL DEFAULT 'PENDING',
        reporter_session text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS moderation_rules (
        id text PRIMARY KEY,
        word_or_pattern text NOT NULL,
        rule_type text NOT NULL DEFAULT 'banned_word',
        action text NOT NULL DEFAULT 'reject',
        severity text NOT NULL DEFAULT 'medium',
        description text,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id text PRIMARY KEY,
        session_id text NOT NULL,
        event_type text NOT NULL,
        path text,
        metadata text,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        key text PRIMARY KEY,
        value text NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id text PRIMARY KEY,
        action text NOT NULL,
        target text NOT NULL,
        details text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS moderation_cases (
        id text PRIMARY KEY,
        target_type text NOT NULL,
        target_id text NOT NULL,
        status text NOT NULL DEFAULT 'pending',
        source text NOT NULL,
        category text NOT NULL,
        reason text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        reviewed_at timestamptz
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admin_messages (
        id text PRIMARY KEY,
        session_id text NOT NULL,
        category text NOT NULL,
        content text NOT NULL,
        read_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages (created_at DESC)`;

    return true;
  } catch (err) {
    console.error('[DB] PostgreSQL table initialization failed');
    throw err;
  }
}
