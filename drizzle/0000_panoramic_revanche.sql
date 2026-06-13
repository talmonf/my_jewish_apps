CREATE TYPE "public"."app_access_level" AS ENUM('viewer', 'teacher', 'admin');--> statement-breakpoint
CREATE TYPE "public"."leining_submission_status" AS ENUM('uploaded', 'processing', 'analyzed', 'reviewed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'teacher', 'student', 'user');--> statement-breakpoint
CREATE TABLE "apps" (
	"key" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"href" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "default_app_access" (
	"app_key" text PRIMARY KEY NOT NULL,
	"access_level" "app_access_level" DEFAULT 'viewer' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leining_analysis_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"provider" text DEFAULT 'internal-placeholder' NOT NULL,
	"confidence" integer DEFAULT 0 NOT NULL,
	"issues" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reviewed_by_id" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leining_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"student_id" uuid,
	"title" text NOT NULL,
	"instructions" text,
	"due_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leining_reference_recordings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"audio_url" text NOT NULL,
	"duration_seconds" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leining_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"book" text NOT NULL,
	"start_ref" text NOT NULL,
	"end_ref" text NOT NULL,
	"expected_text" text NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leining_student_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"audio_url" text NOT NULL,
	"status" "leining_submission_status" DEFAULT 'uploaded' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tehillim_chapters" (
	"chapter" integer PRIMARY KEY NOT NULL,
	"book" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"day_of_month" integer NOT NULL,
	"author" text NOT NULL,
	"title" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tehillim_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"chapter" integer NOT NULL,
	"verse" integer NOT NULL,
	"word_index" integer,
	"marker" text NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tehillim_favorites" (
	"user_id" uuid NOT NULL,
	"chapter" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tehillim_favorites_user_id_chapter_pk" PRIMARY KEY("user_id","chapter")
);
--> statement-breakpoint
CREATE TABLE "tehillim_highlights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"chapter" integer NOT NULL,
	"start_verse" integer NOT NULL,
	"end_verse" integer NOT NULL,
	"start_word" integer,
	"end_word" integer,
	"color" text DEFAULT 'yellow' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tehillim_read_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"chapter" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"source" text DEFAULT 'single' NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tehillim_user_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"font_family" text DEFAULT 'system-hebrew' NOT NULL,
	"show_kamatz_katan" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tehillim_verses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter" integer NOT NULL,
	"verse" integer NOT NULL,
	"hebrew" text NOT NULL,
	"english" text,
	"tokens" jsonb
);
--> statement-breakpoint
CREATE TABLE "user_app_access" (
	"user_id" uuid NOT NULL,
	"app_key" text NOT NULL,
	"access_level" "app_access_level" DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_app_access_user_id_app_key_pk" PRIMARY KEY("user_id","app_key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "default_app_access" ADD CONSTRAINT "default_app_access_app_key_apps_key_fk" FOREIGN KEY ("app_key") REFERENCES "public"."apps"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leining_analysis_results" ADD CONSTRAINT "leining_analysis_results_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leining_analysis_results" ADD CONSTRAINT "leining_analysis_submission_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."leining_student_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leining_assignments" ADD CONSTRAINT "leining_assignments_section_id_leining_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."leining_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leining_assignments" ADD CONSTRAINT "leining_assignments_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leining_assignments" ADD CONSTRAINT "leining_assignments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leining_reference_recordings" ADD CONSTRAINT "leining_reference_recordings_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leining_reference_recordings" ADD CONSTRAINT "leining_ref_assignment_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."leining_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leining_sections" ADD CONSTRAINT "leining_sections_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leining_student_submissions" ADD CONSTRAINT "leining_student_submissions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leining_student_submissions" ADD CONSTRAINT "leining_submission_assignment_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."leining_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tehillim_comments" ADD CONSTRAINT "tehillim_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tehillim_favorites" ADD CONSTRAINT "tehillim_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tehillim_favorites" ADD CONSTRAINT "tehillim_favorites_chapter_tehillim_chapters_chapter_fk" FOREIGN KEY ("chapter") REFERENCES "public"."tehillim_chapters"("chapter") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tehillim_highlights" ADD CONSTRAINT "tehillim_highlights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tehillim_read_logs" ADD CONSTRAINT "tehillim_read_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tehillim_user_preferences" ADD CONSTRAINT "tehillim_user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tehillim_verses" ADD CONSTRAINT "tehillim_verses_chapter_tehillim_chapters_chapter_fk" FOREIGN KEY ("chapter") REFERENCES "public"."tehillim_chapters"("chapter") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_app_access" ADD CONSTRAINT "user_app_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_app_access" ADD CONSTRAINT "user_app_access_app_key_apps_key_fk" FOREIGN KEY ("app_key") REFERENCES "public"."apps"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tehillim_verses_chapter_verse_unique" ON "tehillim_verses" USING btree ("chapter","verse");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");