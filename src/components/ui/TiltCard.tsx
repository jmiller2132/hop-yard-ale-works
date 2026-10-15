"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Max tilt angle in degrees (default 6) */
  maxTilt?: number;
}

/**
 * Applies a subtle 3D tilt effect on mouse move.
 * Degrades gracefully on touch devices — no tilt, just the card.
 */
export default function TiltCard({
  children,
  className = "",
  style,
  maxTilt = 6,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 → 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg)`;
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg)";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        willChange: canHover ? "transform" : undefined,
        transition: canHover ? "transform 0.15s ease" : undefined,
      }}
      onMouseMove={canHover ? onMouseMove : undefined}
      onMouseLeave={canHover ? onMouseLeave : undefined}
    >
      {children}
    </div>
  );
}
