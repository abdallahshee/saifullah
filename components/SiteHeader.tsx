"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contacts", label: "Contacts" },
  { href: "/events", label: "Events" },
  // { href: "/calendar", label: "Calendar" },
];

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="drawer">
      <input
        id="site-nav-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        onChange={(e) => setOpen(e.target.checked)}
      />

      <div className="drawer-content">
        <header
          className={`flex items-center justify-between px-8 py-6 sm:px-12 ${
            dark ? "bg-[var(--brand-navy)]" : ""
          }`}
        >
          <Link
            href="/"
            className={`font-serif text-lg ${
              dark ? "text-white" : "text-[var(--ink)]"
            }`}
          >
            Saifullah Integrated Academy
          </Link>

          <nav
            className={`hidden items-center gap-8 text-sm sm:flex ${
              dark ? "text-white/60" : "text-[var(--slate)]"
            }`}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  dark ? "hover:text-white" : "hover:text-[var(--ink)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                dark
                  ? "border-white/20 text-white hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]"
                  : "border-[var(--line)] text-[var(--ink)] hover:border-[var(--brand-navy)] hover:text-[var(--brand-navy)]"
              }`}
            >
              Sign in
            </Link>

            <label
              htmlFor="site-nav-drawer"
              aria-label="Open menu"
              className={`inline-flex cursor-pointer items-center justify-center rounded-full border p-2 sm:hidden ${
                dark
                  ? "border-white/20 text-white"
                  : "border-[var(--line)] text-[var(--ink)]"
              }`}
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
        <div className="flex h-full w-72 flex-col gap-1 bg-[var(--paper)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-serif text-lg text-[var(--ink)]">Menu</span>
            <label
              htmlFor="site-nav-drawer"
              aria-label="Close menu"
              className="cursor-pointer text-[var(--slate)] hover:text-[var(--ink)]"
            >
              <X size={20} />
            </label>
          </div>

          {NAV_LINKS.map((link) => (
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