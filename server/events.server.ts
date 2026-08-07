
"use server"
import { requireRole } from "@/lib/auth/current-profile";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema/events";
import { desc, eq, gte, lt, lte, sql } from "drizzle-orm";
import { EventRequest, eventSchema, type Event } from "@/lib/db/types/events.types";
import { profiles } from "@/lib/db/schema";
import slugify from "slugify"
import { CarouselEvent } from "@/components/EventCarousel";

/**
 * Creates a new event. Restricted to admin and secretary.
 *
 * Note: eventSelectSchema currently includes authorId as a field the
 * caller must supply — see flag below. This implementation trusts
 * whatever authorId is passed in `data`, which is a security gap: a
 * malicious or buggy client could attribute the event to someone else's
 * profile. The safer version derives authorId from the authenticated
 * session instead (shown in the comment below the function).
 */
export async function createEvent(data: EventRequest) {
    const profile = await requireRole("admin", "secretary");
    const parsed = eventSchema.parse(data);
    const slug = slugify(parsed.title, { lower: true });
    const [event] = await db
        .insert(events)
        .values({ ...parsed, authorId: profile.id, slug })
        .returning();
    return event;
}


/**
* Updates an existing event. Restricted to admin and secretary.
*/
export async function updateEvent(slug: string, data: Partial<EventRequest>) {
    await requireRole("admin", "secretary");

    const parsed = eventSchema.partial().parse(data);

    const [event] = await db
        .update(events)
        .set(parsed)
        .where(eq(events.slug, slug))
        .returning();

    if (!event) throw new Error("Event not found");
    return event;
}

/**
 * Returns all events, most recent first. No role check — events are
 * publicly readable (per the events_read_all RLS policy), so this can be
 * called from the public marketing pages as well as the authenticated
 * dashboard, not just staff-gated routes.
 */
export async function getEvents(): Promise<Event[]> {
    const rows = await db.select().from(events).orderBy(desc(events.eventDate));
    return rows;
}

/**
 * Returns a single event by id, or null if it doesn't exist. Used by the
 * event details page.
 */

export type EventWithAuthor = Omit<Event, "authorId"> & {
    authorFirstName: string;
    authorLastName: string;
};

export async function getEventBySlug(slug: string): Promise<EventWithAuthor | null> {
    const [row] = await db
        .select({
            id: events.id,
            title: events.title,
            //   authorId:events.authorId,
            description: events.description,
            eventDate: events.eventDate,
            venue: events.venue,
            slug: events.slug,
            imageUrls: events.imageUrls,
            createdAt: events.createdAt,
            authorFirstName: profiles.firstName,
            authorLastName: profiles.lastName,
        })
        .from(events)
        .innerJoin(profiles, eq(profiles.id, events.authorId))
        .where(eq(events.slug, slug));

    return row ?? null;
}

/**
 * Returns only events happening today or later, soonest first — for the
 * "Upcoming events" section on the public events page.
 */
export async function getUpcomingEvents(): Promise<Event[]> {
    const now = new Date().toISOString();
    const rows = await db
        .select()
        .from(events)
        .where(gte(events.eventDate, now))
        .orderBy(events.eventDate).limit(3);
    return rows;
}

/**
 * Returns only events that have already happened, most recent first — for
 * the "Past events" carousel on the public events page.
 */
export async function getPastEvents(): Promise<CarouselEvent[]> {
    const now = new Date().toISOString();
    const rows = await db
        .select({
            slug: events.slug,
            title: events.title,
            // Postgres arrays are 1-indexed, not 0-indexed — [1] is the first
            // element, not [0]. Returns null if imageUrls is empty.
            imageUrl: sql<string >`${events.imageUrls}[1]`,
            venue: events.venue,
            eventDate: events.eventDate,
        })
        .from(events)
        .where(lte(events.eventDate, now))
        .orderBy(desc(events.eventDate)).limit(4);
    return rows;
}