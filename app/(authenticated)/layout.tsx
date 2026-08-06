import { ProtectedHeader } from "@/components/ProtectedHeader";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { redirect } from "next/navigation";

import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");

  return (
    <div className="flex min-h-screen flex-col bg-[var(--paper)]">
      <ProtectedHeader profile={profile} />
      <main className="flex-1">{children}</main>
    </div>
  );
}