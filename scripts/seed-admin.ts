import { config } from "dotenv";
config({ path: ".env.local" });

// admitStaffMember reads process.env.DATABASE_URL at import time (via
// lib/db), so it must not be imported until after dotenv has populated
// process.env above - a static top-level `import` would get hoisted ahead
// of the config() call by tsx's CJS transform and see DATABASE_URL as unset.

// npm run seed:admin -- your-email@example.com
async function main() {
  const email = process.argv[2] ?? process.env.SEED_ADMIN_EMAIL;
  if (!email) {
    console.error(
      "Usage: npm run seed:admin -- <email>\n(or set SEED_ADMIN_EMAIL in .env.local)",
    );
    process.exit(1);
  }

  const { admitStaffMember } = await import("../lib/auth/admit-staff");
  const { userId, temporaryPassword } = await admitStaffMember(
    email,
    "Abdallah Shee",
    "admin",
  );

  console.log(`Admin profile ready for ${email} (auth user ${userId})`);
  if (temporaryPassword) {
    console.log(`New auth user created. Temporary password: ${temporaryPassword}`);
    console.log("Sign in once and change it, or use Supabase's password reset flow.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
