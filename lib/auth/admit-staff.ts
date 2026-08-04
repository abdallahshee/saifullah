import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import type { Role } from "./current-profile";
import { ProfileRequest } from "../db/types/profiles.types";

/**
 * Ensures a staff auth user + profile row exist for the given email, with
 * the given name and role. Uses the Supabase service role key, which
 * bypasses RLS entirely - that's required since the `profiles` insert
 * policy only allows admins to insert (and there may not be one yet, for
 * the very first admin).
 *
 * `role` is merged into the profile's existing `role` array (deduped)
 * rather than overwriting it, since a profile can hold more than one role.
 *
 * Only ever call this from a trusted, server-only context (a Server
 * Action gated by requireRole("admin"), or a local script) - never expose
 * the service role key to the browser or a public/unauthenticated route.
 */
export async function admitStaffMember(data: ProfileRequest, role: Role) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Fail fast if the server isn't configured correctly - these are required
  // for the admin client below and there's no safe fallback for either.
  if (!serviceRoleKey || !supabaseUrl)
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

  const { firstName, lastName, email, phone } = data;

  // Service-role client: bypasses RLS entirely, so this must never be
  // constructed on the client or exposed outside a trusted server context.
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check whether an auth user already exists for this email so we don't
  // create a duplicate account when re-admitting someone (e.g. granting
  // an existing teacher the secretary role too).
  const { data: existingUsers, error: listError } =
    await supabaseAdmin.auth.admin.listUsers();
  if (listError) throw listError;

  let userId = existingUsers.users.find((u) => u.email === email)?.id;
  let temporaryPassword: string | null = null;

  if (!userId) {
    // No existing auth user - create one with a random, one-time password.
    // The caller/UI is responsible for surfacing this to the admin so it
    // can be shared with the new staff member (e.g. via email or a
    // "reset password" flow on first login).
    temporaryPassword = randomUUID();
    const { data: created, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true, // skip email verification - admin-created accounts are pre-trusted
      });
    if (createError) throw createError;
    userId = created.user.id;
  }

  // Upsert the profile row:
  // - If this is a brand-new user, insert with just the one role.
  // - If a profile already exists (e.g. re-admitting with a new role),
  //   merge the new role into the existing `role` array instead of
  //   overwriting it, since a single profile can hold multiple roles.
  //   The `sql` fragment does this merge + dedupe atomically in Postgres,
  //   avoiding a read-then-write race condition between concurrent admits.
  await db
    .insert(profiles)
    .values({ id: userId, firstName, lastName, email, phone, role: [role] })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        firstName,
        lastName,
        email,
        phone,
        role: sql`(
          select array_agg(distinct r)
          from unnest(coalesce(${profiles.role}, '{}'::user_role[]) || array[${role}]::user_role[]) as r
        )`,
      },
    });

  return { userId, email, temporaryPassword };
}