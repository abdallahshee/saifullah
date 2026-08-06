"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export type GalleryImage = {
  id: string;
  url: string;
  alt: string;
};

export function EventGallery({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length],
  );
  const prev = useCallback(
    () =>
      setOpenIndex((i) =>
        i === null ? null : (i - 1 + images.length) % images.length,
      ),
    [images.length],
  );

  // Keyboard navigation while the lightbox is open.
  useEffect(() => {
    if (openIndex === null) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openIndex, close, next, prev]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-xl"
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          image={images[openIndex]}
          index={openIndex}
          total={images.length}
          onClose={close}
          onNext={next}
          onPrev={prev}
        />
      )}
    </>
  );
}

function Lightbox({
  image,
  index,
  total,
  onClose,
  onNext,
  onPrev,
}: {
  image: GalleryImage;
  index: number;
  total: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous image"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <div
        className="relative h-[70vh] w-full max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={image.url}
          alt={image.alt}
          fill
          className="object-contain"
        />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next image"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/60">
        {index + 1} / {total}
      </p>
    </div>
  );
}
