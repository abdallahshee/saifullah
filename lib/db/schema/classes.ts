import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { profiles } from "./profiles";

/** A class/section. Admin assigns the teacher. */
export const classes = pgTable(
  "classes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    teacherId: uuid("teacher_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  () => [
    // Any signed-in staff member (admin/secretary/teacher) can view the
    // class list - secretary needs it to admit students, teachers need to
    // see their own class.
    pgPolicy("classes_select_any_staff", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    // Only admin can create/rename/delete classes or (re)assign a teacher.
    pgPolicy("classes_write_admin_only", {
      for: "all",
      to: authenticatedRole,
      using: sql`current_app_role() = 'admin'`,
      withCheck: sql`current_app_role() = 'admin'`,
    }),
  ],
).enableRLS();
