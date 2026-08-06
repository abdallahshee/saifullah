export default function StaffLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 w-12 animate-pulse rounded bg-[var(--line)]" />
          <div className="mt-2 h-8 w-32 animate-pulse rounded bg-[var(--line)]" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-full bg-[var(--line)]" />
      </div>

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
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="bg-white">
      <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-[var(--line)]" /></td>
      <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-[var(--line)]" /></td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-5 w-16 animate-pulse rounded-full bg-[var(--line)]" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-[var(--line)]" />
        </div>
      </td>
    </tr>
  );
}