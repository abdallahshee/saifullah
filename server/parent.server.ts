"use server";

import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { requireRole } from "@/lib/auth/current-profile";
import { admitStaffMember } from "@/lib/auth/admit-staff";
import { ProfileRequest, secretarySchema } from "@/lib/db/types/profiles.types";

export const createParent=async(
  input: ProfileRequest) =>{
      await requireRole("secretary");
      const theRole="parent"
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
        err instanceof Error ? err.message : "Failed to create parent",
    };
  }
}


export type ParentListItem = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string;
  profileUrl: string | null;
  dateOfBirth: string | null;
};

export async function getParents(): Promise<ParentListItem[]> {
  await requireRole("admin", "secretary");

  const rows = await db
    .select({
      id: profiles.id,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      phone: profiles.phone,
      email: profiles.email,
      profileUrl: profiles.profileUrl,
      dateOfBirth: profiles.dateOfBirth,
    })
    .from(profiles)
    .where(sql`'parent' = any(${profiles.roles})`)
    .orderBy(profiles.lastName, profiles.firstName);

  return rows;
}
