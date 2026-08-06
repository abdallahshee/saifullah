import Link from "next/link";
import { School, Users } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import type { ClassListItem } from "@/server/classes.server";

export function ClassesList({ classes }: { classes: ClassListItem[] }) {
  if (classes.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="mt-8 overflow-hidden rounded-lg border border-[var(--line)]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--paper)] text-xs uppercase tracking-wide text-[var(--slate)]">
          <tr>
            <th className="px-4 py-3 font-medium">Class</th>
            <th className="px-4 py-3 font-medium">Teacher</th>
            <th className="px-4 py-3 font-medium">Students</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {classes.map((c) => (
            <ClassRow key={c.id} classItem={c} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClassRow({ classItem }: { classItem: ClassListItem }) {
  return (
    <tr className="bg-white transition-colors hover:bg-[var(--paper)]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={classItem.classUrl}
            alt={classItem.name}
            shape="square"
            icon={<School />}
          />
          <Link
            href={`/classes/${classItem.id}`}
            className="font-medium text-[var(--ink)] hover:underline"
          >
            {classItem.name}
          </Link>
        </div>
      </td>
      <td className="px-4 py-3 text-[var(--slate)]">
        {classItem.teacherName ? (
          classItem.teacherName
        ) : (
          <span className="italic text-[var(--slate)]/70">Unassigned</span>
        )}
      </td>
      <td className="px-4 py-3 text-[var(--slate)]">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {classItem.studentCount}
        </span>
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 rounded-lg border border-dashed border-[var(--line)] px-6 py-16 text-center">
      <p className="text-sm text-[var(--slate)]">
        No classes yet — create the first one to get started.
      </p>
      <Link href="/dashboard/classes/new" className="btn btn-primary mt-4">
        + Create class
      </Link>
    </div>
  );
}
