DO $$ BEGIN
  CREATE TYPE "public"."liturgy_tunes_link_type" AS ENUM('youtube', 'website', 'audio', 'sheet_music');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."liturgy_tunes_search_status" AS ENUM('submitted', 'searching', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "liturgy_tunes_parts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "parent_id" uuid,
  "name_en" text NOT NULL,
  "name_he" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "service" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "liturgy_tunes_tunes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "tradition" text,
  "description" text,
  "created_by_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "liturgy_tunes_tune_parts" (
  "tune_id" uuid NOT NULL,
  "part_id" uuid NOT NULL,
  CONSTRAINT "liturgy_tunes_tune_parts_tune_id_part_id_pk" PRIMARY KEY("tune_id","part_id")
);

CREATE TABLE IF NOT EXISTS "liturgy_tunes_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tune_id" uuid NOT NULL,
  "url" text NOT NULL,
  "link_type" "liturgy_tunes_link_type" NOT NULL,
  "label" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "liturgy_tunes_search_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "liturgy_text" text NOT NULL,
  "audio_url" text,
  "transcript" text,
  "part_id" uuid,
  "tradition" text,
  "status" "liturgy_tunes_search_status" DEFAULT 'submitted' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "liturgy_tunes_search_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "request_id" uuid NOT NULL,
  "provider" text NOT NULL,
  "results" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "liturgy_tunes_parts" ADD CONSTRAINT "liturgy_tunes_parts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."liturgy_tunes_parts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "liturgy_tunes_tunes" ADD CONSTRAINT "liturgy_tunes_tunes_created_by_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "liturgy_tunes_tune_parts" ADD CONSTRAINT "liturgy_tunes_tune_parts_tune_fk" FOREIGN KEY ("tune_id") REFERENCES "public"."liturgy_tunes_tunes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "liturgy_tunes_tune_parts" ADD CONSTRAINT "liturgy_tunes_tune_parts_part_fk" FOREIGN KEY ("part_id") REFERENCES "public"."liturgy_tunes_parts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "liturgy_tunes_links" ADD CONSTRAINT "liturgy_tunes_links_tune_fk" FOREIGN KEY ("tune_id") REFERENCES "public"."liturgy_tunes_tunes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "liturgy_tunes_search_requests" ADD CONSTRAINT "liturgy_tunes_search_req_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "liturgy_tunes_search_requests" ADD CONSTRAINT "liturgy_tunes_search_req_part_fk" FOREIGN KEY ("part_id") REFERENCES "public"."liturgy_tunes_parts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "liturgy_tunes_search_results" ADD CONSTRAINT "liturgy_tunes_search_res_request_fk" FOREIGN KEY ("request_id") REFERENCES "public"."liturgy_tunes_search_requests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
