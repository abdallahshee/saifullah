"use client";

import Link from "next/link";
import { useState } from "react";
import type { Profile } from "@/lib/db/types/profiles.types";
import { Avatar } from "./Avatar";
import { SignOutButton } from "./SignOutButton";
import { Menu, X } from "lucide-react";

export function ProtectedHeader({ profile }: { profile: Profile }) {
  const { roles } = profile;
  const [open, setOpen] = useState(false);

  const navLinks = [
    roles.includes("admin") && { href: "/dashboard/staffs", label: "Staffs" },
    (roles.includes("admin") || roles.includes("secretary")) && {
      href: "/dashboard/students",
      label: "Students",
    },
    (roles.includes("admin") ||
      roles.includes("secretary") ||
      roles.includes("teacher")) && {
      href: "/dashboard/classes",
      label: "Classes",
    },
    (roles.includes("admin") || roles.includes("secretary")) && {
      href: "/dashboard/parents",
      label: "Parents",
    },
    (roles.includes("admin") || roles.includes("parent")) && {
      href: "/my-children",
      label: "My children",
    },
  ].filter((link): link is { href: string; label: string } => Boolean(link));

  return (
    <div className="drawer">
      <input
        id="dashboard-nav-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        onChange={(e) => setOpen(e.target.checked)}
      />

      <div className="drawer-content">
        <header className="border-b border-[var(--line)]">
          {/* Top row: brand on the left, account info + sign out on the right */}
          <div className="flex items-center justify-between px-8 py-4 sm:px-12">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-lg text-[var(--ink)]">
                Saifullah Integrated Academy
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Avatar
                src={profile.profileUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
              />
              <span className="text-sm text-[var(--slate)]">
                {profile.firstName} {profile.lastName}
              </span>
              <SignOutButton />
              <label
                htmlFor="dashboard-nav-drawer"
                aria-label="Open menu"
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[var(--line)] p-2 text-[var(--ink)] md:hidden"
              >
                <Menu size={20} />
              </label>
            </div>
          </div>

          {/* Second row: feature nav, scoped by role */}
          <nav className="hidden items-center gap-6 border-t border-[var(--line)] px-8 py-3 text-sm text-[var(--slate)] sm:px-12 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[var(--ink)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>
      </div>

      <div className="drawer-side z-50">
        <label
          htmlFor="dashboard-nav-drawer"
          aria-label="Close menu"
          className="drawer-overlay"
        ></label>
        <div className="flex h-full w-72 flex-col gap-1 bg-[var(--paper)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-serif text-lg text-[var(--ink)]">Menu</span>
            <label
              htmlFor="dashboard-nav-drawer"
              aria-label="Close menu"
              className="cursor-pointer text-[var(--slate)] hover:text-[var(--ink)]"
            >
              <X size={20} />
            </label>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-[var(--slate)] hover:bg-[var(--line)]/40 hover:text-[var(--ink)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}