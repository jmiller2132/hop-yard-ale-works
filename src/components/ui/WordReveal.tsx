"use client";

import React, { useEffect, useRef, type ElementType, type ReactNode } from "react";

interface WordRevealProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** HTML element to render as (default: "div") */
  as?: ElementType;
  delay?: number;
}

/**
 * Fades and slides in children word-by-word when the element enters the viewport.
 * Gracefully degrades to a plain element when JS is unavailable or reduced-motion is preferred.
 */
export default function WordReveal({
  children,
  className = "",
  style,
  as: Tag = "div",
  delay = 0,
}: WordRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Split text content into word spans
    const text = el.textContent ?? "";
    const words = text.split(/\s+/).filter(Boolean);
    el.innerHTML = words
      .map(
        (w, i) =>
          `<span style="display:inline-block;opacity:0;transform:translateY(14px);transition:opacity 0.4s ease ${delay + i * 60}ms,transform 0.4s ease ${delay + i * 60}ms">${w}</span>`
      )
      .join(" ");

    const spans = Array.from(el.querySelectorAll<HTMLSpanElement>("span"));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          spans.forEach((s) => {
            s.style.opacity = "1";
            s.style.transform = "translateY(0)";
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
