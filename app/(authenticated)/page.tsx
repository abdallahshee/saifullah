import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--paper)]">
      <header className="flex items-center justify-between px-8 py-6 sm:px-12">
        <span className="font-serif text-lg text-[var(--ink)]">Roster</span>
        <Link
          href="/login"
          className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--brand-navy)] hover:text-[var(--brand-navy)]"
        >
          Sign in
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-8 py-20 text-center sm:px-12">
        <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
          SCHOOL OPERATIONS PLATFORM
        </p>

        <h1 className="mt-4 max-w-2xl text-balance font-serif text-4xl leading-tight text-[var(--ink)] sm:text-5xl">
          One record for every student, every day.
        </h1>

        <p className="mt-5 max-w-md text-balance text-base leading-relaxed text-[var(--slate)]">
          Admissions, rosters, and attendance — kept in one place, for
          everyone who needs to see it.
        </p>

        <Link
          href="/login"
          className="mt-8 rounded-full bg-[var(--brand-navy)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-navy-2)]"
        >
          Sign in to your account
        </Link>
      </main>

    

      <RollGridFooter />
    </div>
  );
}



// Quiet echo of the roll-call motif from the auth pages — fully "checked"
// here, as a calm closing note rather than the page's main visual event.
function RollGridFooter() {
  const cols = 40;
  return (
    <div className="flex justify-center gap-2 overflow-hidden bg-[var(--brand-navy)] py-6 opacity-90">
      {Array.from({ length: cols }, (_, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: "var(--brand-gold)", opacity: 0.5 }}
        />
      ))}
    </div>
  );
}