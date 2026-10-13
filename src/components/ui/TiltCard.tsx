"use client";
import { useRef, ReactNode, CSSProperties } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Max tilt angle in degrees (default: 7). */
  maxTilt?: number;
  /** Perspective distance in px (default: 700). */
  perspective?: number;
}

/**
 * TiltCard
 *
 * Wraps any content and applies a subtle 3-D perspective tilt on mouse move.
 * On leave the card smoothly returns to flat. Skipped on touch and
 * prefers-reduced-motion devices.
 */
export default function TiltCard({
  children,
  className = "",
  style,
  maxTilt = 7,
  perspective = 700,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    // Normalise to -1 → +1 relative to card centre
    const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    el.style.transform = `perspective(${perspective}px) rotateX(${-dy * maxTilt}deg) rotateY(${dx * maxTilt}deg) translateZ(6px)`;
    el.style.transition = "transform 0.08s linear";
    el.style.boxShadow = `${-dx * 6}px ${dy * 6}px 24px rgba(0,0,0,0.12)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0)`;
    el.style.transition = "transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s ease";
    el.style.boxShadow = "";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, willChange: "transform" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}
