"use client";
import { useRef, useEffect, useState, ElementType } from "react";
import type { CSSProperties } from "react";

interface Props {
  /** The text to animate — must be a plain string so it can be split into words. */
  children: string;
  /** HTML element to render (default: h2). */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Base delay in ms before the first word starts (default: 0). */
  delay?: number;
  /** Stagger per word in ms (default: 70). */
  stagger?: number;
}

/**
 * WordReveal
 *
 * Splits a heading string into words and reveals each one with a clipped
 * upward slide, staggered left-to-right. Far more cinematic than a block fade.
 *
 * Uses IntersectionObserver so words only animate once they're near the viewport.
 * Respects prefers-reduced-motion (instant reveal).
 */
export default function WordReveal({
  children,
  as: Tag = "h2",
  className = "",
  style,
  delay = 0,
  stagger = 70,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) {
      setRevealed(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -24px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = children.split(" ");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TagRef = ref as any;

  return (
    <Tag ref={TagRef} className={className} style={style} aria-label={children}>
      {words.map((word, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            display: "inline-block",
            overflow: "hidden",
            // Space between words — preserve the leading space's line-break behaviour
            marginRight: i < words.length - 1 ? "0.3em" : 0,
            verticalAlign: "bottom",
          }}
        >
          <span
            style={{
              display: "inline-block",
              transform: revealed ? "translateY(0)" : "translateY(115%)",
              opacity: revealed ? 1 : 0,
              transition: reduced.current
                ? "none"
                : `transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay + i * stagger}ms,
                   opacity 0.45s ease ${delay + i * stagger}ms`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
}
