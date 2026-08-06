// Next.js automatically wraps page.tsx in a Suspense boundary using this
// file as the fallback — no manual loading state needed in the page or
// component. Shown while getClasses() is still fetching.
export default function ClassesLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 w-16 animate-pulse rounded bg-[var(--line)]" />
          <div className="mt-2 h-8 w-40 animate-pulse rounded bg-[var(--line)]" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-full bg-[var(--line)]" />
      </div>

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
        <div className="h-4 w-32 animate-pulse rounded bg-[var(--line)]" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 animate-pulse rounded bg-[var(--line)]" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-10 animate-pulse rounded bg-[var(--line)]" />
      </td>
    </tr>
  );
}
