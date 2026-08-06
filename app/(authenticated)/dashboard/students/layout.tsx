import { requireRole } from "@/lib/auth/current-profile";
import { ReactNode } from "react";

export default async function StudentsLayout({ children }: { children: ReactNode }) {
  await requireRole("admin", "secretary","teacher");
  return <>{children}</>;
}