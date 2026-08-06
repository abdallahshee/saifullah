import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { getTodayAttendance } from "@/server/attendance.server";
import { getStudentById } from "@/server/student.server";
import { getParentsByStudentId } from "@/server/parent.server";

// Consistent color per relationship type, same "dot + label" legend
// pattern used in the route architecture diagram — not a badge/pill.
const RELATIONSHIP_COLORS: Record<string, string> = {
  mother: "#B0766C",
  father: "#6C7FB0",
  guardian: "#7B9E89",
};
const DEFAULT_RELATIONSHIP_COLOR = "#94A3B8";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  const [student, guardians, todayAttendance] = await Promise.all([
    getStudentById(studentId),
    getParentsByStudentId(studentId),
    getTodayAttendance(studentId),
  ]);

  if (!student) notFound();

  return (
    <div className="p-6">
      <Link
        href="/dashboard/students"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--slate)] transition-colors hover:text-[var(--ink)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to students
      </Link>

      <p className="mt-4 font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
        STUDENT
      </p>
      <h2 className="mt-1 font-serif text-2xl text-[var(--ink)]">
        {student.firstName} {student.lastName}
      </h2>

      <div className="mt-4">
        <AttendanceBadge attendance={todayAttendance} />
      </div>

      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--slate)]">
            Class
          </dt>
          <dd className="mt-1 text-[var(--ink)]">
            {student.className ?? "Unassigned"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--slate)]">
            Date of birth
          </dt>
          <dd className="mt-1 text-[var(--ink)]">
            {student.dateOfBirth
              ? new Date(student.dateOfBirth).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-[var(--slate)]">
            Parents / guardians
          </p>
          {guardians.length > 0 && <RelationshipLegend guardians={guardians} />}
        </div>

        {guardians.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--slate)]">
            No guardians linked yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {guardians.map((g) => (
              <li
                key={g.id}
                className="rounded-lg border border-[var(--line)] p-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        RELATIONSHIP_COLORS[g.relationship.toLowerCase()] ??
                        DEFAULT_RELATIONSHIP_COLOR,
                    }}
                    aria-hidden="true"
                  />
                  <Link
                    href={`/parents/${g.id}`}
                    className="text-sm font-medium text-[var(--ink)] hover:underline"
                  >
                    {g.firstName} {g.lastName}
                  </Link>
                </div>
                <p className="mt-1 pl-4 text-xs text-[var(--slate)]">
                  {g.email}
                </p>
                {g.phone && (
                  <p className="pl-4 text-xs text-[var(--slate)]">{g.phone}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href={`/students/${student.id}/edit`}
        className="btn btn-primary btn-sm mt-6"
      >
        Edit
      </Link>
    </div>
  );
}

// Small legend explaining what each dot color means — only lists the
// relationship types actually present among this student's guardians,
// so it never shows an irrelevant entry (e.g. "Father" for a
// single-mother household).
function RelationshipLegend({
  guardians,
}: {
  guardians: Awaited<ReturnType<typeof getParentsByStudentId>>;
}) {
  const present = Array.from(
    new Set(guardians.map((g) => g.relationship.toLowerCase())),
  );

  return (
    <div className="flex items-center gap-3">
      {present.map((relationship) => (
        <span
          key={relationship}
          className="flex items-center gap-1.5 text-xs capitalize text-[var(--slate)]"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor:
                RELATIONSHIP_COLORS[relationship] ?? DEFAULT_RELATIONSHIP_COLOR,
            }}
            aria-hidden="true"
          />
          {relationship}
        </span>
      ))}
    </div>
  );
}

function AttendanceBadge({
  attendance,
}: {
  attendance: Awaited<ReturnType<typeof getTodayAttendance>>;
}) {
  if (!attendance) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--paper)] px-3 py-1 text-xs font-medium text-[var(--slate)]">
        <HelpCircle className="h-3.5 w-3.5" />
        Not marked yet today
      </span>
    );
  }

  if (attendance.status === "present") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Present today
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
      <XCircle className="h-3.5 w-3.5" />
      Absent today
    </span>
  );
}
