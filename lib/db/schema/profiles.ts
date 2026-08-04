import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { authUsers, authenticatedRole } from "drizzle-orm/supabase";
import { userRole } from "./enums";

/**
 * One row per staff member (admin, secretary, teacher) who can sign in.
 * `id` is the Supabase auth user id. There's no self-signup: an admin
 * creates the auth user (service role) and the matching profile row.
 * The very first admin has to be inserted directly (RLS blocks insert
 * otherwise) - see drizzle/0001_snapshot's companion migration notes.
 */
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    role: userRole("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Anyone can read their own profile; admin can read everyone's (needed
    // to list teachers when assigning them to classes).
    pgPolicy("profiles_select_own_or_admin", {
      for: "select",
      to: authenticatedRole,
      using: sql`${t.id} = auth.uid() or current_app_role() = 'admin'`,
    }),
    // Only admin can create staff profiles (i.e. admit a new teacher/secretary).
    pgPolicy("profiles_insert_admin_only", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`current_app_role() = 'admin'`,
    }),
    // Anyone can update their own profile; admin can update anyone's (e.g.
    // to change a role).
    pgPolicy("profiles_update_own_or_admin", {
      for: "update",
      to: authenticatedRole,
      using: sql`${t.id} = auth.uid() or current_app_role() = 'admin'`,
      withCheck: sql`${t.id} = auth.uid() or current_app_role() = 'admin'`,
    }),
    // Only admin can remove a staff profile.
    pgPolicy("profiles_delete_admin_only", {
      for: "delete",
      to: authenticatedRole,
      using: sql`current_app_role() = 'admin'`,
    }),
  ],
).enableRLS();
