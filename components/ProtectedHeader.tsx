import Link from "next/link";
import type { Profile } from "@/lib/db/types/profiles.types";
import { SignOutButton } from "./SignOutButton";

export function ProtectedHeader({ profile }: { profile: Profile }) {
  const { roles } = profile;
  console.log("Roles are here "+roles[0])

  return (
    <header className="flex items-center justify-between border-b border-[var(--line)] px-8 py-4 sm:px-12">
      <div className="flex items-center gap-8">
        <span className="font-serif text-lg text-[var(--ink)]">Roster</span>

        <nav className="flex items-center gap-6 text-sm text-[var(--slate)]">
          {roles.includes("admin") && (
            <Link href="/staff" className="hover:text-[var(--ink)]">Staff</Link>
          )}
          {(roles.includes("admin") || roles.includes("secretary")) && (
            <Link href="/students" className="hover:text-[var(--ink)]">Students</Link>
          )}
          {(roles.includes("admin") || roles.includes("secretary") || roles.includes("teacher")) && (
            <Link href="/classes" className="hover:text-[var(--ink)]">Classes</Link>
          )}
          {roles.includes("parent") && (
            <Link href="/my-children" className="hover:text-[var(--ink)]">My children</Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-[var(--slate)]">{profile.firstName ?? profile.firstName}</span>
        <SignOutButton />
      </div>
    </header>
  );
}