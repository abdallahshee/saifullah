import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, uuid, text, date, timestamp } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { classes } from "./classes";
import { profiles } from "./profiles";

/** Admitted by the secretary. */
export const students = pgTable(
  "students",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    dateOfBirth: date("date_of_birth"),
    classId: uuid("class_id").references(() => classes.id, {
      onDelete: "set null",
    }),
    admittedBy: uuid("admitted_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    admittedAt: timestamp("admitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Secretary can view all students; admin can too (for analytics).
    pgPolicy("students_select_secretary_admin", {
      for: "select",
      to: authenticatedRole,
      using: sql`(has_role('secretary') or has_role('admin'))`,
    }),
    // A teacher can only view students in the class they're assigned to.
    pgPolicy("students_select_own_class_teacher", {
      for: "select",
      to: authenticatedRole,
      using: sql`has_role('teacher') and is_teacher_of_class(${t.classId})`,
    }),
    // A parent can only view their own child/children.
    pgPolicy("students_select_own_children_parent", {
      for: "select",
      to: authenticatedRole,
      using: sql`has_role('parent') and is_parent_of_student(${t.id})`,
    }),
    // Only secretary can admit, edit, or remove a student.
    pgPolicy("students_write_secretary_only", {
      for: "all",
      to: authenticatedRole,
      using: sql`has_role('secretary')`,
      withCheck: sql`has_role('secretary')`,
    }),
  ],
).enableRLS();
