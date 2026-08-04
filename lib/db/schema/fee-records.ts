import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { students } from "./students";
import { terms } from "./terms";
import { classes } from "./classes";
import { profiles } from "./profiles";

/**
 * One row per student per term - the "bill". `classId` is a snapshot of
 * the student's class at billing time (a student may change classes
 * later in the year, but this record should keep billing against the
 * class_term_fees amount it was created for).
 *
 * There's no amountDue/amountPaid column here on purpose: amountDue is
 * `class_term_fees.amount` for (termId, classId) minus the sum of this
 * record's fee_payments, and amountPaid is that sum - both are derived,
 * not stored, so they can never drift out of sync with the payments log.
 * See the `fee_balances` view for the computed numbers.
 */
export const feeRecords = pgTable(
  "fee_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    termId: uuid("term_id")
      .notNull()
      .references(() => terms.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "restrict" }),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("fee_records_student_term_unique").on(t.studentId, t.termId),
    // Secretary manages billing headers end to end (create/update/delete).
    pgPolicy("fee_records_secretary_full", {
      for: "all",
      to: authenticatedRole,
      using: sql`has_role('secretary')`,
      withCheck: sql`has_role('secretary')`,
    }),
    // Admin gets read-only access, for analytics (e.g. billed vs collected).
    pgPolicy("fee_records_admin_read", {
      for: "select",
      to: authenticatedRole,
      using: sql`has_role('admin')`,
    }),
    // A parent can view the fee records (invoices) for their own children.
    pgPolicy("fee_records_select_own_children_parent", {
      for: "select",
      to: authenticatedRole,
      using: sql`has_role('parent') and is_parent_of_student(${t.studentId})`,
    }),
  ],
).enableRLS();
