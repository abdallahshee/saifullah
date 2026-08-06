import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { ParentListItem } from "@/server/parent.server";


export function ParentsList({ parents }: { parents: ParentListItem[] }) {
  if (parents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="mt-8 overflow-hidden rounded-lg border border-[var(--line)]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--paper)] text-xs uppercase tracking-wide text-[var(--slate)]">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Phone</th>
            <th className="px-4 py-3 font-medium">Date of birth</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {parents.map((p) => (
            <ParentRow key={p.id} parent={p} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ParentRow({ parent }: { parent: ParentListItem }) {
  return (
    <tr className="bg-white transition-colors hover:bg-[var(--paper)]">
      <td className="px-4 py-3">
        <Link
          href={`/parents/${parent.id}`}
          className="flex items-center gap-3 font-medium text-[var(--ink)] hover:underline"
        >
          <Avatar profileUrl={parent.profileUrl} name={`${parent.firstName} ${parent.lastName}`} />
          {parent.firstName} {parent.lastName}
        </Link>
      </td>
      <td className="px-4 py-3 text-[var(--slate)]">{parent.email}</td>
      <td className="px-4 py-3 text-[var(--slate)]">
        {parent.phone ?? <span className="italic text-[var(--slate)]/70">—</span>}
      </td>
      <td className="px-4 py-3 text-[var(--slate)]">
        {formatDate(parent.dateOfBirth)}
      </td>
    </tr>
  );
}

function formatDate(value: string | null) {
  if (!value) return <span className="italic text-[var(--slate)]/70">—</span>;
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Avatar({ profileUrl, name }: { profileUrl: string | null; name: string }) {
  if (profileUrl) {
    return (
      <Image
        src={profileUrl}
        alt={name}
        width={28}
        height={28}
        className="h-7 w-7 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--line)] text-[var(--slate)]">
      <UserRound className="h-4 w-4" />
    </span>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 rounded-lg border border-dashed border-[var(--line)] px-6 py-16 text-center">
      <p className="text-sm text-[var(--slate)]">
        No parents yet — add the first one to get started.
      </p>
      <Link href="/parents/new" className="btn btn-primary mt-4">
        + Add parent
      </Link>
    </div>
  );
}