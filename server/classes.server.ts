import { requireRole } from "@/lib/auth/current-profile";
import { db } from "@/lib/db";
import { classes, students, profiles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export type ClassListItem = {
  id: string;
  name: string;
  teacherName: string | null;
  studentCount: number;
};

/**
 * Returns every class in the school. Restricted to admin and secretary —
 * no further scoping needed since both roles see the same full list.
 */
export async function getClasses(): Promise<ClassListItem[]> {
  await requireRole("admin", "secretary","teacher","parent");

  const rows = await db
    .select({
      id: classes.id,
      name: classes.name,
      teacherName: sql<string | null>`concat(${profiles.firstName}, ' ', ${profiles.lastName})`,
      studentCount: sql<number>`count(${students.id})::int`,
    })
    .from(classes)
    .leftJoin(profiles, eq(profiles.id, classes.teacherId))
    .leftJoin(students, eq(students.classId, classes.id))
    .groupBy(classes.id, profiles.firstName, profiles.lastName)
    .orderBy(classes.name);

  return rows;
}