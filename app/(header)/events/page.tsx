import Link from "next/link";
import { ArrowRight, CalendarDays, CalendarX, MapPin } from "lucide-react";
import { EventCarousel } from "@/components/EventCarousel";
import { CtaBanner } from "@/components/CtaBanner";
import { getPastEvents, getUpcomingEvents } from "@/server/events.server";
import type { Event } from "@/lib/db/types/events.types";

export default async function EventsPage() {
  const [pastEvents, upcomingEvents] = await Promise.all([
    getPastEvents(),
    getUpcomingEvents(),
  ]);

  return (
    <div className="flex-1 bg-[var(--paper)]">
      <div className="px-8 py-16 sm:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
            EVENTS
          </p>
          <h1 className="mt-2 font-serif text-4xl text-[var(--ink)]">
            Life at our school
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--slate)]">
            A running record of what&rsquo;s happening on campus — recent
            highlights to look back on, and what&rsquo;s coming up next.
          </p>
        </div>
      </div>

      {/* Past highlights — full-width carousel */}
      <section className="px-8 sm:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-serif text-2xl text-[var(--ink)]">
            Recent highlights
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--slate)]">
            Photos and highlights from recent moments around the school —
            click a slide to read the full recap.
          </p>
          <div className="mt-6">
            {pastEvents.length > 0 ? (
              <EventCarousel events={pastEvents} />
            ) : (
              <EmptyState message="No past events to show yet." />
            )}
          </div>
        </div>
      </section>

      {/* Upcoming events — card grid */}
      <section className="mt-16 px-8 pb-16 sm:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-serif text-2xl text-[var(--ink)]">
            Upcoming events
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--slate)]">
            Mark your calendar — here&rsquo;s what&rsquo;s next.
          </p>

          {upcomingEvents.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <UpcomingEventCard key={event.slug} event={event} />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState message="No upcoming events scheduled yet." />
            </div>
          )}
        </div>
      </section>

      <CtaBanner heading="Want to know more about an event?" />
    </div>
  );
}

function UpcomingEventCard({ event }: { event: Event }) {
  const date = new Date(event.eventDate);
  const day = date.getDate();
  const month = date
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex gap-4 rounded-2xl border border-[var(--line)] bg-white p-5 transition-colors hover:border-[var(--brand-navy)]"
    >
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--brand-navy)] text-white">
        <span className="font-mono text-[10px] tracking-wide text-[var(--brand-gold)]">
          {month}
        </span>
        <span className="font-serif text-xl leading-none">{day}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-[var(--ink)] group-hover:underline">
          {event.title}
        </p>
        <div className="mt-2 flex flex-col gap-1 text-xs text-[var(--slate)]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            {time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {event.venue}
          </span>
        </div>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 self-center text-[var(--slate)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--brand-navy)]" />
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--line)] bg-white px-6 py-12 text-center">
      <CalendarX className="h-6 w-6 text-[var(--slate)]" />
      <p className="text-sm text-[var(--slate)]">{message}</p>
    </div>
  );
}
