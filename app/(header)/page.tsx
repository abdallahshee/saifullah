import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, ShieldCheck, Users } from "lucide-react";
import { CtaBanner } from "@/components/CtaBanner";

// Placeholder data — replace with real values, or fetch from a
// school-settings server method once one exists, matching the details
// shown on the /about page.
const SCHOOL_INFO = {
  motto: "Knowledge. Character. Excellence.",
  establishedYear: 1998,
};

const STATS = [
  { label: "Established", value: `${SCHOOL_INFO.establishedYear}` },
  { label: "Students enrolled", value: "420+" },
  { label: "Exam pass rate", value: "88%" },
];

const FEATURES = [
  {
    icon: Users,
    title: "Every learner is accounted for",
    body: "Small class sizes mean teachers catch gaps early and track each child's progress closely — not just at report card time.",
  },
  {
    icon: ShieldCheck,
    title: "A school built for focus",
    body: "Clear structure, clear expectations. Students spend their energy on learning, not navigating chaos.",
  },
  {
    icon: Award,
    title: "Results that speak for themselves",
    body: "Consistent exam performance, year after year, and graduates who go on to excel in secondary school and beyond.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--paper)]">
      {/* Hero */}
      <section className="px-8 py-16 sm:px-12 sm:py-20">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <div className="motion-safe:animate-[fade-up_0.7s_ease-out_0.3s_both]">
            <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
              SAIFULLAH INTEGRATED ACADEMY
            </p>
            <h1 className="mt-4 text-balance font-serif text-4xl leading-tight text-[var(--ink)] sm:text-5xl">
              One record for every student, every day.
            </h1>
            <p className="mt-5 max-w-md text-balance text-base leading-relaxed text-[var(--slate)]">
              Admissions, rosters, and attendance — kept in one place, for
              everyone who needs to see it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="inline-block rounded-full bg-[var(--brand-navy)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-navy-2)]"
              >
                Sign in to your account
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-navy)] transition-colors hover:text-[var(--brand-navy-2)]"
              >
                Learn about our school
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right: classroom photo */}
          <div className="relative motion-safe:animate-[image-reveal_0.8s_ease-out_0.5s_both]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="https://loremflickr.com/1000/750/classroom,students,school?lock=7"
                alt="Students learning in a classroom"
                fill
                priority
                className="object-cover"
              />
            </div>
            {/* Small roll-call accent, echoing the same motif from the auth pages */}
            <div className="absolute -bottom-4 -left-4 hidden rounded-xl bg-[var(--brand-navy)] px-4 py-3 shadow-lg sm:block">
              <div className="flex gap-1.5">
                {Array.from({ length: 6 }, (_, i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full "
                    style={{
                      backgroundColor:
                        i < 4 ? "var(--brand-gold)" : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
<section>
  <div
    className="mx-auto grid max-w-6xl gap-6 px-8 py-10 sm:px-12"
    style={{ gridTemplateColumns: `repeat(${STATS.length}, minmax(0, 1fr))` }}
  >
    {STATS.map((stat) => (
      <div
        key={stat.label}
        className="rounded-2xl bg-[var(--brand-navy)] px-5 py-6 text-center shadow-sm lg:text-left"
      >
        <p className="font-serif text-2xl text-white sm:text-3xl">
          {stat.value}
        </p>
        <p className="mt-1 font-mono text-[10px] tracking-[0.15em] text-[var(--brand-gold)] sm:text-xs">
          {stat.label.toUpperCase()}
        </p>
      </div>
    ))}
  </div>
</section>

      {/* Features */}
   <section className="px-8 py-16 sm:px-12 sm:py-20">
  <div className="mx-auto max-w-6xl">
    <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
      WHY FAMILIES CHOOSE US
    </p>
    <h2 className="mt-2 max-w-xl text-balance font-serif text-3xl text-[var(--ink)]">
      {SCHOOL_INFO.motto}
    </h2>

    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
      {FEATURES.map((feature) => (
        <div
          key={feature.title}
          className="rounded-xl border border-[var(--line)] bg-white p-6"
        >
          <feature.icon className="h-6 w-6 text-[var(--brand-navy)]" />
          <p className="mt-4 font-serif text-lg text-[var(--ink)]">
            {feature.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--slate)]">
            {feature.body}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>


      <CtaBanner />
    </div>
  );
}