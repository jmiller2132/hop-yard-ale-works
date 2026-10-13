"use client";
import { useEffect, useRef } from "react";

/**
 * ScrollProgressBar
 *
 * A 2 px gold line fixed to the very top of the viewport that fills
 * left-to-right as the user scrolls. Uses scaleX + transform-origin:left
 * so the fill is GPU-composited and never causes layout.
 */
export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf: number;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const max = scrollHeight - clientHeight;
      const pct = max > 0 ? scrollTop / max : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${pct})`;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // initial

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 right-0 top-0 z-[200]"
      style={{ height: 2 }}
    >
      <div
        ref={barRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "var(--color-gold)",
          transformOrigin: "left center",
          transform: "scaleX(0)",
        }}
      />
    </div>
  );
}
