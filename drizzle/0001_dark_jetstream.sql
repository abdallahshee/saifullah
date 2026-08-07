CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"event_date" timestamp with time zone NOT NULL,
	"venue" text NOT NULL,
	"slug" text NOT NULL,
	"image_urls" text[] DEFAULT '{}' NOT NULL,
	"author_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "events_read_all" ON "events" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "events_insert_admin_secretary" ON "events" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (has_role('admin') or has_role('secretary'));--> statement-breakpoint
CREATE POLICY "events_update_admin_secretary" ON "events" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (has_role('admin') or has_role('secretary')) WITH CHECK (has_role('admin') or has_role('secretary'));--> statement-breakpoint
CREATE POLICY "events_delete_admin_secretary" ON "events" AS PERMISSIVE FOR DELETE TO "authenticated" USING (has_role('admin') or has_role('secretary'));