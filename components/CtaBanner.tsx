import { Phone } from "lucide-react";

// Placeholder data — replace with real values, or fetch from a
// school-settings server method once one exists, matching the phone
// number shown on the /contacts page.
const SCHOOL_PHONE = "+254 700 123 456";

export function CtaBanner({
  heading = "Have a question?",
  body = "Give us a call — our team is happy to help with anything about admissions, rosters, or attendance.",
}: {
  heading?: string;
  body?: string;
}) {
  return (
    <section className="px-8 py-16 sm:px-12 sm:py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 rounded-2xl bg-[var(--brand-navy)] px-8 py-12 text-center sm:px-16">
        <h2 className="text-balance font-serif text-2xl text-white sm:text-3xl">
          {heading}
        </h2>
        <p className="max-w-md text-balance text-sm leading-relaxed text-white/60">
          {body}
        </p>
        <a
          href={`tel:${SCHOOL_PHONE.replace(/\s+/g, "")}`}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--brand-gold)] px-8 py-3 text-sm font-medium text-[var(--brand-navy)] transition-colors hover:bg-white"
        >
          <Phone className="h-4 w-4" />
          {SCHOOL_PHONE}
        </a>
      </div>
    </section>
  );
}