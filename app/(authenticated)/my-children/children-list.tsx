import { MyChildListItem } from "@/server/student.server";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";

export function MyChildrenList({ children }: { children: MyChildListItem[] }) {
  if (children.length === 0) {
    return <EmptyState />;
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
          {children.map((child) => (
            <ChildRow key={child.id} child={child} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChildRow({ child }: { child: MyChildListItem }) {
  return (
    <tr className="bg-white transition-colors hover:bg-[var(--paper)]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={child.profileUrl}
            alt={`${child.firstName} ${child.lastName}`}
          />
          <Link
            href={`/my-children/${child.id}`}
            className="font-medium text-[var(--ink)] hover:underline"
          >
            {child.firstName}
          </Link>
        </div>
      </td>
      <td className="px-4 py-3 text-[var(--ink)]">{child.lastName}</td>
      <td className="px-4 py-3 text-[var(--slate)]">
        {child.className ? (
          child.className
        ) : (
          <span className="italic text-[var(--slate)]/70">Unassigned</span>
        )}
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 rounded-lg border border-dashed border-[var(--line)] px-6 py-16 text-center">
      <p className="text-sm text-[var(--slate)]">
        No children linked to your account yet. If this seems wrong, contact
        the school secretary.
      </p>
    </div>
  );
}