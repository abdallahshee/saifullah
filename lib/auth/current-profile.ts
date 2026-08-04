import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles, userRole } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export type Role = (typeof userRole.enumValues)[number];

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id));

  return profile ?? null;
}

/**
 * Server Component / Server Action guard. Drizzle queries run over
 * DATABASE_URL as a single fixed DB role, so the RLS policies on each
 * table are NOT applied to them - RLS only kicks in for requests made
 * through Supabase's own API (e.g. a browser using lib/supabase/client.ts).
 * This guard, plus scoping query `.where()` clauses to the caller's role,
 * is what actually restricts access for pages/actions that use Drizzle.
 */
export async function requireRole(...allowed: Role[]) {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/auth/login");
  if (!allowed.includes(profile.role)) redirect("/");

  return profile;
}
