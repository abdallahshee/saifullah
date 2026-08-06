export default function ParentsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 w-16 animate-pulse rounded bg-[var(--line)]" />
          <div className="mt-2 h-8 w-36 animate-pulse rounded bg-[var(--line)]" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-full bg-[var(--line)]" />
      </div>

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
            {Array.from({ length: 5 }).map((_, i) => (
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
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 animate-pulse rounded-full bg-[var(--line)]" />
          <div className="h-4 w-28 animate-pulse rounded bg-[var(--line)]" />
        </div>
      </td>
      <td className="px-4 py-3"><div className="h-4 w-32 animate-pulse rounded bg-[var(--line)]" /></td>
      <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-[var(--line)]" /></td>
      <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-[var(--line)]" /></td>
    </tr>
  );
}