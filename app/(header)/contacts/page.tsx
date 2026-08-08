import { SchoolMap } from "@/components/SchoolMap";
import { CtaBanner } from "@/components/CtaBanner";
import { MapPin, Phone, Mail, Landmark, Clock, Navigation } from "lucide-react";

// Placeholder data — replace with real values, or fetch from a
// school-settings server method once one exists (relevant for the
// eventual multi-tenant version, where this becomes per-school data).
const SCHOOL_CONTACT = {
  addressLine: "123 Ridgeway Avenue",
  county: "Nairobi County",
  phone: "+254 700 123 456",
  email: "info@rosterschool.ac.ke",
  officeHours: "Mon – Fri, 8:00 AM – 4:30 PM",
  lat: 4.085627,
  lng: 39.645836,
};
// 4.0856279,39.645836
export default function ContactsPage() {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${SCHOOL_CONTACT.lat},${SCHOOL_CONTACT.lng}`;

  return (
    <div className="flex-1 bg-[var(--paper)]">
      <div className="mx-auto max-w-6xl px-8 py-16 sm:px-12">
        <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
          CONTACT
        </p>
        <h1 className="mt-2 font-serif text-4xl text-[var(--ink)]">
          Visit or reach us
        </h1>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left column: contact details */}
          <div className="flex flex-col gap-4">
            <ContactRow
              icon={<MapPin className="h-5 w-5" />}
              label="Address"
              value={SCHOOL_CONTACT.addressLine}
            />
            <ContactRow
              icon={<Landmark className="h-5 w-5" />}
              label="County"
              value={SCHOOL_CONTACT.county}
            />
            <ContactRow
              icon={<Phone className="h-5 w-5" />}
              label="Phone"
              value={SCHOOL_CONTACT.phone}
              href={`tel:${SCHOOL_CONTACT.phone.replace(/\s+/g, "")}`}
            />
            <ContactRow
              icon={<Mail className="h-5 w-5" />}
              label="Email"
              value={SCHOOL_CONTACT.email}
              href={`mailto:${SCHOOL_CONTACT.email}`}
            />
            <ContactRow
              icon={<Clock className="h-5 w-5" />}
              label="Office hours"
              value={SCHOOL_CONTACT.officeHours}
            />

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-2 self-start rounded-full bg-[var(--brand-navy)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-navy-2)]"
            >
              <Navigation className="h-4 w-4" />
              Get directions
            </a>
          </div>

          {/* Right column: map */}
          <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
            <SchoolMap
     
            />
          </div>
        </div>
      </div>

      <CtaBanner heading="Still have questions?" />
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-4 rounded-xl border border-[var(--line)] bg-white p-5">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--paper)] text-[var(--brand-navy)]">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--slate)]">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-[var(--ink)]">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="transition-opacity hover:opacity-80">
        {content}
      </a>
    );
  }

  return content;
}