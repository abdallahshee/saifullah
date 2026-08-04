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

## Server Actions
- All server actions should live in the `actions/` folder
- Group related CRUD operations into a single file per resource/domain (e.g. `admin.actions.ts` contains all admin create/read/update/delete actions)
- Files must be suffixed with `.actions.ts`
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