"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CarouselEvent = {
  slug: string;
  title: string;
  // description:string,
  imageUrl: string;
  venue:string,
  eventDate: string; // display-ready string, e.g. "March 14, 2025"
};


export function EventCarousel({ events }: { events: CarouselEvent[] }) {
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (i: number) => setIndex(((i % events.length) + events.length) % events.length),
    [events.length],
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay — pauses implicitly whenever the component unmounts, and
  // resets whenever someone manually navigates (via the index dependency)
  // so a manual click doesn't get immediately overridden by the timer.
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  if (events.length === 0) return null;

  return (
    <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-2xl">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {events.map((event) => (
          <div key={event.slug} className="relative aspect-21/9 w-full shrink-0 sm:aspect-3/1">
            <Link href={`/events/${event.slug}`} className="group block h-full w-full">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={event.slug=== events[0].slug}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                {/* <p className="font-mono text-xs tracking-[0.2em] text-[var(--brand-gold)]">
                  PAST EVENT
                </p> */}
                <h3 className="mt-2 max-w-md font-serif text-2xl text-white underline-offset-4 group-hover:underline sm:text-3xl">
                  {event.title}
                </h3>
                <p className="mt-1 text-sm text-white/70">{event.eventDate}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Prev/next controls */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous event"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-[var(--ink)] backdrop-blur transition-colors hover:bg-white"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next event"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-[var(--ink)] backdrop-blur transition-colors hover:bg-white"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {events.map((event, i) => (
          <button
            key={event.slug}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to ${event.title}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
