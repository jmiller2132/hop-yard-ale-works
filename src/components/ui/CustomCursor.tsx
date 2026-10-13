"use client";
import { useEffect, useRef } from "react";

/**
 * CustomCursor
 *
 * Replaces the native cursor with a branded dot + lagging ring on desktop.
 * - Dot (8 px, gold) snaps exactly to pointer position.
 * - Ring (28 px, teal border) lerps behind with slight lag.
 * - Ring expands on hover over interactive elements.
 * - Skipped entirely on touch-primary devices and prefers-reduced-motion.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch-primary devices or reduced motion
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("cursor-custom");

    let mx = -200, my = -200;
    let rx = -200, ry = -200;
    let raf: number;

    const LERP = 0.1;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;

      // Expand ring on interactive elements
      const target = e.target as Element;
      const interactive = !!target.closest(
        "a, button, [role='button'], label, select, input, textarea, summary"
      );
      if (ringRef.current) {
        const size = interactive ? 48 : 28;
        const half = size / 2;
        ringRef.current.style.width = `${size}px`;
        ringRef.current.style.height = `${size}px`;
        ringRef.current.style.marginLeft = `-${half}px`;
        ringRef.current.style.marginTop = `-${half}px`;
        ringRef.current.style.borderColor = interactive
          ? "var(--color-gold)"
          : "var(--color-teal)";
        ringRef.current.style.opacity = interactive ? "0.7" : "0.5";
      }
    };

    const tick = () => {
      // Snap dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px,${my}px)`;
        dotRef.current.style.opacity = mx < -100 ? "0" : "1";
      }
      // Lerp ring
      rx += (mx - rx) * LERP;
      ry += (my - ry) * LERP;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx}px,${ry}px)`;
        if (mx >= -100) ringRef.current.style.opacity = ringRef.current.style.opacity || "0.5";
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("cursor-custom");
    };
  }, []);

  return (
    <>
      {/* Dot — snaps exactly to pointer */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] opacity-0"
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "var(--color-gold)",
          marginLeft: -4,
          marginTop: -4,
          willChange: "transform, opacity",
        }}
      />
      {/* Ring — lags behind with lerp */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9998] opacity-0"
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "1.5px solid var(--color-teal)",
          marginLeft: -14,
          marginTop: -14,
          willChange: "transform, width, height, opacity",
          transition: "width 0.25s ease, height 0.25s ease, margin 0.25s ease, border-color 0.25s ease, opacity 0.3s ease",
        }}
      />
    </>
  );
}
