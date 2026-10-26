import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from './schema';

// The Prisma Postgres marketplace integration prefixes its keys with the database name.
// Do not silently fall back to a different database if its preferred URL is malformed.
const connectionString = [
  process.env.ruangkoma_POSTGRES_URL,
  process.env.ruangkoma_DATABASE_URL,
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL,
].find((value) => value?.trim())?.trim();

export const isPostgresConfigured = Boolean(connectionString && /^postgres(?:ql)?:\/\//i.test(connectionString));

export const db = isPostgresConfigured
  ? drizzle({ client: new Pool({ connectionString, max: 5 }), schema })
  : null;

/** Initialize the Koma tables without replacing or seeding any existing data. */
export async function ensurePostgresTables() {
  if (!db) return false;

  try {
    await db.execute(sql`
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
      )
    `);

    await db.execute(sql`
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
      )
    `);

    // Compatible with tables created by older deployments; nonconsenting by default.
    await db.execute(sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS moderation_state text NOT NULL DEFAULT 'published'`);
    await db.execute(sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_consent boolean NOT NULL DEFAULT false`);
    await db.execute(sql`ALTER TABLE replies ADD COLUMN IF NOT EXISTS moderation_state text NOT NULL DEFAULT 'published'`);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reactions (
        id text PRIMARY KEY,
        post_id text NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        reaction_type text NOT NULL,
        session_id text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_post_reaction_session
      ON reactions (post_id, reaction_type, session_id)
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reports (
        id text PRIMARY KEY,
        target_type text NOT NULL DEFAULT 'post',
        target_id text NOT NULL,
        reason text NOT NULL,
        notes text,
        status text NOT NULL DEFAULT 'PENDING',
        reporter_session text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS moderation_rules (
        id text PRIMARY KEY,
        word_or_pattern text NOT NULL,
        rule_type text NOT NULL DEFAULT 'banned_word',
        action text NOT NULL DEFAULT 'reject',
        severity text NOT NULL DEFAULT 'medium',
        description text,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id text PRIMARY KEY,
        session_id text NOT NULL,
        event_type text NOT NULL,
        path text,
        metadata text,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        key text PRIMARY KEY,
        value text NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id text PRIMARY KEY,
        action text NOT NULL,
        target text NOT NULL,
        details text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await db.execute(sql`
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
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_messages (
        id text PRIMARY KEY,
        session_id text NOT NULL,
        category text NOT NULL,
        content text NOT NULL,
        read_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages (created_at DESC)`);

    return true;
  } catch (err) {
    console.error('[DB] PostgreSQL table initialization failed');
    throw err;
  }
}
