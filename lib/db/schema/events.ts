import { pgTable, uuid, text, timestamp, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { anonRole, authenticatedRole } from "drizzle-orm/supabase";
import { profiles } from "./profiles"; // adjust path to wherever profiles is defined

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    eventDate: timestamp("event_date",{mode:"string", withTimezone: true }).notNull(),
    venue: text("venue").notNull(),
    slug:text("slug").notNull(),
    imageUrls: text("image_urls").array().notNull().default([]),
    authorId: uuid("author_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Everyone can read events — including unauthenticated visitors on
    // the public marketing pages (about/events/contacts), not just
    // logged-in staff.
    pgPolicy("events_read_all", {
      for: "select",
      to: [anonRole, authenticatedRole],
      using: sql`true`,
    }),

    // Only admin and secretary can create events.
    pgPolicy("events_insert_admin_secretary", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`has_role('admin') or has_role('secretary')`,
    }),

    // Only admin and secretary can edit events.
    pgPolicy("events_update_admin_secretary", {
      for: "update",
      to: authenticatedRole,
      using: sql`has_role('admin') or has_role('secretary')`,
      withCheck: sql`has_role('admin') or has_role('secretary')`,
    }),

    // Only admin and secretary can delete events.
    pgPolicy("events_delete_admin_secretary", {
      for: "delete",
      to: authenticatedRole,
      using: sql`has_role('admin') or has_role('secretary')`,
    }),
  ],
).enableRLS();