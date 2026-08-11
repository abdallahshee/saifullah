"use client";

import { useState, type ReactNode } from "react";
import { User } from "lucide-react";

type AvatarSize = "sm" | "md" | "lg";

type AvatarProps = {
  src?: string | null;
  alt: string;
  shape?: "circle" | "square";
  size?: AvatarSize;
  icon?: ReactNode;
};

const DIMENSION_CLASSES: Record<AvatarSize, string> = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

// Sizes whichever icon element is passed in (default or caller-supplied) via
// a descendant selector, rather than cloning it with a className prop - the
// icon arrives as a plain ReactNode, not a component reference, so it can be
// passed down from a Server Component to this Client Component.
const ICON_WRAPPER_CLASSES: Record<AvatarSize, string> = {
  sm: "[&>svg]:h-4 [&>svg]:w-4",
  md: "[&>svg]:h-5 [&>svg]:w-5",
  lg: "[&>svg]:h-6 [&>svg]:w-6",
};

/**
 * Renders a profile/class image with a graceful fallback (initial-less
 * icon badge) when there's no URL, or the URL fails to load - avoids
 * broken-image icons for user-supplied external links.
 */
export function Avatar({
  src,
  alt,
  shape = "circle",
  size = "sm",
  icon = <User />,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-md";
  const dimensionClass = DIMENSION_CLASSES[size];

  if (!src || failed) {
    return (
      <span
        className={`inline-flex ${dimensionClass} ${shapeClass} shrink-0 items-center justify-center bg-[var(--paper)] text-[var(--slate)] ring-1 ring-inset ring-[var(--line)] ${ICON_WRAPPER_CLASSES[size]}`}
      >
        {icon}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary external URLs, not under next/image's domain allowlist
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`${dimensionClass} ${shapeClass} shrink-0 object-cover ring-1 ring-inset ring-[var(--line)]`}
    />
  );
}
