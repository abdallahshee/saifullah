import Link from "next/link";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contacts", label: "Contacts" },
  { href: "/events", label: "Events" },
];

// Placeholder data — replace with real values, or fetch from a
// school-settings server method once one exists, matching the contact
// details shown on the /contacts page.
const SCHOOL_CONTACT = {
  addressLine: "123 Ridgeway Avenue, Nairobi County",
  phone: "+254 700 123 456",
  email: "info@rosterschool.ac.ke",
};

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--brand-navy)]">
      <div className="mx-auto max-w-7xl px-8 py-12 sm:px-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[var(--brand-gold)]" />
              <span className="font-serif text-lg text-white">
                Saifullah Integrated Academy
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              A nurturing, disciplined, and academically rigorous environment
              for every learner.
            </p>
          </div>

          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-[var(--brand-gold)]">
              QUICK LINKS
            </p>
            <nav className="mt-4 flex flex-col gap-2 text-sm text-white/60">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/login" className="transition-colors hover:text-white">
                Sign in
              </Link>
            </nav>
          </div>

          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-[var(--brand-gold)]">
              GET IN TOUCH
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/60">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  SCHOOL_CONTACT.addressLine,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 transition-colors hover:text-white"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {SCHOOL_CONTACT.addressLine}
              </a>
              <a
                href={`tel:${SCHOOL_CONTACT.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0" />
                {SCHOOL_CONTACT.phone}
              </a>
              <a
                href={`mailto:${SCHOOL_CONTACT.email}`}
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {SCHOOL_CONTACT.email}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© {year} Saifullah Integrated Academy. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <h5>Handcrafted By Developer Shee - +254796515302</h5>
          </div>
        </div>
      </div>
    </footer>
  );
}
