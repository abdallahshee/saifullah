
import { requireRole } from "@/lib/auth/current-profile";
import type { ReactNode } from "react";

export default async function ClassesLayout({ children }: { children: ReactNode }) {
  await requireRole("admin", "secretary","teacher","parent");
  return <>{children}</>;
}