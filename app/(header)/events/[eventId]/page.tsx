import Link from "next/link";
import { EventGallery, GalleryImage } from "@/components/EventGallery";
import { ArrowLeft, CalendarDays, Clock, MapPin } from "lucide-react";


// Placeholder data — replace with a real fetch, e.g. getEventById(eventId),
// once an events table/server method exists.
const EVENT = {
  title: "Annual Sports Day",
  date: "March 14, 2026",
  time: "9:00 AM – 3:00 PM",
  venue: "School Field",
  description:
    "Our Annual Sports Day brought together students, teachers, and families for a full day of athletics, team competitions, and friendly rivalry between houses. From the 100m sprint to the tug-of-war finale, the energy on the field was unmatched. A huge thank you to every parent and volunteer who helped make the day run smoothly.",
};

const GALLERY_IMAGES: GalleryImage[] = [
  { id: "1", url: "https://picsum.photos/seed/sports1/800/800", alt: "Sprint race at Sports Day" },
  { id: "2", url: "https://picsum.photos/seed/sports2/800/800", alt: "Tug of war finale" },
  { id: "3", url: "https://picsum.photos/seed/sports3/800/800", alt: "Students cheering from the stands" },
  { id: "4", url: "https://picsum.photos/seed/sports4/800/800", alt: "Relay handoff" },
  { id: "5", url: "https://picsum.photos/seed/sports5/800/800", alt: "Awards ceremony" },
  { id: "6", url: "https://picsum.photos/seed/sports6/800/800", alt: "Teachers and volunteers" },
];

export default function EventDetailsPage() {

  return (
    <div className="min-h-screen bg-[var(--paper)] px-8 py-16 sm:px-12">
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
          {EVENT.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--slate)]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {EVENT.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {EVENT.time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {EVENT.venue}
          </span>
        </div>

        <p className="mt-8 text-balance text-base leading-relaxed text-[var(--ink)]">
          {EVENT.description}
        </p>

        <div className="mt-12">
          <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
            GALLERY
          </p>
          <div className="mt-4">
            <EventGallery images={GALLERY_IMAGES} />
          </div>
        </div>
      </div>
    </div>
  );
}
