import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, uuid, numeric, unique } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { terms } from "./terms";
import { classes } from "./classes";

/** The amount every student in a class owes for a given term. */
export const classTermFees = pgTable(
  "class_term_fees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    termId: uuid("term_id")
      .notNull()
      .references(() => terms.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  },
  (t) => [
    unique("class_term_fees_term_class_unique").on(t.termId, t.classId),
    // Any signed-in staff member can see the fee structure.
    pgPolicy("class_term_fees_select_any_staff", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    // Secretary/admin set the per-class amount due for a term.
    pgPolicy("class_term_fees_write_secretary_admin", {
      for: "all",
      to: authenticatedRole,
      using: sql`current_app_role() in ('secretary', 'admin')`,
      withCheck: sql`current_app_role() in ('secretary', 'admin')`,
    }),
  ],
).enableRLS();
