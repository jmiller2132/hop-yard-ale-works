"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

// Fill % thresholds
const PERFECT_MIN = 68;
const PERFECT_MAX = 80;
const GOOD_MIN = 55;
const GOOD_MAX = 88;
const FOAM_THRESHOLD = 83; // above this = too foamy

type Rating = "perfect" | "good-high" | "good-low" | "foam" | "empty" | null;

interface RatingConfig {
  label: string;
  emoji: string;
  message: string;
  color: string;
}

const RATINGS: Record<Exclude<Rating, null>, RatingConfig> = {
  perfect: {
    label: "Cellar Master",
    emoji: "🍺",
    message: "That's a pour you'd be proud to set down.",
    color: "#6ABF4B",
  },
  "good-high": {
    label: "Close Enough",
    emoji: "😅",
    message: "A little full. We'll allow it. Don't make it a habit.",
    color: "#D4A017",
  },
  "good-low": {
    label: "Short Pour",
    emoji: "🤏",
    message: "You could fit another two fingers in there. Try again.",
    color: "#D4A017",
  },
  foam: {
    label: "All Head",
    emoji: "💨",
    message: "You poured that like it owed you money.",
    color: "#e07b39",
  },
  empty: {
    label: "Didn't Even Try",
    emoji: "💀",
    message: "The glass is just standing there, disappointed.",
    color: "#888",
  },
};

function getRating(fill: number): Exclude<Rating, null> {
  if (fill < 10) return "empty";
  if (fill > FOAM_THRESHOLD) return "foam";
  if (fill >= PERFECT_MIN && fill <= PERFECT_MAX) return "perfect";
  if (fill >= GOOD_MIN && fill <= GOOD_MAX) {
    return fill > PERFECT_MAX ? "good-high" : "good-low";
  }
  return fill < GOOD_MIN ? "good-low" : "good-high";
}

// How much fill % per animation frame while pouring
const FILL_RATE = 0.45;

export default function PourGame() {
  const [fill, setFill] = useState(0);
  const [rating, setRating] = useState<Exclude<Rating, null> | null>(null);
  const [pouring, setPouring] = useState(false);
  const [pours, setPours] = useState(0); // track attempt count for variety
  const pouringRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const fillRef = useRef(0);

  const stopPouring = useCallback(() => {
    if (!pouringRef.current) return;
    pouringRef.current = false;
    setPouring(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const finalFill = fillRef.current;
    setRating(getRating(finalFill));
    setPours((p) => p + 1);
  }, []);

  const startPouring = useCallback(() => {
    if (rating !== null) return; // already evaluated this round
    pouringRef.current = true;
    setPouring(true);

    const pour = () => {
      if (!pouringRef.current) return;
      fillRef.current = Math.min(fillRef.current + FILL_RATE, 100);
      setFill(fillRef.current);
      if (fillRef.current >= 100) {
        stopPouring();
        return;
      }
      animFrameRef.current = requestAnimationFrame(pour);
    };
    animFrameRef.current = requestAnimationFrame(pour);
  }, [rating, stopPouring]);

  const reset = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    pouringRef.current = false;
    fillRef.current = 0;
    setFill(0);
    setRating(null);
    setPouring(false);
  }, []);

  // Global mouse/touch up to stop pour
  useEffect(() => {
    const up = () => stopPouring();
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, [stopPouring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const ratingConfig = rating ? RATINGS[rating] : null;

  // Foam layer height — more foam if overpoured
  const foamHeight = fill > 60 ? Math.min((fill - 60) * 0.6, 18) : 0;
  // Liquid fill (below foam)
  const liquidHeight = Math.max(0, fill - foamHeight * 0.5);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 select-none"
      style={{ backgroundColor: "var(--color-ink)", color: "white" }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-green)" }}>
          Hidden Tap
        </p>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-3">
          Pour the Pint
        </h1>
        <p className="text-white/60 text-sm max-w-xs mx-auto">
          Hold to pour. Release when it looks right.
        </p>
      </div>

      {/* Pint Glass */}
      <div className="relative mb-8" style={{ width: 140, height: 220 }}>
        <svg
          viewBox="0 0 140 220"
          width="140"
          height="220"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, zIndex: 2 }}
        >
          {/* Glass outline — tapers slightly at bottom */}
          <path
            d="M20 10 L10 210 H130 L120 10 Z"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Shine */}
          <path
            d="M28 20 L21 190"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>

        {/* Liquid fill — clipped inside glass shape */}
        <svg
          viewBox="0 0 140 220"
          width="140"
          height="220"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        >
          <defs>
            <clipPath id="glass-clip">
              <path d="M21 12 L11 208 H129 L119 12 Z" />
            </clipPath>
          </defs>

          {/* Beer liquid */}
          <rect
            x="0"
            y={220 - (liquidHeight / 100) * 198}
            width="140"
            height={(liquidHeight / 100) * 198}
            fill="#D4A017"
            opacity="0.85"
            clipPath="url(#glass-clip)"
            style={{ transition: pouring ? "none" : "y 0.1s, height 0.1s" }}
          />

          {/* Foam */}
          {foamHeight > 0 && (
            <ellipse
              cx="70"
              cy={220 - (liquidHeight / 100) * 198}
              rx="52"
              ry={foamHeight * 0.8}
              fill="rgba(255,250,240,0.9)"
              clipPath="url(#glass-clip)"
            />
          )}
        </svg>

        {/* Fill level marker lines */}
        <svg
          viewBox="0 0 140 220"
          width="140"
          height="220"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}
        >
          {/* Perfect zone bracket */}
          <line
            x1="112"
            y1={220 - (PERFECT_MIN / 100) * 198}
            x2="126"
            y2={220 - (PERFECT_MIN / 100) * 198}
            stroke="rgba(106,191,75,0.5)"
            strokeWidth="1.5"
          />
          <line
            x1="112"
            y1={220 - (PERFECT_MAX / 100) * 198}
            x2="126"
            y2={220 - (PERFECT_MAX / 100) * 198}
            stroke="rgba(106,191,75,0.5)"
            strokeWidth="1.5"
          />
          <line
            x1="119"
            y1={220 - (PERFECT_MIN / 100) * 198}
            x2="119"
            y2={220 - (PERFECT_MAX / 100) * 198}
            stroke="rgba(106,191,75,0.35)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Fill percentage */}
      <p className="text-2xl font-heading font-bold mb-6 tabular-nums" style={{ color: rating ? ratingConfig?.color : "white", minHeight: "2rem" }}>
        {fill > 0 ? `${Math.round(fill)}%` : ""}
      </p>

      {/* Result */}
      {ratingConfig && (
        <div className="text-center mb-8 animate-fade-in" style={{ animationDuration: "0.4s", animationFillMode: "both" }}>
          <p className="text-4xl mb-2">{ratingConfig.emoji}</p>
          <p className="font-heading text-2xl font-bold mb-1" style={{ color: ratingConfig.color }}>
            {ratingConfig.label}
          </p>
          <p className="text-white/70 text-sm max-w-xs mx-auto">{ratingConfig.message}</p>
          {pours >= 3 && rating !== "perfect" && (
            <p className="mt-2 text-white/40 text-xs">
              {pours >= 6 ? "You could be here all night." : "Keep practicing."}
            </p>
          )}
          {rating === "perfect" && (
            <p className="mt-2 text-white/40 text-xs">
              {pours === 1 ? "First try. Suspicious." : "There it is."}
            </p>
          )}
        </div>
      )}

      {/* Pour button / Try again */}
      {rating === null ? (
        <button
          onMouseDown={startPouring}
          onTouchStart={(e) => { e.preventDefault(); startPouring(); }}
          className="relative rounded-full font-semibold text-sm transition-all duration-150 focus-visible:outline-none"
          style={{
            width: 100,
            height: 100,
            backgroundColor: pouring ? "var(--color-green)" : "rgba(255,255,255,0.08)",
            border: `2px solid ${pouring ? "var(--color-green)" : "rgba(255,255,255,0.2)"}`,
            color: pouring ? "white" : "rgba(255,255,255,0.6)",
            transform: pouring ? "scale(0.96)" : "scale(1)",
            cursor: "pointer",
          }}
          aria-label="Hold to pour"
        >
          {pouring ? "Pouring…" : "Hold"}
        </button>
      ) : (
        <button
          onClick={reset}
          className="rounded-md px-6 py-3 text-sm font-semibold transition-colors"
          style={{ backgroundColor: "var(--color-green)", color: "white" }}
        >
          Pour Another
        </button>
      )}

      {/* Subtle back link */}
      <Link
        href="/"
        className="mt-16 text-xs underline-offset-4 hover:underline"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        Back to the real world
      </Link>
    </div>
  );
}
