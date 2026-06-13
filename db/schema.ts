import {
  boolean,
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "teacher",
  "student",
  "user",
]);

export const appAccessLevelEnum = pgEnum("app_access_level", [
  "viewer",
  "teacher",
  "admin",
]);

export const leiningSubmissionStatusEnum = pgEnum("leining_submission_status", [
  "uploaded",
  "processing",
  "analyzed",
  "reviewed",
  "failed",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").default("user").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const apps = pgTable("apps", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  href: text("href").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userAppAccess = pgTable(
  "user_app_access",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    appKey: text("app_key")
      .notNull()
      .references(() => apps.key, { onDelete: "cascade" }),
    accessLevel: appAccessLevelEnum("access_level").default("viewer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.appKey] })],
);

export const defaultAppAccess = pgTable("default_app_access", {
  appKey: text("app_key")
    .primaryKey()
    .references(() => apps.key, { onDelete: "cascade" }),
  accessLevel: appAccessLevelEnum("access_level").default("viewer").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
});

export const tehillimChapters = pgTable("tehillim_chapters", {
  chapter: integer("chapter").primaryKey(),
  book: integer("book").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  dayOfMonth: integer("day_of_month").notNull(),
  author: text("author").notNull(),
  title: text("title").notNull(),
});

export const tehillimVerses = pgTable(
  "tehillim_verses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chapter: integer("chapter")
      .notNull()
      .references(() => tehillimChapters.chapter, { onDelete: "cascade" }),
    verse: integer("verse").notNull(),
    hebrew: text("hebrew").notNull(),
    english: text("english"),
    tokens: jsonb("tokens").$type<TehillimToken[]>(),
  },
  (table) => [
    uniqueIndex("tehillim_verses_chapter_verse_unique").on(
      table.chapter,
      table.verse,
    ),
  ],
);

export const tehillimUserPreferences = pgTable("tehillim_user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  fontFamily: text("font_family").default("system-hebrew").notNull(),
  showKamatzKatan: boolean("show_kamatz_katan").default(true).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tehillimFavorites = pgTable(
  "tehillim_favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    chapter: integer("chapter")
      .notNull()
      .references(() => tehillimChapters.chapter, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.chapter] })],
);

export const tehillimHighlights = pgTable("tehillim_highlights", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  chapter: integer("chapter").notNull(),
  startVerse: integer("start_verse").notNull(),
  endVerse: integer("end_verse").notNull(),
  startWord: integer("start_word"),
  endWord: integer("end_word"),
  color: text("color").default("yellow").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tehillimComments = pgTable("tehillim_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  wordIndex: integer("word_index"),
  marker: text("marker").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tehillimReadLogs = pgTable("tehillim_read_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  chapter: integer("chapter").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  source: text("source").default("single").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }).defaultNow().notNull(),
});

export const leiningSections = pgTable("leining_sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  book: text("book").notNull(),
  startRef: text("start_ref").notNull(),
  endRef: text("end_ref").notNull(),
  expectedText: text("expected_text").notNull(),
  createdById: uuid("created_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const leiningAssignments = pgTable("leining_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  sectionId: uuid("section_id")
    .notNull()
    .references(() => leiningSections.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").references(() => users.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  instructions: text("instructions"),
  dueAt: timestamp("due_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const leiningReferenceRecordings = pgTable("leining_reference_recordings", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignmentId: uuid("assignment_id").notNull(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  audioUrl: text("audio_url").notNull(),
  durationSeconds: integer("duration_seconds"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.assignmentId],
    foreignColumns: [leiningAssignments.id],
    name: "leining_ref_assignment_fk",
  }).onDelete("cascade"),
]);

export const leiningStudentSubmissions = pgTable("leining_student_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignmentId: uuid("assignment_id").notNull(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  audioUrl: text("audio_url").notNull(),
  status: leiningSubmissionStatusEnum("status").default("uploaded").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.assignmentId],
    foreignColumns: [leiningAssignments.id],
    name: "leining_submission_assignment_fk",
  }).onDelete("cascade"),
]);

export const leiningAnalysisResults = pgTable("leining_analysis_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id").notNull(),
  provider: text("provider").default("internal-placeholder").notNull(),
  confidence: integer("confidence").default(0).notNull(),
  issues: jsonb("issues").$type<LeiningIssue[]>().default([]).notNull(),
  reviewedById: uuid("reviewed_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.submissionId],
    foreignColumns: [leiningStudentSubmissions.id],
    name: "leining_analysis_submission_fk",
  }).onDelete("cascade"),
]);

export type TehillimToken = {
  text: string;
  kamatzKatan?: boolean;
};

export type LeiningIssue = {
  type: "missed_word" | "extra_word" | "pronunciation" | "timing";
  expected?: string;
  actual?: string;
  verseRef?: string;
  confidence: number;
  note: string;
};

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type AppAccessLevel = (typeof appAccessLevelEnum.enumValues)[number];
