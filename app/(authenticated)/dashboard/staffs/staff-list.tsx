import Link from "next/link";
import type { StaffListItem } from "@/server/staff.server";

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-[var(--role-admin)]/15 text-[var(--role-admin)]",
  secretary: "bg-[var(--role-secretary)]/15 text-[var(--role-secretary)]",
  teacher: "bg-[var(--role-teacher)]/15 text-[var(--role-teacher)]",
};

export function StaffList({ staff }: { staff: StaffListItem[] }) {
  if (staff.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="mt-8 overflow-hidden rounded-lg border border-[var(--line)]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--paper)] text-xs uppercase tracking-wide text-[var(--slate)]">
          <tr>
            <th className="px-4 py-3 font-medium">First name</th>
            <th className="px-4 py-3 font-medium">Last name</th>
            <th className="px-4 py-3 font-medium">Roles</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {staff.map((s) => (
            <StaffRow key={s.id} staff={s} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StaffRow({ staff }: { staff: StaffListItem }) {
  return (
    <tr className="bg-white transition-colors hover:bg-[var(--paper)]">
      <td className="px-4 py-3">
        <Link
          href={`/staff/${staff.id}`}
          className="font-medium text-[var(--ink)] hover:underline"
        >
          {staff.firstName}
        </Link>
      </td>
      <td className="px-4 py-3 text-[var(--ink)]">{staff.lastName}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {staff.roles.map((role) => (
            <span
              key={role}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                ROLE_STYLES[role] ?? "bg-[var(--line)] text-[var(--slate)]"
              }`}
            >
              {role}
            </span>
          ))}
        </div>
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 rounded-lg border border-dashed border-[var(--line)] px-6 py-16 text-center">
      <p className="text-sm text-[var(--slate)]">
        No staff yet — add the first one to get started.
      </p>
      <Link href="/staff/new" className="btn btn-primary mt-4">
        + Add staff
      </Link>
    </div>
  );
}