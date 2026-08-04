import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, uuid, integer, date, unique } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { termName } from "./enums";

/** One of the three terms in a school year (e.g. "Term 1", 2026). */
export const terms = pgTable(
  "terms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: termName("name").notNull(),
    year: integer("year").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
  },
  (t) => [
    unique("terms_year_name_unique").on(t.year, t.name),
    // Any signed-in staff member can see the academic calendar.
    pgPolicy("terms_select_any_staff", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    // Secretary/admin set up terms and their dates.
    pgPolicy("terms_write_secretary_admin", {
      for: "all",
      to: authenticatedRole,
      using: sql`current_app_role() in ('secretary', 'admin')`,
      withCheck: sql`current_app_role() in ('secretary', 'admin')`,
    }),
  ],
).enableRLS();
