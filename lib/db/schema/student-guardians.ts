import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, uuid, text, primaryKey } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { students } from "./students";
import { profiles } from "./profiles";

/**
 * Links students to their parents/guardians (many-to-many): a parent can
 * have many children, a student can have many rows here too, but is capped
 * at 2 guardians. That cap is enforced in the server action that inserts
 * these rows, not in the DB - count the student's existing rows before
 * inserting a third.
 *
 * `parentId` references `profiles.id` (not a separate parents table) -
 * every parent is a profile with role = 'parent'. Nothing at the DB level
 * stops linking a non-parent profile here; the server action that creates
 * these rows must check the target profile's role.
 */
export const studentGuardians = pgTable(
  "student_guardians",
  {
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    relationship: text("relationship").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.studentId, t.parentId] }),
    // Only secretary can link/unlink a student and a parent/guardian.
    pgPolicy("student_guardians_secretary_only", {
      for: "all",
      to: authenticatedRole,
      using: sql`has_role('secretary')`,
      withCheck: sql`has_role('secretary')`,
    }),
  ],
).enableRLS();
