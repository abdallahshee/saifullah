import Link from "next/link";
import { CalendarDays, CalendarX, MapPin } from "lucide-react";
import {  EventCarousel } from "@/components/EventCarousel";
import {  getPastEvents, getUpcomingEvents } from "@/server/events.server";



export default async function EventsPage() {
  const [pastEvents,comingEvents] = await Promise.all([
    getPastEvents(),
    getUpcomingEvents()
  ]);
  return (
    <div className="min-h-screen bg-[var(--paper)] px-8 py-16 sm:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
          EVENTS
        </p>
        <h1 className="mt-2 font-serif text-4xl text-[var(--ink)]">
          Life at our school
        </h1>

        <div className="mt-12">
          {/* Full-width row: past events carousel */}
          <div>
            <h2 className="font-serif text-2xl text-[var(--ink)]">
              Past events
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

          {/* Next row: upcoming events + term calendar, each half width */}
          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
            <section>
              <h2 className="font-serif text-2xl text-[var(--ink)]">
                Upcoming events
              </h2>
              
              {comingEvents.length > 0 ? (
                <ul className="mt-6 space-y-3">
                  {comingEvents.map((event) => (
                    <li key={event.slug}>
                      <Link
                        href={`/events/${event.slug}`}
                        className="block rounded-xl border border-[var(--line)] bg-white p-4 transition-colors hover:border-[var(--brand-navy)]"
                      >
                        <p className="font-medium text-[var(--ink)] hover:underline">
                          {event.title}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--slate)]">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {event.eventDate}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.venue}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-6">
                  <EmptyState message="No upcoming events scheduled yet." />
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
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
