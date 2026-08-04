import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { reportStatus } from "./enums";
import { students } from "./students";
import { classes } from "./classes";
import { profiles } from "./profiles";
import { terms } from "./terms";

/**
 * Teacher authors reports for their own class's students; secretary reviews
 * and sends them to parents.
 */
export const academicReports = pgTable(
  "academic_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    classId: uuid("class_id").references(() => classes.id, {
      onDelete: "set null",
    }),
    teacherId: uuid("teacher_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    termId: uuid("term_id")
      .notNull()
      .references(() => terms.id, { onDelete: "cascade" }),
    summary: text("summary").notNull(),
    status: reportStatus("status").notNull().default("draft"),
    sentBy: uuid("sent_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Secretary can view every report, draft or sent, for any student.
    pgPolicy("academic_reports_select_secretary", {
      for: "select",
      to: authenticatedRole,
      using: sql`has_role('secretary')`,
    }),
    // A teacher can only view reports for students in their own class.
    pgPolicy("academic_reports_select_own_class_teacher", {
      for: "select",
      to: authenticatedRole,
      using: sql`has_role('teacher') and is_teacher_of_student(${t.studentId})`,
    }),
    // A teacher can author a report, only for a student in their own class.
    pgPolicy("academic_reports_insert_teacher", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`has_role('teacher') and is_teacher_of_student(${t.studentId})`,
    }),
    // A teacher can edit their own class's reports while still a draft;
    // once sent, only the secretary can touch it (see the policy below).
    pgPolicy("academic_reports_update_teacher_own_draft", {
      for: "update",
      to: authenticatedRole,
      using: sql`has_role('teacher') and is_teacher_of_student(${t.studentId}) and ${t.status} = 'draft'`,
      withCheck: sql`has_role('teacher') and is_teacher_of_student(${t.studentId})`,
    }),
    // Secretary can update any report - this is how a report is marked as
    // sent (status -> 'sent', sentBy/sentAt set) once reviewed.
    pgPolicy("academic_reports_update_secretary", {
      for: "update",
      to: authenticatedRole,
      using: sql`has_role('secretary')`,
      withCheck: sql`has_role('secretary')`,
    }),
    // A teacher can delete their own class's report only while it's still
    // a draft - once sent it's the historical record and can't be removed.
    pgPolicy("academic_reports_delete_teacher_own_draft", {
      for: "delete",
      to: authenticatedRole,
      using: sql`has_role('teacher') and is_teacher_of_student(${t.studentId}) and ${t.status} = 'draft'`,
    }),
    // A parent can view a report for their own child once it's been sent -
    // drafts stay invisible to parents until the secretary sends them.
    pgPolicy("academic_reports_select_own_children_parent", {
      for: "select",
      to: authenticatedRole,
      using: sql`has_role('parent') and is_parent_of_student(${t.studentId}) and ${t.status} = 'sent'`,
    }),
  ],
).enableRLS();
