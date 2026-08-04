import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, uuid, date, timestamp, unique } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { attendanceStatus } from "./enums";
import { students } from "./students";
import { profiles } from "./profiles";

/**
 * One row per student per day, created when a teacher submits the daily
 * register (SMS to parents of absent students fires at that point, outside
 * this table). Once submitted a record is locked: there's no update/delete
 * policy for teachers below, only for admin - editing after submission is
 * an admin override, not something a teacher can do themselves.
 */
export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    status: attendanceStatus("status").notNull(),
    markedBy: uuid("marked_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("attendance_records_student_date_unique").on(t.studentId, t.date),
    // Admin can view, edit, or delete any attendance record - this is the
    // override path for correcting an already-submitted register.
    pgPolicy("attendance_records_admin_override", {
      for: "all",
      to: authenticatedRole,
      using: sql`has_role('admin')`,
      withCheck: sql`has_role('admin')`,
    }),
    // A teacher can view and submit attendance only for students in their
    // own class.
    pgPolicy("attendance_records_select_own_class_teacher", {
      for: "select",
      to: authenticatedRole,
      using: sql`has_role('teacher') and is_teacher_of_student(${t.studentId})`,
    }),
    pgPolicy("attendance_records_insert_own_class_teacher", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`has_role('teacher') and is_teacher_of_student(${t.studentId})`,
    }),
    // A parent can view attendance history for their own child/children.
    pgPolicy("attendance_records_select_own_children_parent", {
      for: "select",
      to: authenticatedRole,
      using: sql`has_role('parent') and is_parent_of_student(${t.studentId})`,
    }),
  ],
).enableRLS();
