"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/client";
import type { TaproomPhoto } from "@/types";

interface TaproomPhotoGridProps {
  photos: TaproomPhoto[];
  /** If set, only show this many photos (home page preview) */
  limit?: number;
}

export default function TaproomPhotoGrid({ photos, limit }: TaproomPhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const displayed = limit ? photos.slice(0, limit) : photos;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(() =>
    setLightboxIndex((i) => (i === null ? null : (i - 1 + displayed.length) % displayed.length)),
    [displayed.length]
  );
  const next = useCallback(() =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % displayed.length)),
    [displayed.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, closeLightbox, prev, next]);

  if (!displayed.length) return null;

  const activePhoto = lightboxIndex !== null ? displayed[lightboxIndex] : null;

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {displayed.map((photo, i) => (
          <button
            key={photo._id}
            className="mb-3 block w-full overflow-hidden rounded-xl break-inside-avoid group relative cursor-zoom-in"
            onClick={() => setLightboxIndex(i)}
            aria-label={photo.caption ?? `View photo ${i + 1}`}
          >
            <Image
              src={urlFor(photo.image).width(600).auto("format").url()}
              alt={photo.caption ?? "Hop Yard Ale Works taproom photo"}
              width={600}
              height={400}
              className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {photo.caption && (
              <div
                className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)" }}
              >
                <p className="px-3 py-2.5 text-xs text-white text-left leading-snug">
                  {photo.caption}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white text-xl hover:opacity-70 transition-opacity"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            aria-label="Close"
          >
            ✕
          </button>

          {/* Prev */}
          {displayed.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 sm:left-6 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white hover:opacity-70 transition-opacity"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              aria-label="Previous photo"
            >
              ←
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={urlFor(activePhoto.image).width(1200).auto("format").url()}
              alt={activePhoto.caption ?? "Hop Yard Ale Works taproom photo"}
              width={1200}
              height={800}
              className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-contain rounded-lg"
              priority
            />
            {activePhoto.caption && (
              <p className="mt-3 text-center text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                {activePhoto.caption}
              </p>
            )}
            <p className="mt-1 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              {(lightboxIndex ?? 0) + 1} / {displayed.length}
            </p>
          </div>

          {/* Next */}
          {displayed.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 sm:right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white hover:opacity-70 transition-opacity"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              aria-label="Next photo"
            >
              →
            </button>
          )}
        </div>
      )}
    </>
  );
}
