CREATE TABLE "analytics_events" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"event_type" text NOT NULL,
	"path" text,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"word_or_pattern" text NOT NULL,
	"rule_type" text DEFAULT 'banned_word' NOT NULL,
	"action" text DEFAULT 'reject' NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"author_alias" text DEFAULT 'Tanpa Nama' NOT NULL,
	"author_type" text DEFAULT 'tanpa_nama' NOT NULL,
	"session_id" text NOT NULL,
	"delete_secret_hash" text,
	"content" text NOT NULL,
	"image_url" text,
	"topic" text DEFAULT 'isi-kepala' NOT NULL,
	"response_mode" text DEFAULT 'boleh_dibalas' NOT NULL,
	"is_ai_generated" boolean DEFAULT false NOT NULL,
	"ai_prompt" text,
	"paper_color" text DEFAULT 'cream' NOT NULL,
	"rotation" real DEFAULT 0,
	"moderation_state" text DEFAULT 'published' NOT NULL,
	"report_count" integer DEFAULT 0 NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"reaction_type" text NOT NULL,
	"session_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "replies" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"session_id" text NOT NULL,
	"author_alias" text DEFAULT 'Tanpa Nama' NOT NULL,
	"author_type" text DEFAULT 'tanpa_nama' NOT NULL,
	"content" text NOT NULL,
	"is_ai_generated" boolean DEFAULT false NOT NULL,
	"moderation_state" text DEFAULT 'published' NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"target_type" text DEFAULT 'post' NOT NULL,
	"target_id" text NOT NULL,
	"reason" text NOT NULL,
	"notes" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"reporter_session" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replies" ADD CONSTRAINT "replies_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_unique_post_reaction_session" ON "reactions" USING btree ("post_id","reaction_type","session_id");