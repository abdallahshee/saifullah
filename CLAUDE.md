# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A management system for a Grade 1–3 school in Kenya (Next.js App Router + Supabase). Core modules: daily attendance with parent SMS alerts, academic reporting, fee tracking with M-Pesa, and a public website (calendar/announcements) managed from the same admin panel. Three login roles — **admin**, **secretary**, **teacher** — plus optional read-only **parent** portal access; there is no student login. Full product/domain spec (roles, modules, data model, open decisions) lives in `README.md` — read it before building a new feature, since several schema fields (e.g. `academic_reports.subjectRatings`) are intentionally left flexible pending unresolved product decisions.

## Commands

```
npm run dev              # start dev server (Next.js App Router)
npm run build             # production build
npm run lint               # eslint (flat config: eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit           # type-check only (no dedicated npm script)

npm run db:generate        # generate a Drizzle migration from lib/db/schema/*
npm run db:push            # push schema directly to the DB (no migration file)
npm run db:migrate         # run pending migrations, then re-apply supabase/sql/rls-functions.sql
npm run db:studio          # Drizzle Studio

npm run seed:admin         # create the first admin (RLS blocks self-insert, so this bootstraps it)
npm run reset:admin
npm run db:seed
npm run db:seed:events
```

There is no test runner configured in this repo (no test script, no Jest/Vitest dependency) — don't assume one exists.

## Architecture

**This is Next.js 16, not the Next.js in your training data.** Breaking changes apply — e.g. `middleware.ts` no longer exists; route interception now lives in **`proxy.ts`** at the repo root (see `lib/supabase/proxy.ts` for the actual Supabase session-refresh logic it delegates to). Check `node_modules/next/dist/docs/` for anything that looks off versus what you expect.

**Auth/DB split — this is the most load-bearing thing to understand:**
- Drizzle (`lib/db/index.ts`) connects via `DATABASE_URL` as a single fixed Postgres role. Queries made this way **bypass Postgres RLS entirely**.
- The Supabase client (`lib/supabase/client.ts` browser / `lib/supabase/server.ts` server) goes through Supabase's API and **does** get RLS enforcement, driven by `pgPolicy(...)` definitions inline in each `lib/db/schema/*.ts` table and by SQL helper functions (`has_role`, `is_teacher_of_class`, `is_parent_of_student`, `is_parent_of_fee_record`, `is_teacher_of_student`) defined in `supabase/sql/rls-functions.sql`.
- Because almost all app code reads/writes through Drizzle (not the Supabase client), **RLS is not the real access-control boundary for those paths** — `requireRole(...roles)` / `getCurrentProfile()` in `lib/auth/current-profile.ts` is. Any new Server Action or server method that touches the DB via Drizzle must call `requireRole(...)` itself; don't rely on the database to reject it.
- `supabase/sql/rls-functions.sql` is plain SQL that Drizzle Kit has no representation for, so `drizzle-kit generate` can't regenerate it. `scripts/apply-rls-functions.ts` re-applies it (idempotent `CREATE OR REPLACE`) after every migration — this is why `db:migrate` is a compound script and not just `drizzle-kit migrate`.
- Privileged writes that must bypass RLS on purpose (e.g. creating a staff/parent's auth user + first profile row before any admin-scoped policy could allow it) go through a service-role Supabase client — see `lib/auth/admit-staff.ts`. Never construct a service-role client outside a trusted server context.
- A `profiles` row can hold multiple roles at once (`roles: userRole[]`, e.g. a teacher who is also a parent) — always treat it as a set, not a single value.

**Per-resource file trio.** Each domain resource (`classes`, `students`, `events`, `attendance-records`, `fee-*`, ...) is implemented as three paired files that need to be read together to understand the full picture:
- `lib/db/schema/<resource>.ts` — Drizzle table + inline RLS `pgPolicy` definitions (exported from `lib/db/schema/index.ts`)
- `lib/db/types/<resource>.types.ts` — `drizzle-zod` (`createSelectSchema`/`createInsertSchema`) schemas extended/refined with `zod`, one file per resource, covering every variant used across the app (e.g. `profiles.types.ts` holds the base `profileSchema` plus `secretarySchema`/`teacherSchema`/`parentSchema` role variants)
- `server/<resource>.server.ts` — `"use server"` methods that call `requireRole(...)`, parse input against the zod schema, then read/write via `db` (Drizzle)

Route handlers and pages call these server methods directly from client components (see Form Submission Strategy below) rather than binding them as Next.js Form Actions.

**Route groups** under `app/`: `(header)` wraps the public site (home, about, contacts, events) and nests `(auth)` for login/password flows; `(authenticated)` wraps the logged-in dashboard and enforces a session via `getCurrentProfile()` in its layout, redirecting to `/auth/login` otherwise — per-page role gating beyond "is logged in" is done with `requireRole(...)` inside the server methods the page calls, not in the layout.

# Project Conventions

## Components
- All React components should live in the `components/` folder
- Use kebab-case for component file names (e.g., `user-card.tsx`); the exported component/function name stays PascalCase (e.g., `export function UserCard()`)
- Keep one component per file

## Forms
- All form components should live in the `forms/` folder
- File names must be appended with `-form`
  - e.g. `login-form.tsx`, `user-form.tsx`, `admin-create-form.tsx`
- The exported component name must be appended with `Form` (e.g. `LoginForm`, `UserForm`, `AdminCreateForm`)
- Follow the same component conventions as `components/` (kebab-case file names, one component per file)
- All the forms elements should be used from the mantine forms
- Use Tailwind + DaisyUI for form styling and ensure responsiveness, per the rules above

## Styling
- This project uses Tailwind CSS and DaisyUI for styling
- Use Tailwind utility classes and DaisyUI components instead of custom CSS where possible
- Do not introduce other CSS frameworks or inline styles unless necessary

## Responsiveness
- All UI must be responsive — test/consider layouts at mobile, tablet, and desktop breakpoints
- Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:) rather than fixed widths/heights

## Icons
- Use icons from the `lucide-react` package only
- Do not use other icon libraries (e.g., react-icons, heroicons, FontAwesome) unless explicitly instructed
- Import icons individually, e.g. `import { Home, User } from "lucide-react"`

## Server Methods
- All server methods should live in the `server/` folder
- Group related CRUD operations into a single file per resource/domain (e.g. `staff.server.ts` contains all staff create/read/update/delete methods)
- Files must be suffixed with `.server.ts`
- Use the `"use server"` directive at the top of server action files
- Every server method that touches the DB via Drizzle must call `requireRole(...)` (or `getCurrentProfile()`) itself — see Architecture above for why this, not RLS, is the actual access-control boundary for Drizzle-backed code

## Validation Schemas
- Validation schemas live in **`lib/db/types/`** (not a top-level `types/` folder)
- Group related schemas into a single file per resource/domain (e.g. `profiles.types.ts`)
- Files must be suffixed with `.types.ts`
- Use `drizzle-zod` (`createSelectSchema`/`createInsertSchema`) to generate base schemas from the matching Drizzle table in `lib/db/schema/`, then use `zod` to extend/refine (custom messages, regex, role variants, nullability matching the column)

## File Naming & Organization
- Do not split CRUD operations for the same resource across multiple files
- Keep naming consistent across `lib/db/schema/`, `lib/db/types/`, and `server/` — e.g. `classes.ts` schema pairs with `classes.types.ts` and `classes.server.ts`

# Form Submission Strategy: Server Methods Instead of Form Actions

## Summary

This app does **not** use Next.js Server Actions (the `action={serverFunction}` pattern bound directly to a `<form>` element) for handling form submissions. Instead, forms are submitted via **explicit server methods** called from client-side handlers (e.g. `onSubmit`), typically alongside a validation layer (Zod) and a data-fetching/mutation library (e.g. React Query, SWR, or a custom API client).

## Why Not Form Actions

Form Actions are convenient, but they come with tradeoffs that don't fit well with how this app is structured:

- **Validation control**: Form Actions push validation logic onto the server function itself, which makes it harder to share the same Zod schema for both client-side (pre-submit) and server-side (authoritative) validation in a consistent, type-safe way.
- **Client state management**: Because forms in this app often need optimistic UI updates, loading states, and granular error handling per field, driving submission through a plain function call gives more control than the implicit `useFormStatus` / `useFormState` hooks tied to Form Actions.
- **Reusability**: Server methods can be called from multiple places — not just a single `<form>` — including programmatic flows (e.g. bulk actions, retries, or calls triggered by non-form UI like buttons or modals).
- **Consistency with existing data layer**: The app already uses server methods for all other server communication (queries, mutations). Using Form Actions for forms specifically would introduce a second, inconsistent pattern alongside the existing one.

## How It Works Instead

1. **Schema-first validation**: Each form has a Zod schema (e.g. `secretarySchema`) that defines the shape and validation rules for its data, in `lib/db/types/`.
2. **Client-side validation**: The form uses the schema via `@mantine/form`'s `schemaResolver` to validate input before submission.
3. **Server method call**: On successful client validation, the form's `onSubmit` handler calls a dedicated **server method** — a plain async function (not a bound Form Action) in `server/*.server.ts` that performs the actual mutation (e.g. inserting a row via Drizzle).
4. **Server-side re-validation**: The server method re-validates the incoming payload against the same (or a related) Zod schema before touching the database, ensuring the server never trusts client-side validation alone.
5. **Response handling**: The server method returns a typed result (success/error), which the calling component uses to update UI state — success feedback, error messages, redirects, etc.
