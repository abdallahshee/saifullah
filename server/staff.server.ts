"use server";

import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { ProfileRequest, secretarySchema, teacherSchema } from "@/lib/db/types/profiles.types";
import { admitStaffMember } from "@/lib/auth/admit-staff";
import { requireRole } from "@/lib/auth/current-profile";

export type StaffListItem = {
  id: string;
  firstName: string;
  lastName: string;
  profileUrl: string | null;
  roles: string[];
};

/**
 * Returns every staff profile with their assigned roles. Admin only,
 * matching the staff/ route's existing gate.
 *
 * Note: this returns every profile row, including parents — if `profiles`
 * is shared across all account types (not just staff), this needs a
 * filter to exclude parent-only profiles. See note below.
 */
export async function getStaff(): Promise<StaffListItem[]> {
  await requireRole("admin");

  const rows = await db
    .select({
      id: profiles.id,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      profileUrl: profiles.profileUrl,
      roles: profiles.roles,
    })
    .from(profiles)
    .orderBy(profiles.lastName, profiles.firstName);

  // Staff = anyone with at least one non-parent role. Filtered in JS since
  // "array contains any of X" isn't a single clean Drizzle where-clause
  // without an additional SQL fragment.
  return rows
    .filter((r) => r.roles?.some((role) => role !== "parent"))
    .map((r) => ({ ...r, roles: r.roles ?? [] }));
}

export const createSecretary=async(
  input: ProfileRequest) =>{
  await requireRole("admin");
  const theRole="secretary"
  const parsed = secretarySchema.safeParse({ ...input, roles: theRole });

  if (parsed.error) {
    return {
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }
  try {
    const { temporaryPassword } = await admitStaffMember(
      {
        email: parsed.data.email,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone ?? undefined,
        profileUrl: parsed.data.profileUrl ?? undefined
      },
      theRole,
    );
    return { status: "success", email: parsed.data.email, temporaryPassword };
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error ? err.message : "Failed to create secretary",
    };
  }
}

export const createTeacher=async(
  input: ProfileRequest) =>{
  await requireRole("admin");
  const theRole="teacher"
  const parsed = teacherSchema.safeParse({ ...input, roles: theRole });

  if (parsed.error) {
    return {
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }
  try {
    const { temporaryPassword } = await admitStaffMember(
      {
        email: parsed.data.email,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone ?? undefined,
        profileUrl: parsed.data.profileUrl ?? undefined
      },
      theRole,
    );
    return { status: "success", email: parsed.data.email, temporaryPassword };
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error ? err.message : "Failed to create teacher",
    };
  }
}





