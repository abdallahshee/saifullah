"use server";

import { and, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/current-profile";
import { db } from "@/lib/db";
import { attendanceRecords, classes, students } from "@/lib/db/schema";
import {
  MarkAttendanceRequest,
  markAttendanceSchema,
} from "@/lib/db/types/attendance-records.types";

/**
 * Drizzle queries run over DATABASE_URL as a fixed DB role, so table RLS
 * policies don't apply here - a teacher must be checked against the class
 * they actually teach by hand. Admins bypass this (their override policy
 * covers every class).
 */
// async function assertCanMarkClass(classId: string) {
//   const profile = await requireRole("teacher", "admin");
//   if (profile.roles.includes("admin")) return profile;

//   const [klass] = await db.select().from(classes).where(eq(classes.id, classId));
//   if (!klass || klass.teacherId !== profile.id) {
//     throw new Error("You are not the teacher of this class");
//   }
//   return profile;
// }

export type ClassRosterEntry = {
  studentId: string;
  firstName: string;
  lastName: string;
  status: "present" | "absent" | null;
};

/**
 * Every student in the class, joined with their attendance status for the
 * given date - null where the student hasn't been marked yet.
 */
export async function getClassAttendanceRoster(
  classId: string,
  date: string,
): Promise<ClassRosterEntry[]> {
  // await assertCanMarkClass(classId);

  return db
    .select({
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      status: attendanceRecords.status,
    })
    .from(students)
    .leftJoin(
      attendanceRecords,
      and(
        eq(attendanceRecords.studentId, students.id),
        eq(attendanceRecords.classId, classId),
        eq(attendanceRecords.date, date),
      ),
    )
    .where(eq(students.classId, classId));
}

/**
 * Submits the daily register for a whole class in one go. Once submitted,
 * the register is locked for teachers - correcting it afterwards is an
 * admin override, not something this method supports.
 */
export async function submitClassAttendance(input: MarkAttendanceRequest) {
  const profile = await requireRole("teacher", "secretary");
  const parsed = markAttendanceSchema.parse(input);

  const roster = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.classId, parsed.classId));

  const existing = await db
    .select({ id: attendanceRecords.id })
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.classId, parsed.classId),
        eq(attendanceRecords.date, parsed.date),
      ),
    );
  if (existing.length > 0) {
    throw new Error("Attendance for this class has already been submitted for this date");
  }

  return db
    .insert(attendanceRecords)
    .values(
      parsed.records.map((record) => ({
        classId: parsed.classId,
        studentId: record.studentId,
        date: parsed.date,
        status: record.status,
        markedBy: profile.id,
      })),
    )
    .returning();
}
