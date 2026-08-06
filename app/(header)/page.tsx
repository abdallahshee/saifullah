import { CarouselEvent, EventCarousel } from "@/components/EventCarousel";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className="flex flex-1 flex-col items-center px-8 py-16 text-center sm:px-12">
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

        <div className="mt-16 w-full">
          <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
            FROM OUR COMMUNITY
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[var(--ink)]">
            Moments from around the school
          </h2>

          {/* <div className="mt-8">
            <EventCarousel events={PAST_EVENTS} />
          </div> */}
        </div>
      </main>

      <RollGridFooter />
    </>
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
