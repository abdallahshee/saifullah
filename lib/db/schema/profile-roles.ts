import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, uuid, primaryKey } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { userRole } from "./enums";
import { profiles } from "./profiles";

/**
 * Which role(s) a profile holds - a many-to-many, since one person can be
 * more than one thing (e.g. a teacher who is also a parent at the school).
 * `has_role(p_role)` (see migration) is how every other table's RLS policy
 * checks "does the caller have role X", instead of a single-valued
 * `current_app_role()`.
 */
export const profileRoles = pgTable(
  "profile_roles",
  
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: userRole("role").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.profileId, t.role] }),
    // Anyone can see their own role(s); admin can see everyone's.
    pgPolicy("profile_roles_select_own_or_admin", {
      for: "select",
      to: authenticatedRole,
      using: sql`${t.profileId} = auth.uid() or has_role('admin')`,
    }),
    // Admin can grant/revoke any role.
    pgPolicy("profile_roles_write_admin_only", {
      for: "all",
      to: authenticatedRole,
      using: sql`has_role('admin')`,
      withCheck: sql`has_role('admin')`,
    }),
    // Secretary can grant/revoke only the 'parent' role - staff roles
    // (admin/secretary/teacher) stay admin-only.
    pgPolicy("profile_roles_write_secretary_parent_only", {
      for: "all",
      to: authenticatedRole,
      using: sql`has_role('secretary') and ${t.role} = 'parent'`,
      withCheck: sql`has_role('secretary') and ${t.role} = 'parent'`,
    }),
  ],
).enableRLS();
