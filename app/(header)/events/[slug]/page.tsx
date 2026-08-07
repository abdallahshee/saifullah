import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin } from "lucide-react";
import { EventGallery, type GalleryImage } from "@/components/EventGallery";
import { getEventBySlug } from "@/server/events.server";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const galleryImages: GalleryImage[] = event.imageUrls.map((url, i) => ({
    id: `${event.id}-${i}`,
    url,
    alt: event.title,
  }));

  return (
    <div className="flex-1 bg-[var(--paper)] px-8 py-16 sm:px-12">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--slate)] transition-colors hover:text-[var(--ink)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>

        <p className="mt-6 font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
          EVENT
        </p>
        <h1 className="mt-2 font-serif text-4xl text-[var(--ink)]">
          {event.title}
        </h1>
        <p className="mt-1 text-xs text-[var(--slate)]">
          Posted by {event.authorFirstName} {event.authorLastName}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--slate)]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {formattedDate}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {formattedTime}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {event.venue}
          </span>
        </div>

        <p className="mt-8 text-balance text-base leading-relaxed text-[var(--ink)]">
          {event.description}
        </p>

        {galleryImages.length > 0 && (
          <div className="mt-12">
            <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
              GALLERY
            </p>
            <div className="mt-4">
              <EventGallery images={galleryImages} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}