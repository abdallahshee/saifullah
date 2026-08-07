// Next.js wraps page.tsx in a Suspense boundary using this file as the
// fallback automatically — shown while past/upcoming events are still
// resolving on the server.
export default function EventsLoading() {
  return (
    <div className="flex-1 bg-[var(--paper)]">
      <div className="px-8 py-16 sm:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="h-3 w-16 animate-pulse rounded bg-[var(--line)]" />
          <div className="mt-2 h-9 w-64 animate-pulse rounded bg-[var(--line)]" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-[var(--line)]" />
        </div>
      </div>

      <div className="px-8 sm:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="h-7 w-48 animate-pulse rounded bg-[var(--line)]" />
          <div className="mt-2 h-4 w-full max-w-sm animate-pulse rounded bg-[var(--line)]" />
          <div className="mt-6 aspect-[16/9] w-full animate-pulse rounded-2xl bg-[var(--line)]" />
        </div>
      </div>

      <div className="mt-16 px-8 pb-16 sm:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="h-7 w-40 animate-pulse rounded bg-[var(--line)]" />
          <div className="mt-2 h-4 w-full max-w-xs animate-pulse rounded bg-[var(--line)]" />
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-[var(--line)]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
