// Next.js wraps page.tsx in a Suspense boundary using this file as the
// fallback automatically — shown while past/upcoming events are still
// resolving on the server, once this page fetches real data.
export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-[var(--paper)] px-8 py-16 sm:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="h-3 w-16 animate-pulse rounded bg-[var(--line)]" />
        <div className="mt-2 h-9 w-64 animate-pulse rounded bg-[var(--line)]" />

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <div className="h-7 w-32 animate-pulse rounded bg-[var(--line)]" />
            <div className="mt-2 h-4 w-full max-w-sm animate-pulse rounded bg-[var(--line)]" />
            <div className="mt-6 aspect-[16/9] w-full animate-pulse rounded-2xl bg-[var(--line)]" />
          </div>

          <div className="flex flex-col gap-10">
            <div>
              <div className="h-7 w-40 animate-pulse rounded bg-[var(--line)]" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-xl bg-[var(--line)]"
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="h-7 w-36 animate-pulse rounded bg-[var(--line)]" />
              <div className="mt-6 h-48 animate-pulse rounded-xl bg-[var(--line)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
