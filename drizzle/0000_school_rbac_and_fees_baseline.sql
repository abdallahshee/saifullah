CREATE TYPE "public"."report_status" AS ENUM('draft', 'sent');--> statement-breakpoint
CREATE TYPE "public"."term_name" AS ENUM('Term 1', 'Term 2', 'Term 3');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'secretary', 'teacher');--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"teacher_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "classes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "classes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"date_of_birth" date,
	"class_id" uuid,
	"admitted_by" uuid,
	"admitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "parents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "student_guardians" (
	"student_id" uuid NOT NULL,
	"parent_id" uuid NOT NULL,
	"relationship" text NOT NULL,
	CONSTRAINT "student_guardians_student_id_parent_id_pk" PRIMARY KEY("student_id","parent_id")
);
--> statement-breakpoint
ALTER TABLE "student_guardians" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
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
	"term" text NOT NULL,
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
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "academic_reports" ADD CONSTRAINT "academic_reports_sent_by_profiles_id_fk" FOREIGN KEY ("sent_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE VIEW "public"."fee_balances" WITH (security_invoker = true) AS (select "fee_records"."id", "fee_records"."student_id", "fee_records"."term_id", "fee_records"."class_id", "class_term_fees"."amount", coalesce(sum("fee_payments"."amount"), 0) as "amount_paid", "class_term_fees"."amount" - coalesce(sum("fee_payments"."amount"), 0) as "amount_due" from "fee_records" inner join "class_term_fees" on ("class_term_fees"."term_id" = "fee_records"."term_id" and "class_term_fees"."class_id" = "fee_records"."class_id") left join "fee_payments" on "fee_payments"."fee_record_id" = "fee_records"."id" group by "fee_records"."id", "class_term_fees"."amount");--> statement-breakpoint
-- RLS helper functions. SECURITY DEFINER so they can read "profiles"/"classes"/
-- "students" on the caller's behalf without those reads recursing back through
-- RLS (which would happen if a policy queried those tables directly).
CREATE FUNCTION public.current_app_role()
RETURNS "public"."user_role"
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;--> statement-breakpoint
CREATE FUNCTION public.is_teacher_of_class(p_class_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM classes
    WHERE id = p_class_id AND teacher_id = auth.uid()
  )
$$;--> statement-breakpoint
CREATE FUNCTION public.is_teacher_of_student(p_student_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM students s
    JOIN classes c ON c.id = s.class_id
    WHERE s.id = p_student_id AND c.teacher_id = auth.uid()
  )
$$;--> statement-breakpoint
CREATE POLICY "profiles_select_own_or_admin" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("profiles"."id" = auth.uid() or current_app_role() = 'admin');--> statement-breakpoint
CREATE POLICY "profiles_insert_admin_only" ON "profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (current_app_role() = 'admin');--> statement-breakpoint
CREATE POLICY "profiles_update_own_or_admin" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("profiles"."id" = auth.uid() or current_app_role() = 'admin') WITH CHECK ("profiles"."id" = auth.uid() or current_app_role() = 'admin');--> statement-breakpoint
CREATE POLICY "profiles_delete_admin_only" ON "profiles" AS PERMISSIVE FOR DELETE TO "authenticated" USING (current_app_role() = 'admin');--> statement-breakpoint
CREATE POLICY "classes_select_any_staff" ON "classes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "classes_write_admin_only" ON "classes" AS PERMISSIVE FOR ALL TO "authenticated" USING (current_app_role() = 'admin') WITH CHECK (current_app_role() = 'admin');--> statement-breakpoint
CREATE POLICY "students_select_secretary_admin" ON "students" AS PERMISSIVE FOR SELECT TO "authenticated" USING (current_app_role() in ('secretary', 'admin'));--> statement-breakpoint
CREATE POLICY "students_select_own_class_teacher" ON "students" AS PERMISSIVE FOR SELECT TO "authenticated" USING (current_app_role() = 'teacher' and is_teacher_of_class("students"."class_id"));--> statement-breakpoint
CREATE POLICY "students_write_secretary_only" ON "students" AS PERMISSIVE FOR ALL TO "authenticated" USING (current_app_role() = 'secretary') WITH CHECK (current_app_role() = 'secretary');--> statement-breakpoint
CREATE POLICY "parents_secretary_only" ON "parents" AS PERMISSIVE FOR ALL TO "authenticated" USING (current_app_role() = 'secretary') WITH CHECK (current_app_role() = 'secretary');--> statement-breakpoint
CREATE POLICY "student_guardians_secretary_only" ON "student_guardians" AS PERMISSIVE FOR ALL TO "authenticated" USING (current_app_role() = 'secretary') WITH CHECK (current_app_role() = 'secretary');--> statement-breakpoint
CREATE POLICY "terms_select_any_staff" ON "terms" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "terms_write_secretary_admin" ON "terms" AS PERMISSIVE FOR ALL TO "authenticated" USING (current_app_role() in ('secretary', 'admin')) WITH CHECK (current_app_role() in ('secretary', 'admin'));--> statement-breakpoint
CREATE POLICY "class_term_fees_select_any_staff" ON "class_term_fees" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "class_term_fees_write_secretary_admin" ON "class_term_fees" AS PERMISSIVE FOR ALL TO "authenticated" USING (current_app_role() in ('secretary', 'admin')) WITH CHECK (current_app_role() in ('secretary', 'admin'));--> statement-breakpoint
CREATE POLICY "fee_records_secretary_full" ON "fee_records" AS PERMISSIVE FOR ALL TO "authenticated" USING (current_app_role() = 'secretary') WITH CHECK (current_app_role() = 'secretary');--> statement-breakpoint
CREATE POLICY "fee_records_admin_read" ON "fee_records" AS PERMISSIVE FOR SELECT TO "authenticated" USING (current_app_role() = 'admin');--> statement-breakpoint
CREATE POLICY "fee_payments_select_secretary" ON "fee_payments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (current_app_role() = 'secretary');--> statement-breakpoint
CREATE POLICY "fee_payments_insert_secretary" ON "fee_payments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (current_app_role() = 'secretary');--> statement-breakpoint
CREATE POLICY "fee_payments_select_admin" ON "fee_payments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (current_app_role() = 'admin');--> statement-breakpoint
CREATE POLICY "academic_reports_select_secretary" ON "academic_reports" AS PERMISSIVE FOR SELECT TO "authenticated" USING (current_app_role() = 'secretary');--> statement-breakpoint
CREATE POLICY "academic_reports_select_own_class_teacher" ON "academic_reports" AS PERMISSIVE FOR SELECT TO "authenticated" USING (current_app_role() = 'teacher' and is_teacher_of_student("academic_reports"."student_id"));--> statement-breakpoint
CREATE POLICY "academic_reports_insert_teacher" ON "academic_reports" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (current_app_role() = 'teacher' and is_teacher_of_student("academic_reports"."student_id"));--> statement-breakpoint
CREATE POLICY "academic_reports_update_teacher_own_draft" ON "academic_reports" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (current_app_role() = 'teacher' and is_teacher_of_student("academic_reports"."student_id") and "academic_reports"."status" = 'draft') WITH CHECK (current_app_role() = 'teacher' and is_teacher_of_student("academic_reports"."student_id"));--> statement-breakpoint
CREATE POLICY "academic_reports_update_secretary" ON "academic_reports" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (current_app_role() = 'secretary') WITH CHECK (current_app_role() = 'secretary');--> statement-breakpoint
CREATE POLICY "academic_reports_delete_teacher_own_draft" ON "academic_reports" AS PERMISSIVE FOR DELETE TO "authenticated" USING (current_app_role() = 'teacher' and is_teacher_of_student("academic_reports"."student_id") and "academic_reports"."status" = 'draft');