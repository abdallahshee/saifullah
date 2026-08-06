import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

// In dev, Next.js hot-reloads this module on every change without tearing
// down the previous postgres client, which leaks connections against
// Supabase's session-mode pooler (capped at 15) until it's exhausted.
// Caching the client on `globalThis` makes HMR reuse the same pool instead
// of opening a new one each time.
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const client =
  globalForDb.client ?? postgres(databaseUrl, { prepare: false });

if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client);
