import { getCurrentProfile } from "@/lib/auth/current-profile";
import { getStudents } from "@/server/student.server";
import Link from "next/link";
import { StudentsList } from "./students-list";


export default async function StudentsPage() {
  const [studentList, profile] = await Promise.all([
    getStudents(),
    getCurrentProfile(),
  ]);

  const canAdmit =
    !!profile &&
    (profile.roles.includes("admin") || profile.roles.includes("secretary"));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
            STUDENTS
          </p>
          <h1 className="mt-1 font-serif text-3xl text-[var(--ink)]">
            All students
          </h1>
        </div>

        {canAdmit && (
          <Link href="/students/new" className="btn btn-primary">
            + Admit student
          </Link>
        )}
      </div>

      <StudentsList students={studentList} canAdmit={canAdmit} />
    </div>
  );
}
