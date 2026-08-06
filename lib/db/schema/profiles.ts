import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, uuid, text, timestamp, date } from "drizzle-orm/pg-core";
import { authUsers, authenticatedRole } from "drizzle-orm/supabase";
import { userRole } from "./enums";

/**
 * One row per person who can sign in - staff (admin, secretary, teacher)
 * and parents alike. `id` is the Supabase auth user id. There's no
 * self-signup: an admin creates a staff auth user (service role) and the
 * matching profile row; a secretary does the same for a parent. The very
 * first admin has to be inserted directly (RLS blocks insert otherwise) -
 * see drizzle/0001_snapshot's companion migration notes.
 *
 * `roles` holds every role a profile has (e.g. a teacher who is also a
 * parent at the school), so it's an array column rather than a single
 * enum value.
 *
 * `phone` is mainly for parents (SMS notifications - absence alerts,
 * report-ready alerts, fee reminders/receipts), but left open to staff too
 * rather than splitting it out for one role.
 */
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    profileUrl:text("profile_url"),
    lastName: text("last_name").notNull(),
    dateOfBirth: date("date_of_birth",{mode:"string"}),
    phone: text("phone"),
    roles: userRole("roles").array(),
    email:text("email").notNull(),
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
      using: sql`${t.id} = auth.uid() or has_role('admin')`,
    }),
    // Only admin can create a profile (staff onboarding). Parent onboarding
    // by the secretary goes through the same trusted, service-role-backed
    // provisioning path as staff (see admitStaffMember) rather than a
    // direct-from-client insert, so no secretary insert policy is needed
    // here.
    pgPolicy("profiles_insert_admin_only", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`has_role('admin')`,
    }),
    // Anyone can update their own profile; admin can update anyone's.
    pgPolicy("profiles_update_own_or_admin", {
      for: "update",
      to: authenticatedRole,
      using: sql`${t.id} = auth.uid() or has_role('admin')`,
      withCheck: sql`${t.id} = auth.uid() or has_role('admin')`,
    }),
    // Only admin can remove a profile.
    pgPolicy("profiles_delete_admin_only", {
      for: "delete",
      to: authenticatedRole,
      using: sql`has_role('admin')`,
    }),
    // Secretary can view and edit a parent's contact details (name, phone)
    // once the profile already has the 'parent' role.
    pgPolicy("profiles_write_secretary_parent_only", {
      for: "all",
      to: authenticatedRole,
      using: sql`has_role('secretary') and 'parent' = any(${t.roles})`,
      withCheck: sql`has_role('secretary') and 'parent' = any(${t.roles})`,
    }),
  ],
).enableRLS();
