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
    classUrl: text("class_url"),
    teacherId: uuid("teacher_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
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
      using: sql`has_role('admin')`,
      withCheck: sql`has_role('admin')`,
    }),
  ],
).enableRLS();
