import { requireRole } from "@/lib/auth/current-profile";
import type { ReactNode } from "react";

export default async function ParentsLayout({ children }: { children: ReactNode }) {
  await requireRole("admin", "secretary");
  return <>{children}</>;
}