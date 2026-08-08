"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatedLogo } from "./AnimatedLogo";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contacts", label: "Contacts" },
  { href: "/events", label: "Events" },
  // { href: "/calendar", label: "Calendar" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="drawer sticky top-0 z-40">
      <input
        id="site-nav-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        onChange={(e) => setOpen(e.target.checked)}
      />

      <div className="drawer-content">
        <header className="flex items-center justify-between bg-[var(--brand-navy)] px-8 py-6 sm:px-12">
          <AnimatedLogo />

          <nav className="hidden items-center gap-8 text-sm text-white/60 sm:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition-colors hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]"
            >
              Sign in
            </Link>

            <label
              htmlFor="site-nav-drawer"
              aria-label="Open menu"
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-white/20 p-2 text-white sm:hidden"
            >
              <Menu size={20} />
            </label>
          </div>
        </header>
      </div>

      <div className="drawer-side z-50">
        <label
          htmlFor="site-nav-drawer"
          aria-label="Close menu"
          className="drawer-overlay"
        ></label>
        <div className="flex h-full w-72 flex-col gap-1 bg-[var(--brand-navy)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-serif text-lg text-white">Menu</span>
            <label
              htmlFor="site-nav-drawer"
              aria-label="Close menu"
              className="cursor-pointer text-white/60 hover:text-white"
            >
              <X size={20} />
            </label>
          </div>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
