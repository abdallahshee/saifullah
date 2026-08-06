import { requireRole } from "@/lib/auth/current-profile";
import { ReactNode } from "react";

export default async function StaffsLayout({ children }: { children: ReactNode }) {
  await requireRole("admin", "secretary");
  return <>{children}</>;
}