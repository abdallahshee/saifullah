import { config } from "dotenv";
config({ path: ".env.local" });

// resetStaffPassword reads process.env at import time, so it must not be
// imported until after dotenv has populated process.env above.

// npm run reset:password -- your-email@example.com
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run reset:password -- <email>");
    process.exit(1);
  }

  // const { resetStaffPassword } = await import("../lib/auth/reset-password");
  const { userId, temporaryPassword } = await resetStaffPassword(email);

  console.log(`Password reset for ${email} (auth user ${userId})`);
  console.log(`New temporary password: ${temporaryPassword}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

  import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export async function resetStaffPassword(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || !supabaseUrl)
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existingUsers, error: listError } =
    await supabaseAdmin.auth.admin.listUsers();
  if (listError) throw listError;

  const user = existingUsers.users.find((u) => u.email === email);
  if (!user) throw new Error(`No auth user found for ${email}`);

  const temporaryPassword = randomUUID();
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { password: temporaryPassword },
  );
  if (updateError) throw updateError;

  return { userId: user.id, email, temporaryPassword };
}