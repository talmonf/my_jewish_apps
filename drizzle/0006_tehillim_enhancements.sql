ALTER TABLE "tehillim_user_preferences" ADD COLUMN IF NOT EXISTS "font_size" integer DEFAULT 100 NOT NULL;
ALTER TABLE "tehillim_user_preferences" ADD COLUMN IF NOT EXISTS "dark_mode" boolean DEFAULT false NOT NULL;
ALTER TABLE "tehillim_user_preferences" ADD COLUMN IF NOT EXISTS "show_english" boolean DEFAULT false NOT NULL;
ALTER TABLE "tehillim_user_preferences" ADD COLUMN IF NOT EXISTS "show_teamim" boolean DEFAULT true NOT NULL;

CREATE TABLE IF NOT EXISTS "tehillim_read_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "source" text NOT NULL,
  "label" text NOT NULL,
  "params" jsonb NOT NULL,
  "reported_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "tehillim_read_logs" ADD COLUMN IF NOT EXISTS "session_id" uuid REFERENCES "tehillim_read_sessions"("id") ON DELETE set null;

CREATE TABLE IF NOT EXISTS "tehillim_phrase_breaks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "chapter" integer NOT NULL,
  "verse" integer NOT NULL,
  "after_word_index" integer NOT NULL,
  "break_type" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "tehillim_phrase_breaks_unique" ON "tehillim_phrase_breaks" ("user_id", "chapter", "verse", "after_word_index");
