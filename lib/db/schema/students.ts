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
      using: sql`current_app_role() in ('secretary', 'admin')`,
    }),
    // A teacher can only view students in the class they're assigned to.
    pgPolicy("students_select_own_class_teacher", {
      for: "select",
      to: authenticatedRole,
      using: sql`current_app_role() = 'teacher' and is_teacher_of_class(${t.classId})`,
    }),
    // Only secretary can admit, edit, or remove a student.
    pgPolicy("students_write_secretary_only", {
      for: "all",
      to: authenticatedRole,
      using: sql`current_app_role() = 'secretary'`,
      withCheck: sql`current_app_role() = 'secretary'`,
    }),
  ],
).enableRLS();
