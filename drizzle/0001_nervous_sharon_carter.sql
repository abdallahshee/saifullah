CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent');--> statement-breakpoint
-- user_role gets a new value ('parent'), but Postgres won't let a freshly
-- added enum value be used (e.g. cast from the 'parent' string literal in
-- the policies below) within the same transaction that added it - and
-- drizzle's migrator runs every pending migration file in one transaction.
-- Recreating the type from scratch (rather than ALTER TYPE ... ADD VALUE)
-- sidesteps that restriction entirely, since a brand-new type has no such
-- restriction on the values it's created with.
ALTER TYPE "public"."user_role" RENAME TO "user_role_old";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'secretary', 'teacher', 'parent');--> statement-breakpoint
CREATE TABLE "profile_roles" (
	"profile_id" uuid NOT NULL,
	"role" "user_role" NOT NULL,
	CONSTRAINT "profile_roles_profile_id_role_pk" PRIMARY KEY("profile_id","role")
);
--> statement-breakpoint
ALTER TABLE "profile_roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" "attendance_status" NOT NULL,
	"marked_by" uuid,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_records_student_date_unique" UNIQUE("student_id","date")
);
--> statement-breakpoint
ALTER TABLE "attendance_records" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY "parents_secretary_only" ON "parents" CASCADE;--> statement-breakpoint
-- CASCADE also drops student_guardians_parent_id_parents_id_fk (it depends
-- on parents' PK) - no separate ALTER TABLE ... DROP CONSTRAINT needed for it.
DROP TABLE "parents" CASCADE;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "phone" text;--> statement-breakpoint
-- No default/backfill: dev-stage table, expected empty. If academic_reports
-- ever has rows before this runs, this NOT NULL add will fail and needs a
-- backfill first.
ALTER TABLE "academic_reports" ADD COLUMN "term_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_roles" ADD CONSTRAINT "profile_roles_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_marked_by_profiles_id_fk" FOREIGN KEY ("marked_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_parent_id_profiles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_reports" ADD CONSTRAINT "academic_reports_term_id_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Preserve any existing profiles.role values as profile_roles rows before
-- the column goes away.
INSERT INTO "profile_roles" ("profile_id", "role") SELECT "id", "role"::text::"public"."user_role" FROM "profiles" WHERE "role" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "academic_reports" DROP COLUMN "term";--> statement-breakpoint
-- RLS helper functions. SECURITY DEFINER so they can read "profile_roles"/
-- "student_guardians"/"fee_records" on the caller's behalf without those
-- reads recursing back through RLS.
CREATE FUNCTION public.has_role(p_role "public"."user_role")
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profile_roles
    WHERE profile_id = auth.uid() AND role = p_role
  )
$$;--> statement-breakpoint
CREATE FUNCTION public.is_parent_of_student(p_student_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM student_guardians
    WHERE student_id = p_student_id AND parent_id = auth.uid()
  )
$$;--> statement-breakpoint
CREATE FUNCTION public.is_parent_of_fee_record(p_fee_record_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM fee_records fr
    JOIN student_guardians sg ON sg.student_id = fr.student_id
    WHERE fr.id = p_fee_record_id AND sg.parent_id = auth.uid()
  )
$$;--> statement-breakpoint
CREATE POLICY "profiles_write_secretary_parent_only" ON "profiles" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_role('secretary') and exists (select 1 from profile_roles pr where pr.profile_id = "profiles"."id" and pr.role = 'parent')) WITH CHECK (has_role('secretary') and exists (select 1 from profile_roles pr where pr.profile_id = "profiles"."id" and pr.role = 'parent'));--> statement-breakpoint
CREATE POLICY "students_select_own_children_parent" ON "students" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('parent') and is_parent_of_student("students"."id"));--> statement-breakpoint
CREATE POLICY "fee_records_select_own_children_parent" ON "fee_records" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('parent') and is_parent_of_student("fee_records"."student_id"));--> statement-breakpoint
CREATE POLICY "fee_payments_select_own_children_parent" ON "fee_payments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('parent') and is_parent_of_fee_record("fee_payments"."fee_record_id"));--> statement-breakpoint
CREATE POLICY "academic_reports_select_own_children_parent" ON "academic_reports" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('parent') and is_parent_of_student("academic_reports"."student_id") and "academic_reports"."status" = 'sent');--> statement-breakpoint
CREATE POLICY "profile_roles_select_own_or_admin" ON "profile_roles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("profile_roles"."profile_id" = auth.uid() or has_role('admin'));--> statement-breakpoint
CREATE POLICY "profile_roles_write_admin_only" ON "profile_roles" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_role('admin')) WITH CHECK (has_role('admin'));--> statement-breakpoint
CREATE POLICY "profile_roles_write_secretary_parent_only" ON "profile_roles" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_role('secretary') and "profile_roles"."role" = 'parent') WITH CHECK (has_role('secretary') and "profile_roles"."role" = 'parent');--> statement-breakpoint
CREATE POLICY "attendance_records_admin_override" ON "attendance_records" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_role('admin')) WITH CHECK (has_role('admin'));--> statement-breakpoint
CREATE POLICY "attendance_records_select_own_class_teacher" ON "attendance_records" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('teacher') and is_teacher_of_student("attendance_records"."student_id"));--> statement-breakpoint
CREATE POLICY "attendance_records_insert_own_class_teacher" ON "attendance_records" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (has_role('teacher') and is_teacher_of_student("attendance_records"."student_id"));--> statement-breakpoint
CREATE POLICY "attendance_records_select_own_children_parent" ON "attendance_records" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('parent') and is_parent_of_student("attendance_records"."student_id"));--> statement-breakpoint
ALTER POLICY "profiles_select_own_or_admin" ON "profiles" TO authenticated USING ("profiles"."id" = auth.uid() or has_role('admin'));--> statement-breakpoint
ALTER POLICY "profiles_insert_admin_only" ON "profiles" TO authenticated WITH CHECK (has_role('admin'));--> statement-breakpoint
ALTER POLICY "profiles_update_own_or_admin" ON "profiles" TO authenticated USING ("profiles"."id" = auth.uid() or has_role('admin')) WITH CHECK ("profiles"."id" = auth.uid() or has_role('admin'));--> statement-breakpoint
ALTER POLICY "profiles_delete_admin_only" ON "profiles" TO authenticated USING (has_role('admin'));--> statement-breakpoint
ALTER POLICY "classes_write_admin_only" ON "classes" TO authenticated USING (has_role('admin')) WITH CHECK (has_role('admin'));--> statement-breakpoint
ALTER POLICY "students_select_secretary_admin" ON "students" TO authenticated USING ((has_role('secretary') or has_role('admin')));--> statement-breakpoint
ALTER POLICY "students_select_own_class_teacher" ON "students" TO authenticated USING (has_role('teacher') and is_teacher_of_class("students"."class_id"));--> statement-breakpoint
ALTER POLICY "students_write_secretary_only" ON "students" TO authenticated USING (has_role('secretary')) WITH CHECK (has_role('secretary'));--> statement-breakpoint
ALTER POLICY "student_guardians_secretary_only" ON "student_guardians" TO authenticated USING (has_role('secretary')) WITH CHECK (has_role('secretary'));--> statement-breakpoint
ALTER POLICY "terms_write_secretary_admin" ON "terms" TO authenticated USING ((has_role('secretary') or has_role('admin'))) WITH CHECK ((has_role('secretary') or has_role('admin')));--> statement-breakpoint
ALTER POLICY "class_term_fees_write_secretary_admin" ON "class_term_fees" TO authenticated USING ((has_role('secretary') or has_role('admin'))) WITH CHECK ((has_role('secretary') or has_role('admin')));--> statement-breakpoint
ALTER POLICY "fee_records_secretary_full" ON "fee_records" TO authenticated USING (has_role('secretary')) WITH CHECK (has_role('secretary'));--> statement-breakpoint
ALTER POLICY "fee_records_admin_read" ON "fee_records" TO authenticated USING (has_role('admin'));--> statement-breakpoint
ALTER POLICY "fee_payments_select_secretary" ON "fee_payments" TO authenticated USING (has_role('secretary'));--> statement-breakpoint
ALTER POLICY "fee_payments_insert_secretary" ON "fee_payments" TO authenticated WITH CHECK (has_role('secretary'));--> statement-breakpoint
ALTER POLICY "fee_payments_select_admin" ON "fee_payments" TO authenticated USING (has_role('admin'));--> statement-breakpoint
ALTER POLICY "academic_reports_select_secretary" ON "academic_reports" TO authenticated USING (has_role('secretary'));--> statement-breakpoint
ALTER POLICY "academic_reports_select_own_class_teacher" ON "academic_reports" TO authenticated USING (has_role('teacher') and is_teacher_of_student("academic_reports"."student_id"));--> statement-breakpoint
ALTER POLICY "academic_reports_insert_teacher" ON "academic_reports" TO authenticated WITH CHECK (has_role('teacher') and is_teacher_of_student("academic_reports"."student_id"));--> statement-breakpoint
ALTER POLICY "academic_reports_update_teacher_own_draft" ON "academic_reports" TO authenticated USING (has_role('teacher') and is_teacher_of_student("academic_reports"."student_id") and "academic_reports"."status" = 'draft') WITH CHECK (has_role('teacher') and is_teacher_of_student("academic_reports"."student_id"));--> statement-breakpoint
ALTER POLICY "academic_reports_update_secretary" ON "academic_reports" TO authenticated USING (has_role('secretary')) WITH CHECK (has_role('secretary'));--> statement-breakpoint
ALTER POLICY "academic_reports_delete_teacher_own_draft" ON "academic_reports" TO authenticated USING (has_role('teacher') and is_teacher_of_student("academic_reports"."student_id") and "academic_reports"."status" = 'draft');--> statement-breakpoint
-- Now safe to drop: no policy references current_app_role() anymore (all
-- altered above to has_role()), and no column uses user_role_old anymore.
DROP FUNCTION public.current_app_role();--> statement-breakpoint
DROP TYPE "public"."user_role_old";
