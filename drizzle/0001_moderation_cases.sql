ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "moderation_state" text DEFAULT 'published' NOT NULL;
ALTER TABLE "replies" ADD COLUMN IF NOT EXISTS "moderation_state" text DEFAULT 'published' NOT NULL;

CREATE TABLE IF NOT EXISTS "moderation_cases" (
  "id" text PRIMARY KEY NOT NULL,
  "target_type" text NOT NULL,
  "target_id" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "source" text NOT NULL,
  "category" text NOT NULL,
  "reason" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "reviewed_at" timestamp with time zone
);
CREATE INDEX IF NOT EXISTS "idx_moderation_cases_status" ON "moderation_cases" ("status", "created_at");
