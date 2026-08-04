"use server";

import { requireRole } from "@/lib/auth/current-profile";
import { admitStaffMember } from "@/lib/auth/admit-staff";
import { ProfileRequest, secretarySchema } from "@/lib/db/types/profiles.types";

export const createParent=async(
  input: ProfileRequest) =>{
      await requireRole("secretary");
      const theRole="parent"
  const parsed = secretarySchema.safeParse({ ...input, role: theRole });

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
        phone: parsed.data.phone ?? undefined
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