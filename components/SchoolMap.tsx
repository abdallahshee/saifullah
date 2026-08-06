"use client";

import { useEffect, useRef, useState } from "react";

type SchoolMapProps = {
  lat: number;
  lng: number;
  label: string;
};

// Loads the Google Maps JS API script once and reuses it across mounts —
// avoids injecting the <script> tag multiple times if this component
// re-renders or appears more than once on a page.
let mapsScriptPromise: Promise<void> | null = null;
function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window !== "undefined" && (window as any).google?.maps) {
    return Promise.resolve();
  }
  if (!mapsScriptPromise) {
    mapsScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&v=weekly`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Maps"));
      document.head.appendChild(script);
    });
  }
  return mapsScriptPromise;
}

export function SchoolMap({ lat, lng, label }: SchoolMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Map is not configured.");
      return;
    }

    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !containerRef.current) return;

        const google = (window as any).google;
        const position = { lat, lng };

        const map = new google.maps.Map(containerRef.current, {
          center: position,
          zoom: 15,
          mapId: "SCHOOL_MAP", // required for AdvancedMarkerElement custom styling
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
        });

        // Custom pin, styled in the brand colors used across the rest of
        // the app rather than Google's default red teardrop marker.
        const pin = document.createElement("div");
        pin.style.width = "18px";
        pin.style.height = "18px";
        pin.style.borderRadius = "50%";
        pin.style.background = "#16233F"; // var(--brand-navy)
        pin.style.border = "3px solid #D9A64E"; // var(--brand-gold)
        pin.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

        new google.maps.marker.AdvancedMarkerElement({
          map,
          position,
          content: pin,
          title: label,
        });
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the map.");
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng, label]);

  if (error) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--paper)] text-sm text-[var(--slate)] lg:h-full lg:min-h-[360px]">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-80 w-full rounded-2xl lg:h-full lg:min-h-[360px]"
    />
  );
}
