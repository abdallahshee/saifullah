import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

/** Managed by the secretary; not directly readable by teachers. */
export const parents = pgTable(
  "parents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  () => [
    // Only secretary can read or write parent records - teachers and admin
    // have no access to parent contact details.
    pgPolicy("parents_secretary_only", {
      for: "all",
      to: authenticatedRole,
      using: sql`current_app_role() = 'secretary'`,
      withCheck: sql`current_app_role() = 'secretary'`,
    }),
  ],
).enableRLS();
