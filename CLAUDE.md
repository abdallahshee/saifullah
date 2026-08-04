# Project Conventions

## Components
- All React components should live in the `components/` folder
- Use PascalCase for component file names (e.g., `UserCard.jsx`)
- Keep one component per file

## Forms
- All form components should live in the `forms/` folder
- Component/file names must be appended with `Form`
  - e.g. `LoginForm.tsx`, `UserForm.tsx`, `AdminCreateForm.tsx`
- Follow the same component conventions as `components/` (PascalCase, one component per file)
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
- Group related CRUD operations into a single file per resource/domain (e.g. `admin.server.ts` contains all admin create/read/update/delete methods)
- Files must be suffixed with `.server.ts`
- Use the `"use server"` directive at the top of server action files

## Validation Schemas
- Validation schemas should live in the `types/` folder
- Group related schemas into a single file per resource/domain (e.g. `admin.types.ts`)
- Files must be suffixed with `.types.ts`
- Use `drizzle-zod` to generate base schemas from Drizzle table definitions
- Use `zod` to extend/refine those schemas where custom validation is needed

## File Naming & Organization
- Do not split CRUD operations for the same resource across multiple files
- Keep naming consistent across `functions/` and `types/` — e.g. `admin.actions.ts` should pair with `admin.types.ts`

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

1. **Schema-first validation**: Each form has a Zod schema (e.g. `secretaryCreateSchema`) that defines the shape and validation rules for its data.
2. **Client-side validation**: The form uses the schema (typically via `react-hook-form` + `@hookform/resolvers/zod` or similar) to validate input before submission.
3. **Server method call**: On successful client validation, the form's `onSubmit` handler calls a dedicated **server method** — a plain async function (not a bound Form Action) that performs the actual mutation (e.g. inserting a row via Drizzle).
4. **Server-side re-validation**: The server method re-validates the incoming payload against the same (or a related) Zod schema before touching the database, ensuring the server never trusts client-side validation alone.
5. **Response handling**: The server method returns a typed result (success/error), which the calling component uses to update UI state — success feedback, error messages, redirects, etc.

## Example Flow