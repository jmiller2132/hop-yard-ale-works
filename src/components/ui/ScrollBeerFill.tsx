"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Decorative pint glass whose beer level tracks scroll progress through its
 * parent section. Fills as the section enters the viewport, empties as it
 * scrolls away. Parent needs `relative overflow-hidden`.
 */
export default function ScrollBeerFill() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [fill, setFill] = useState(0); // 0–1

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf: number | null = null;

    const update = () => {
      raf = null;
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 = element bottom just entering from below
      // 1 = element center sits at 40% from top of viewport (sweet spot)
      // then eases back toward 0 as it exits upward
      const enter = 1 - (rect.bottom - vh * 0.6) / (vh * 0.6);
      const exit  = rect.top / (vh * 0.4);
      const pct   = Math.max(0, Math.min(1, Math.min(enter, exit)));
      setFill(pct);
    };

    update();
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // SVG dimensions
  const W = 56, H = 96;
  // Glass trapezoid: wider at top, narrower at bottom (classic pint)
  const TX = 7,  TX2 = W - 7;   // top-left / top-right x
  const BX = 16, BX2 = W - 16;  // bottom-left / bottom-right x
  const TY = 6,  BY = H - 6;    // top / bottom y

  const glassPath = `M${TX},${TY} L${TX2},${TY} L${BX2},${BY} L${BX},${BY} Z`;

  const maxFillH = BY - TY - 4;  // total fillable height
  const beerH    = fill * maxFillH * 0.82;     // beer body (max ~82% of glass)
  const foamH    = fill > 0.05 ? fill * 9 : 0; // foam above beer

  const beerTop  = BY - beerH;
  const foamTop  = beerTop - foamH;

  return (
    // Absolutely positioned bottom-right of the section text panel
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute bottom-8 right-6 sm:right-10"
      style={{ width: W, height: H, opacity: 0.20, willChange: "contents" }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} fill="none" overflow="visible">
        <defs>
          <clipPath id="pint-clip">
            <path d={glassPath} />
          </clipPath>
        </defs>

        {/* Beer fill */}
        {beerH > 0 && (
          <rect
            x={0} y={beerTop}
            width={W} height={beerH + 4}
            fill="rgba(232,160,32,0.92)"
            clipPath="url(#pint-clip)"
          />
        )}

        {/* Foam */}
        {foamH > 0.5 && (
          <rect
            x={0} y={foamTop}
            width={W} height={foamH + 1}
            fill="rgba(255,253,245,0.88)"
            clipPath="url(#pint-clip)"
          />
        )}

        {/* Glass outline */}
        <path d={glassPath} stroke="white" strokeWidth="1.6" />

        {/* Rim highlight */}
        <line x1={TX} y1={TY} x2={TX2} y2={TY} stroke="white" strokeWidth="2.5" strokeLinecap="round" />

        {/* Handle */}
        <path
          d={`M${BX2 - 1},${TY + 20} Q${W + 12},${TY + 20} ${W + 12},${TY + 38} Q${W + 12},${TY + 56} ${BX2 - 1},${TY + 56}`}
          stroke="white" strokeWidth="1.6" strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
