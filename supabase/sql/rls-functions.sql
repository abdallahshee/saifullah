-- RLS helper functions referenced by the CREATE POLICY statements in
-- drizzle/*.sql. These live outside Drizzle's managed schema (lib/db/schema)
-- because they're plain SQL/plpgsql functions, not tables — Drizzle Kit has
-- no representation for them, so they must be applied to the database
-- directly (e.g. via the Supabase SQL editor, or `psql -f` this file)
-- BEFORE running `npm run db:migrate`, since the generated migration's
-- CREATE POLICY statements call them by name and will fail to apply
-- otherwise.
--
-- Reconstructed from how each function is called across
-- lib/db/schema/*.ts's pgPolicy() definitions (see drizzle/0000_silent_trauma.sql
-- for the exact USING/WITH CHECK expressions) after the originals were lost
-- when the `public` schema was reset — the DB never had a tracked source for
-- them prior to this file. Re-verify the logic below matches original intent
-- before relying on it for access control in production.
--
-- SECURITY DEFINER + a locked-down search_path is required: these functions
-- query profiles/classes/students/student_guardians, which themselves have
-- RLS policies that call has_role(...) — a SECURITY INVOKER function would
-- recurse back into the same RLS check it's trying to answer.

create or replace function public.has_role(_role public.user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and _role = any(roles)
  );
$$;

grant execute on function public.has_role(public.user_role) to authenticated;

create or replace function public.is_teacher_of_class(_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classes
    where id = _class_id
      and teacher_id = auth.uid()
  );
$$;

grant execute on function public.is_teacher_of_class(uuid) to authenticated;

create or replace function public.is_parent_of_student(_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.student_guardians
    where student_id = _student_id
      and parent_id = auth.uid()
  );
$$;

grant execute on function public.is_parent_of_student(uuid) to authenticated;

create or replace function public.is_parent_of_fee_record(_fee_record_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.fee_records fr
    join public.student_guardians sg on sg.student_id = fr.student_id
    where fr.id = _fee_record_id
      and sg.parent_id = auth.uid()
  );
$$;

grant execute on function public.is_parent_of_fee_record(uuid) to authenticated;

create or replace function public.is_teacher_of_student(_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.students s
    join public.classes c on c.id = s.class_id
    where s.id = _student_id
      and c.teacher_id = auth.uid()
  );
$$;

grant execute on function public.is_teacher_of_student(uuid) to authenticated;
