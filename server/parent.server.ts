"use server";

import { db } from "@/lib/db";
import { profiles, studentGuardians } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
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


export type StudentGuardian = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  relationship: string;
};

/**
 * Returns the parents/guardians linked to a given student via
 * student_guardians. Same access as the student detail page —
 * admin, secretary, and teacher.
 */
export async function getParentsByStudentId(
  studentId: string,
): Promise<StudentGuardian[]> {
  await requireRole("admin", "secretary", "teacher");

  const rows = await db
    .select({
      id: profiles.id,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      email: profiles.email,
      phone: profiles.phone,
      relationship: studentGuardians.relationship,
    })
    .from(studentGuardians)
    .innerJoin(profiles, eq(profiles.id, studentGuardians.parentId))
    .where(eq(studentGuardians.studentId, studentId))
    .orderBy(profiles.lastName);

  return rows;
}