import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="flex items-center justify-between px-8 py-6 sm:px-12">
      <span className="font-serif text-lg text-[var(--ink)]">Roster</span>
      <Link
        href="/auth/login"
        className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--brand-navy)] hover:text-[var(--brand-navy)]"
      >
        Sign in
      </Link>
    </header>
  );
}