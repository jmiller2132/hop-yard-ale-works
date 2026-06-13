"use client";

import { useEffect, useRef, useState } from "react";
import { UNTAPPD_PRELOADER_URL } from "@/lib/untappd";

interface UntappdEmbedProps {
  breweryId: number;
  menuId: number;
  label: string;
}

export default function UntappdEmbed({ breweryId, menuId, label }: UntappdEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loaded && !loading) {
          setLoading(true);
          observer.disconnect();

          // Untappd requires a uniquely-IDed container per embed
          const containerId = `untappd-menu-${breweryId}`;
          const container = document.getElementById(containerId);
          if (!container) return;

          const script = document.createElement("script");
          script.async = true;
          script.src = UNTAPPD_PRELOADER_URL;
          script.onload = () => {
            // @ts-expect-error - Untappd global
            if (typeof PreloadEmbedMenu === "function") {
              // @ts-expect-error - Untappd global
              PreloadEmbedMenu(containerId, breweryId, menuId);
              setLoaded(true);
              setLoading(false);
            }
          };
          document.body.appendChild(script);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [breweryId, menuId, loaded, loading]);

  return (
    <div ref={containerRef}>
      <p
        className="mb-4 font-heading text-lg font-semibold"
        style={{ color: "var(--color-ink)" }}
      >
        {label}
      </p>

      {!loaded && (
        <div
          className="flex items-center justify-center rounded-xl py-16 text-sm"
          style={{
            backgroundColor: "rgba(0,0,0,0.03)",
            border: "1px dashed var(--color-muted)",
            color: "var(--color-muted)",
          }}
        >
          {loading ? "Loading tap list…" : "Scroll to load tap list"}
        </div>
      )}

      <div
        id={`untappd-menu-${breweryId}`}
        className="w-full overflow-x-hidden"
        style={{ minHeight: loaded ? undefined : 0 }}
      />
    </div>
  );
}
