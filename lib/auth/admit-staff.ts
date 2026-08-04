import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import type { Role } from "./current-profile";

/**
 * Ensures a staff auth user + profile row exist for the given email, with
 * the given name and role. Uses the Supabase service role key, which
 * bypasses RLS entirely - that's required since the `profiles` insert
 * policy only allows admins to insert (and there may not be one yet, for
 * the very first admin).
 *
 * Only ever call this from a trusted, server-only context (a Server
 * Action gated by requireRole("admin"), or a local script) - never expose
 * the service role key to the browser or a public/unauthenticated route.
 */
export async function admitStaffMember(email: string, fullName: string, role: Role) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existingUsers, error: listError } =
    await supabaseAdmin.auth.admin.listUsers();
  if (listError) throw listError;

  let userId = existingUsers.users.find((u) => u.email === email)?.id;
  let temporaryPassword: string | null = null;

  if (!userId) {
    temporaryPassword = randomUUID();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
  }

  await db
    .insert(profiles)
    .values({ id: userId, fullName, role })
    .onConflictDoUpdate({
      target: profiles.id,
      set: { fullName, role },
    });

  return { userId, temporaryPassword };
}
