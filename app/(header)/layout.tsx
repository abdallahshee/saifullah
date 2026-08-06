import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export default function HeaderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--paper)]">
      <SiteHeader />
      {children}
    </div>
  );
}