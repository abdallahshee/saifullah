# School Management System

A management system for a Grade 1–3 integrated school in Kenya. Core focus: **daily attendance with parent SMS alerts**, **academic reporting**, and **fee tracking with M-Pesa payments**. A lightweight **public website** (calendar + announcements) is also managed from the same admin panel.

This document exists to give Claude Code (or any contributor) full context on the product, the tech stack, and the conventions to follow. Read this before generating code.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js** (App Router) + **React** |
| Language | **TypeScript** (strict mode — no `any` unless justified with a comment) |
| Styling | **Tailwind CSS** + **DaisyUI** component classes |
| Database | **PostgreSQL**, hosted on **Supabase** |
| ORM | **Drizzle ORM** |
| Schema validation | **drizzle-zod** (generate Zod schemas from Drizzle tables for form/API validation — don't hand-write duplicate Zod schemas) |
| Auth | **Supabase Auth** |
| File/image storage | **Supabase Storage** (if/when needed — not core to MVP) |
| SMS | **Africa's Talking** API |
| Payments | **M-Pesa** via an aggregator (**Pesapal** or **IntaSend** — TBD, see Open Decisions) |

### Conventions
- All DB access goes through Drizzle — no raw SQL unless Drizzle genuinely can't express the query, and if so, isolate it in a clearly commented function.
- Derive Zod validators from Drizzle table definitions via `drizzle-zod` (`createInsertSchema`, `createSelectSchema`) rather than maintaining parallel manual schemas.
- Use Server Actions / Route Handlers (Next.js App Router) for mutations; keep Supabase client calls out of client components where possible.
- Tailwind + DaisyUI only for styling — no separate CSS files, no CSS-in-JS.
- Use Supabase Auth's session/user object as the source of truth for `role` (admin / teacher) — see Auth & Roles below.

---

## 2. User Roles

| Role | Has a login? | Can do |
|---|---|---|
| **Admin** | Yes | Manage teachers, classes, students; admit students; approve & send academic reports; send parent messages/invitations; view & manage fee statements, send fee reminders; post calendar events & public announcements |
| **Teacher** | Yes | View only their assigned classes; take daily attendance; submit attendance register (triggers SMS to selected absent students' parents); draft academic reports per student |
| **Parent/Guardian** | **View-only** | No system actions. May optionally log in to view their child's attendance history, sent academic reports, and fee statement. Primary channel to parents is SMS, not the portal — the portal login is a secondary convenience, not the core UX. Build the parent view as a simple read-only dashboard, not a full account-management surface. |

There is **no student-facing login** (age group is Grade 1–3).

---

## 3. Core Modules

### 3.1 Attendance
- Teacher logs in → sees list of classes assigned to them (a teacher may have multiple classes).
- Teacher opens a class → sees the full student roster for that class.
- Teacher marks each student **Present** or **Absent** for the current day.
- Before submitting, teacher sees a **review screen**: only the students marked Absent, each with a checkbox ("send SMS to parent").
- On **Submit**:
  - Attendance record is saved and locked for that day (editing after submission requires admin override — build this as a permission check, not a UI restriction only).
  - SMS is sent **only at this point**, only to parents of students whose checkbox was checked.
- Admin can view attendance across all classes, and can override/unlock a submitted register.

### 3.2 Academic Reports
- Teacher fills in a performance report per student (narrative-style ratings per subject + comments — exact template TBD, see Open Decisions).
- Report is saved as a **draft**, tied to the student and term.
- Report is **not visible to parents until admin sends it** — admin reviews drafts and triggers the send (SMS notification + report becomes visible in parent portal).

### 3.3 Fees
- Admin sets a fee structure per grade/term.
- System generates an invoice per student per term.
- Parent pays via **M-Pesa STK Push** (through the chosen aggregator).
- Payment updates the invoice balance automatically and triggers an SMS receipt.
- Admin can view any student's fee statement (invoices, payments, balance) and a school-wide fees dashboard filterable by grade/class and status (paid / pending / overdue).
- Admin can send **fee reminder SMS** to parents with an outstanding balance — either broadcast to all overdue, or hand-picked selection (TBD, see Open Decisions).

### 3.4 Admin — Class & Student Management
- Create/edit classes (grade + section), assign one or more teachers to a class.
- Admit new students: name, DOB, class, parent/guardian name(s) + phone number(s).

### 3.5 Admin — Parent Messaging
- Send a message/invitation to: a single parent, all parents in a class, all parents in a grade, or school-wide. Delivered via SMS.

### 3.6 Public Website Content
- Admin posts **calendar events** (term dates, holidays, meetings) and **general announcements**, both visible on the public-facing website.
- Static pages (Home, About, Admissions, Contact) are not admin-editable — they're maintained directly in code.

### 3.7 Shared: SMS Notification Layer
- All SMS (absence alerts, report-ready alerts, fee reminders/receipts, parent invitations) route through a single Africa's Talking integration/service module — don't duplicate SMS-sending logic per feature.
- Every SMS should be logged (recipient, content, related record, status, timestamp) for auditability.

---

## 4. Data Model (Drizzle schema — conceptual, not final column list)

```
users            (id, role: 'admin' | 'teacher', name, phone, email, auth_id -> supabase)
classes          (id, grade, section, teacher_id -> users)
students         (id, name, dob, class_id -> classes)
guardians        (id, student_id -> students, name, phone, relationship)
attendance_records (id, student_id, date, status: 'present' | 'absent', marked_by -> users, submitted_at)
academic_reports (id, student_id, term, subject_ratings (jsonb), comments, status: 'draft' | 'sent', created_by, sent_by, sent_at)
fee_structures   (id, grade, term, amount)
invoices         (id, student_id, term, amount_due, amount_paid, status: 'pending' | 'partial' | 'paid' | 'overdue')
payments         (id, invoice_id, amount, mpesa_ref, method, timestamp)
messages         (id, sender_id -> users, target_scope: 'student' | 'class' | 'grade' | 'school', target_id, content, sent_at)
sms_logs         (id, recipient_phone, content, related_record_type, related_record_id, status, timestamp)
calendar_events  (id, title, description, date, created_by, is_public)
public_posts     (id, title, content, posted_by, posted_at, is_public)
```

Notes for implementation:
- `guardians` is a separate table (not just fields on `students`) because a student can have more than one guardian, and a guardian can have more than one child in the school.
- `subject_ratings` on `academic_reports` is left as `jsonb` until the report template is finalized (see Open Decisions) — don't hard-code subject columns yet.
- Use Drizzle relations (`relations()`) to wire up FKs for clean joined queries (e.g., "all students in a class with their guardians").

---

## 5. Out of Scope for MVP
Do not build these unless explicitly asked:
- Homework/assignment posting
- Numeric gradebook (replaced by narrative academic reports)
- Teacher–parent direct chat/messaging threads
- Multi-language UI
- Student logins

---

## 6. Environment Variables (expected)

```
DATABASE_URL=                 # Supabase Postgres connection string
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AFRICAS_TALKING_API_KEY=
AFRICAS_TALKING_USERNAME=
MPESA_CONSUMER_KEY=           # or PESAPAL_/INTASEND_ equivalents, pending final choice
MPESA_CONSUMER_SECRET=
```

---

## 7. Open Decisions (flag if code depends on these — don't silently assume)
1. M-Pesa aggregator: **Pesapal vs IntaSend** — not yet finalized.
2. Fee reminder SMS: **broadcast to all overdue** vs **admin hand-picks specific students** (similar UX to the attendance absent-list checkboxes).
3. Academic report template: exact subject list / rating scale not yet defined — schema uses `jsonb` as a placeholder.
4. Whether a class can have multiple teachers (e.g., class teacher + subject specialist) or exactly one.
5. Whether a teacher can un-check specific absent students before submitting (e.g., if a parent already called in).

When implementing a feature that touches one of these, implement the most reversible/flexible option and leave a `// TODO(decision): ...` comment rather than guessing permanently into the schema.