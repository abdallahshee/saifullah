"use server";

import { getCurrentProfile, requireRole } from "@/lib/auth/current-profile";
import { db } from "@/lib/db";
import { classes, studentGuardians, students } from "@/lib/db/schema";
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
  profileUrl: string | null;
  className: string | null;
  classUrl: string | null;
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
      profileUrl: students.profileUrl,
      className: classes.name,
      classUrl: classes.classUrl,
    })
    .from(students)
    .leftJoin(classes, eq(classes.id, students.classId))
    .orderBy(students.lastName, students.firstName);

  return rows;
}


export type MyChildListItem = {
  id: string;
  firstName: string;
  lastName: string;
  profileUrl: string | null;
  className: string | null;
  classUrl: string | null;
  relationship: string;
};

/**
 * Returns the students linked to the current parent's account via
 * student_guardians. Restricted to the "parent" role, and scoped to only
 * the rows where the join table's parentId matches the caller's own id —
 * a parent can never see another family's children through this method.
 */
export async function getMyChildren(): Promise<MyChildListItem[]> {
  const profile = await requireRole("parent","admin","teacher","secretary");

  const rows = await db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      profileUrl: students.profileUrl,
      className: classes.name,
      classUrl: classes.classUrl,
      relationship: studentGuardians.relationship,
    })
    .from(studentGuardians)
    .innerJoin(students, eq(students.id, studentGuardians.studentId))
    .leftJoin(classes, eq(classes.id, students.classId))
    .where(eq(studentGuardians.parentId, profile.id))
    .orderBy(students.firstName);

  return rows;
}


export type StudentDetail = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  className: string | null;
};

export async function getStudentById(studentId: string): Promise<StudentDetail | null> {
  await requireRole("admin", "secretary", "teacher");

  const [row] = await db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      profilePic:students.profileUrl,
      dateOfBirth: students.dateOfBirth,
      className: classes.name,
    })
    .from(students)
    .leftJoin(classes, eq(classes.id, students.classId))
    .where(eq(students.id, studentId));

  return row ?? null;
}