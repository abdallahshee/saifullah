CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('draft', 'sent');--> statement-breakpoint
CREATE TYPE "public"."term_name" AS ENUM('Term 1', 'Term 2', 'Term 3');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'secretary', 'teacher', 'parent');--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"profile_url" text,
	"last_name" text NOT NULL,
	"date_of_birth" date,
	"phone" text,
	"roles" "user_role"[],
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"class_url" text,
	"teacher_id" uuid,
	CONSTRAINT "classes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "classes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"profile_url" text,
	"date_of_birth" date,
	"class_id" uuid,
	"admitted_by" uuid,
	"admitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "student_guardians" (
	"student_id" uuid NOT NULL,
	"parent_id" uuid NOT NULL,
	"relationship" text NOT NULL,
	CONSTRAINT "student_guardians_student_id_parent_id_pk" PRIMARY KEY("student_id","parent_id")
);
--> statement-breakpoint
ALTER TABLE "student_guardians" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" "attendance_status" NOT NULL,
	"marked_by" uuid,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_records_class_student_date_unique" UNIQUE("class_id","student_id","date")
);
--> statement-breakpoint
ALTER TABLE "attendance_records" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" "term_name" NOT NULL,
	"year" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	CONSTRAINT "terms_year_name_unique" UNIQUE("year","name")
);
--> statement-breakpoint
ALTER TABLE "terms" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "class_term_fees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"term_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	CONSTRAINT "class_term_fees_term_class_unique" UNIQUE("term_id","class_id")
);
--> statement-breakpoint
ALTER TABLE "class_term_fees" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "fee_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"term_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fee_records_student_term_unique" UNIQUE("student_id","term_id")
);
--> statement-breakpoint
ALTER TABLE "fee_records" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "fee_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fee_record_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"mpesa_transaction_reference" text NOT NULL,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"recorded_by" uuid,
	CONSTRAINT "fee_payments_mpesa_transaction_reference_unique" UNIQUE("mpesa_transaction_reference")
);
--> statement-breakpoint
ALTER TABLE "fee_payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "academic_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"class_id" uuid,
	"teacher_id" uuid,
	"term_id" uuid NOT NULL,
	"summary" text NOT NULL,
	"status" "report_status" DEFAULT 'draft' NOT NULL,
	"sent_by" uuid,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "academic_reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_admitted_by_profiles_id_fk" FOREIGN KEY ("admitted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_parent_id_profiles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_marked_by_profiles_id_fk" FOREIGN KEY ("marked_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_term_fees" ADD CONSTRAINT "class_term_fees_term_id_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_term_fees" ADD CONSTRAINT "class_term_fees_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_records" ADD CONSTRAINT "fee_records_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_records" ADD CONSTRAINT "fee_records_term_id_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_records" ADD CONSTRAINT "fee_records_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_records" ADD CONSTRAINT "fee_records_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_fee_record_id_fee_records_id_fk" FOREIGN KEY ("fee_record_id") REFERENCES "public"."fee_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_recorded_by_profiles_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_reports" ADD CONSTRAINT "academic_reports_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_reports" ADD CONSTRAINT "academic_reports_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_reports" ADD CONSTRAINT "academic_reports_teacher_id_profiles_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_reports" ADD CONSTRAINT "academic_reports_term_id_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_reports" ADD CONSTRAINT "academic_reports_sent_by_profiles_id_fk" FOREIGN KEY ("sent_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE VIEW "public"."fee_balances" WITH (security_invoker = true) AS (select "fee_records"."id", "fee_records"."student_id", "fee_records"."term_id", "fee_records"."class_id", "class_term_fees"."amount", coalesce(sum("fee_payments"."amount"), 0) as "amount_paid", "class_term_fees"."amount" - coalesce(sum("fee_payments"."amount"), 0) as "amount_due" from "fee_records" inner join "class_term_fees" on ("class_term_fees"."term_id" = "fee_records"."term_id" and "class_term_fees"."class_id" = "fee_records"."class_id") left join "fee_payments" on "fee_payments"."fee_record_id" = "fee_records"."id" group by "fee_records"."id", "class_term_fees"."amount");--> statement-breakpoint
-- The functions below aren't part of lib/db/schema (Drizzle Kit has no
-- representation for plain SQL functions) - they're baked into this baseline
-- migration, rather than kept only in supabase/sql/rls-functions.sql,
-- because the CREATE POLICY statements right after this need them to exist
-- already. See supabase/sql/rls-functions.sql for the canonical, documented
-- source and the reasoning behind SECURITY DEFINER + search_path here.
CREATE OR REPLACE FUNCTION public.has_role(_role public.user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND _role = ANY(roles)
  );
$$;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.has_role(public.user_role) TO authenticated;--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.is_teacher_of_class(_class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes WHERE id = _class_id AND teacher_id = auth.uid()
  );
$$;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.is_teacher_of_class(uuid) TO authenticated;--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.is_parent_of_student(_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.student_guardians WHERE student_id = _student_id AND parent_id = auth.uid()
  );
$$;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.is_parent_of_student(uuid) TO authenticated;--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.is_parent_of_fee_record(_fee_record_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.fee_records fr
    JOIN public.student_guardians sg ON sg.student_id = fr.student_id
    WHERE fr.id = _fee_record_id AND sg.parent_id = auth.uid()
  );
$$;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.is_parent_of_fee_record(uuid) TO authenticated;--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.is_teacher_of_student(_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    WHERE s.id = _student_id AND c.teacher_id = auth.uid()
  );
$$;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.is_teacher_of_student(uuid) TO authenticated;--> statement-breakpoint
CREATE POLICY "profiles_select_own_or_admin" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("profiles"."id" = auth.uid() or has_role('admin'));--> statement-breakpoint
CREATE POLICY "profiles_insert_admin_only" ON "profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (has_role('admin'));--> statement-breakpoint
CREATE POLICY "profiles_update_own_or_admin" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("profiles"."id" = auth.uid() or has_role('admin')) WITH CHECK ("profiles"."id" = auth.uid() or has_role('admin'));--> statement-breakpoint
CREATE POLICY "profiles_delete_admin_only" ON "profiles" AS PERMISSIVE FOR DELETE TO "authenticated" USING (has_role('admin'));--> statement-breakpoint
CREATE POLICY "profiles_write_secretary_parent_only" ON "profiles" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_role('secretary') and 'parent' = any("profiles"."roles")) WITH CHECK (has_role('secretary') and 'parent' = any("profiles"."roles"));--> statement-breakpoint
CREATE POLICY "classes_select_any_staff" ON "classes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "classes_write_admin_only" ON "classes" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_role('admin')) WITH CHECK (has_role('admin'));--> statement-breakpoint
CREATE POLICY "students_select_secretary_admin" ON "students" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((has_role('secretary') or has_role('admin')));--> statement-breakpoint
CREATE POLICY "students_select_own_class_teacher" ON "students" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('teacher') and is_teacher_of_class("students"."class_id"));--> statement-breakpoint
CREATE POLICY "students_select_own_children_parent" ON "students" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('parent') and is_parent_of_student("students"."id"));--> statement-breakpoint
CREATE POLICY "students_write_secretary_only" ON "students" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_role('secretary')) WITH CHECK (has_role('secretary'));--> statement-breakpoint
CREATE POLICY "student_guardians_secretary_only" ON "student_guardians" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_role('secretary')) WITH CHECK (has_role('secretary'));--> statement-breakpoint
CREATE POLICY "student_guardians_parent_read_own" ON "student_guardians" AS PERMISSIVE FOR SELECT TO "authenticated" USING (parent_id = auth.uid());--> statement-breakpoint
CREATE POLICY "attendance_records_admin_override" ON "attendance_records" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_role('admin')) WITH CHECK (has_role('admin'));--> statement-breakpoint
CREATE POLICY "attendance_records_select_own_class_teacher" ON "attendance_records" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('teacher') and is_teacher_of_class("attendance_records"."class_id"));--> statement-breakpoint
CREATE POLICY "attendance_records_insert_own_class_teacher" ON "attendance_records" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (has_role('teacher') and is_teacher_of_class("attendance_records"."class_id"));--> statement-breakpoint
CREATE POLICY "attendance_records_select_own_children_parent" ON "attendance_records" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('parent') and is_parent_of_student("attendance_records"."student_id"));--> statement-breakpoint
CREATE POLICY "terms_select_any_staff" ON "terms" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "terms_write_secretary_admin" ON "terms" AS PERMISSIVE FOR ALL TO "authenticated" USING ((has_role('secretary') or has_role('admin'))) WITH CHECK ((has_role('secretary') or has_role('admin')));--> statement-breakpoint
CREATE POLICY "class_term_fees_select_any_staff" ON "class_term_fees" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "class_term_fees_write_secretary_admin" ON "class_term_fees" AS PERMISSIVE FOR ALL TO "authenticated" USING ((has_role('secretary') or has_role('admin'))) WITH CHECK ((has_role('secretary') or has_role('admin')));--> statement-breakpoint
CREATE POLICY "fee_records_secretary_full" ON "fee_records" AS PERMISSIVE FOR ALL TO "authenticated" USING (has_role('secretary')) WITH CHECK (has_role('secretary'));--> statement-breakpoint
CREATE POLICY "fee_records_admin_read" ON "fee_records" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('admin'));--> statement-breakpoint
CREATE POLICY "fee_records_select_own_children_parent" ON "fee_records" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('parent') and is_parent_of_student("fee_records"."student_id"));--> statement-breakpoint
CREATE POLICY "fee_payments_select_secretary" ON "fee_payments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('secretary'));--> statement-breakpoint
CREATE POLICY "fee_payments_insert_secretary" ON "fee_payments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (has_role('secretary'));--> statement-breakpoint
CREATE POLICY "fee_payments_select_admin" ON "fee_payments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('admin'));--> statement-breakpoint
CREATE POLICY "fee_payments_select_own_children_parent" ON "fee_payments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('parent') and is_parent_of_fee_record("fee_payments"."fee_record_id"));--> statement-breakpoint
CREATE POLICY "academic_reports_select_secretary" ON "academic_reports" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('secretary'));--> statement-breakpoint
CREATE POLICY "academic_reports_select_own_class_teacher" ON "academic_reports" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('teacher') and is_teacher_of_student("academic_reports"."student_id"));--> statement-breakpoint
CREATE POLICY "academic_reports_insert_teacher" ON "academic_reports" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (has_role('teacher') and is_teacher_of_student("academic_reports"."student_id"));--> statement-breakpoint
CREATE POLICY "academic_reports_update_teacher_own_draft" ON "academic_reports" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (has_role('teacher') and is_teacher_of_student("academic_reports"."student_id") and "academic_reports"."status" = 'draft') WITH CHECK (has_role('teacher') and is_teacher_of_student("academic_reports"."student_id"));--> statement-breakpoint
CREATE POLICY "academic_reports_update_secretary" ON "academic_reports" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (has_role('secretary')) WITH CHECK (has_role('secretary'));--> statement-breakpoint
CREATE POLICY "academic_reports_delete_teacher_own_draft" ON "academic_reports" AS PERMISSIVE FOR DELETE TO "authenticated" USING (has_role('teacher') and is_teacher_of_student("academic_reports"."student_id") and "academic_reports"."status" = 'draft');--> statement-breakpoint
CREATE POLICY "academic_reports_select_own_children_parent" ON "academic_reports" AS PERMISSIVE FOR SELECT TO "authenticated" USING (has_role('parent') and is_parent_of_student("academic_reports"."student_id") and "academic_reports"."status" = 'sent');