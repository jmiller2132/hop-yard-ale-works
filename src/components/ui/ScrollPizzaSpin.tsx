"use client";

import { useEffect, useRef } from "react";

/**
 * Decorative pizza outline that slowly rotates as the user scrolls.
 * Positioned absolute inside its parent — parent needs `relative overflow-hidden`.
 */
export default function ScrollPizzaSpin() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    let raf: number | null = null;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        if (!ref.current) return;
        // Slow, gentle rotation tied to absolute scroll position
        ref.current.style.transform = `translateY(-50%) rotate(${window.scrollY * 0.025}deg)`;
      });
    };

    onScroll(); // set initial position
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute -right-24 top-1/2"
      style={{
        width: 320,
        height: 320,
        opacity: 0.11,
        willChange: "transform",
        transform: "translateY(-50%)",
      }}
    >
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* Crust ring */}
        <circle cx="50" cy="50" r="47" strokeWidth="4.5" />
        {/* Cheese / inner ring */}
        <circle cx="50" cy="50" r="37" strokeWidth="1.2" />
        {/* 6 slice cuts from center outward */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i * 60 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * 4}
              y1={50 + Math.sin(a) * 4}
              x2={50 + Math.cos(a) * 47}
              y2={50 + Math.sin(a) * 47}
              strokeWidth="1.2"
            />
          );
        })}
        {/* Toppings */}
        <circle cx="50" cy="26" r="2.8"  fill="currentColor" stroke="none" />
        <circle cx="64" cy="40" r="2.2"  fill="currentColor" stroke="none" />
        <circle cx="36" cy="40" r="2.5"  fill="currentColor" stroke="none" />
        <circle cx="60" cy="64" r="2.3"  fill="currentColor" stroke="none" />
        <circle cx="40" cy="66" r="2.8"  fill="currentColor" stroke="none" />
        <circle cx="50" cy="54" r="1.8"  fill="currentColor" stroke="none" />
        <circle cx="72" cy="54" r="1.6"  fill="currentColor" stroke="none" />
        <circle cx="28" cy="56" r="1.9"  fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}
