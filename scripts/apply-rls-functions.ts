import { config } from "dotenv";
config({ path: ".env.local" });

import path from "node:path";
import postgres from "postgres";

// npm run db:migrate (runs automatically after drizzle-kit migrate)
//
// supabase/sql/rls-functions.sql defines the RLS helper functions
// (has_role, is_teacher_of_class, ...) that lib/db/schema/*.ts's policies
// call. Drizzle Kit has no representation for plain SQL functions, so they
// can't live in lib/db/schema and can't be picked up by `drizzle-kit
// generate` - if a future migration squash regenerates the baseline
// migration from the current schema snapshot, it won't include them. This
// script re-applies them (CREATE OR REPLACE, so it's a no-op if they're
// already correct) every time the app migrates, independent of whatever the
// migration files happen to contain.
//
// Must run AFTER drizzle-kit migrate, not before: the function bodies
// reference tables (profiles, classes, ...) that only exist once the
// migrations have created them.
async function main() {
  const sql = postgres(process.env.DATABASE_URL!);
  await sql.file(path.join(__dirname, "../supabase/sql/rls-functions.sql"));
  await sql.end();
  console.log("Applied supabase/sql/rls-functions.sql");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
