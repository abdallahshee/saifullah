import { getCurrentProfile, requireRole } from "@/lib/auth/current-profile";
import { db } from "@/lib/db";
import { classes, students } from "@/lib/db/schema";
import type { StudentRequest } from "@/lib/db/types/students.types";
import { eq } from "drizzle-orm";

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

export type StudentListItem = {
  id: string;
  firstName: string;
  lastName: string;
  className: string | null;
};

/**
 * Returns every student with their class name. Restricted to admin,
 * secretary, and teacher — matches the students/ route's existing gate.
 */
export async function getStudents(): Promise<StudentListItem[]> {
  await requireRole("admin", "secretary", "teacher");

  const rows = await db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      className: classes.name,
    })
    .from(students)
    .leftJoin(classes, eq(classes.id, students.classId))
    .orderBy(students.lastName, students.firstName);

  return rows;
}