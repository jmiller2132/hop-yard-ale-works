"use client";

import React from "react";

interface Bubble {
  x: number;        // % from left
  size: number;     // px diameter
  delay: string;    // CSS delay
  dur: string;      // CSS duration
  opacity: number;
}

// Varied so bubbles don't feel mechanical
const BUBBLES: Bubble[] = [
  { x:  7, size: 10, delay: "0s",    dur: "7s",  opacity: 0.16 },
  { x: 17, size: 18, delay: "1.2s",  dur: "9s",  opacity: 0.10 },
  { x: 29, size:  8, delay: "0.4s",  dur: "6.5s",opacity: 0.20 },
  { x: 41, size: 24, delay: "2.5s",  dur: "11s", opacity: 0.07 },
  { x: 54, size: 12, delay: "0.8s",  dur: "8s",  opacity: 0.18 },
  { x: 62, size:  7, delay: "3.1s",  dur: "6s",  opacity: 0.22 },
  { x: 71, size: 20, delay: "1.7s",  dur: "10s", opacity: 0.09 },
  { x: 82, size: 10, delay: "0.2s",  dur: "7.5s",opacity: 0.15 },
  { x: 89, size: 15, delay: "2.0s",  dur: "8.5s",opacity: 0.12 },
  { x: 22, size:  7, delay: "4.2s",  dur: "6.2s",opacity: 0.21 },
  { x: 47, size: 14, delay: "3.8s",  dur: "9.5s",opacity: 0.11 },
  { x: 77, size:  9, delay: "1.5s",  dur: "7.2s",opacity: 0.17 },
];

export default function FloatingBubbles() {
  return (
    <>
      <style>{`
        @keyframes bubble-rise {
          0%   { transform: translateY(0)   scale(1);   opacity: var(--bop); }
          75%  { opacity: var(--bop); }
          100% { transform: translateY(-120vh) scale(0.6); opacity: 0; }
        }
        .hya-bubble {
          position: absolute;
          border-radius: 50%;
          background: white;
          bottom: -2rem;
          animation: bubble-rise var(--bdur) ease-in var(--bdel) infinite;
          will-change: transform, opacity;
        }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ zIndex: 0 }}
      >
        {BUBBLES.map((b, i) => (
          <div
            key={i}
            className="hya-bubble"
            style={{
              left: `${b.x}%`,
              width: b.size,
              height: b.size,
              "--bop": b.opacity,
              "--bdur": b.dur,
              "--bdel": b.delay,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
}
