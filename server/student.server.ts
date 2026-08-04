import { getCurrentProfile, requireRole } from "@/lib/auth/current-profile";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import type { StudentRequest } from "@/lib/db/types/students.types";

/**
 * Creates a new student record. Restricted to secretaries and admins.
 * Records which profile created the student, for auditing.
 */
export async function createStudent(data: StudentRequest) {
  // Throws/redirects if the current user isn't a secretary or admin
  await requireRole("secretary", "admin");
  const currentUser = await getCurrentProfile();
  if (!currentUser) throw new Error("Not authenticated");
  const [student] = await db
    .insert(students)
    .values({
      ...data,
      admittedBy: currentUser.id 
    })
    .returning();

  return student;
}