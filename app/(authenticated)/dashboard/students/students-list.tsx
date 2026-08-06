import { StudentListItem } from "@/server/student.server";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";


export function StudentsList({
  students,
  canAdmit,
}: {
  students: StudentListItem[];
  canAdmit: boolean;
}) {
  if (students.length === 0) {
    return <EmptyState canAdmit={canAdmit} />;
  }

  return (
    <div className="mt-8 overflow-hidden rounded-lg border border-[var(--line)]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--paper)] text-xs uppercase tracking-wide text-[var(--slate)]">
          <tr>
            <th className="px-4 py-3 font-medium">First name</th>
            <th className="px-4 py-3 font-medium">Last name</th>
            <th className="px-4 py-3 font-medium">Class</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {students.map((s) => (
            <StudentRow key={s.id} student={s} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StudentRow({ student }: { student: StudentListItem }) {
  return (
    <tr className="bg-white transition-colors hover:bg-[var(--paper)]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={student.profileUrl}
            alt={`${student.firstName} ${student.lastName}`}
          />
          <Link
            href={`/students/${student.id}`}
            className="font-medium text-[var(--ink)] hover:underline"
          >
            {student.firstName}
          </Link>
        </div>
      </td>
      <td className="px-4 py-3 text-[var(--ink)]">{student.lastName}</td>
      <td className="px-4 py-3 text-[var(--slate)]">
        {student.className ? (
          student.className
        ) : (
          <span className="italic text-[var(--slate)]/70">Unassigned</span>
        )}
      </td>
    </tr>
  );
}

function EmptyState({ canAdmit }: { canAdmit: boolean }) {
  return (
    <div className="mt-8 rounded-lg border border-dashed border-[var(--line)] px-6 py-16 text-center">
      <p className="text-sm text-[var(--slate)]">
        {canAdmit
          ? "No students yet — admit the first one to get started."
          : "No students assigned to your class yet."}
      </p>
      {canAdmit && (
        <Link href="/students/new" className="btn btn-primary mt-4">
          + Admit student
        </Link>
      )}
    </div>
  );
}
