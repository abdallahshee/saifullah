import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, uuid, text, primaryKey } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { students } from "./students";
import { parents } from "./parents";

/** Links students to their parents/guardians (many-to-many). */
export const studentGuardians = pgTable(
  "student_guardians",
  {
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id")
      .notNull()
      .references(() => parents.id, { onDelete: "cascade" }),
    relationship: text("relationship").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.studentId, t.parentId] }),
    // Only secretary can link/unlink a student and a parent/guardian.
    pgPolicy("student_guardians_secretary_only", {
      for: "all",
      to: authenticatedRole,
      using: sql`current_app_role() = 'secretary'`,
      withCheck: sql`current_app_role() = 'secretary'`,
    }),
  ],
).enableRLS();
