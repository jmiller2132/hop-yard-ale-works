"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { TapBeer } from "@/lib/untappd-scrape";

// Fallback style names when no live tap data is available
const FALLBACK_STYLES = [
  "Hazy IPA",
  "West Coast IPA",
  "Stout",
  "Wheat Ale",
  "Lager",
  "Sour",
  "Amber Ale",
  "Porter",
  "Session IPA",
  "Blonde Ale",
  "Red Ale",
];

function randomFrom<T>(arr: T[], exclude?: T): T {
  const pool = exclude !== undefined ? arr.filter((x) => x !== exclude) : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

interface SpinTheTapProps {
  /** Live HYW beers from Untappd. When present, spins real beer names. */
  beers?: TapBeer[] | null;
  /** If provided, overrides the "see tap list" link shown after a spin. Pass null to suppress the link entirely. */
  afterSpinHref?: string | null;
}

// Slot-machine deceleration schedule (ms per tick).
// Front-loaded fast ticks that dramatically slow to a landing.
function tickDelay(count: number, total: number): number {
  const pct = count / total;
  if (pct < 0.35) return 45;          // blazing fast start
  if (pct < 0.55) return 80;
  if (pct < 0.70) return 130;
  if (pct < 0.82) return 200;
  if (pct < 0.91) return 300;
  return 430;                          // final dramatic slow-down
}

export default function SpinTheTap({ beers, afterSpinHref }: SpinTheTapProps) {
  const pool = beers && beers.length > 0 ? beers.map((b) => b.name) : FALLBACK_STYLES;

  const [current, setCurrent] = useState(() => randomFrom(pool));
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState(false);   // triggers pop animation
  const [hasSpun, setHasSpun] = useState(false);
  const spinRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when pool changes (e.g. after hydration with live data)
  useEffect(() => {
    setCurrent(randomFrom(pool));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beers]);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setLanded(false);
    setHasSpun(true);

    let count = 0;
    // More ticks = longer, more satisfying spin
    const total = 22 + Math.floor(Math.random() * 8); // 22–29 ticks
    let prev = current;

    const tick = () => {
      count++;
      const next = randomFrom(pool, prev);
      prev = next;
      setCurrent(next);

      if (count < total) {
        spinRef.current = setTimeout(tick, tickDelay(count, total));
      } else {
        setSpinning(false);
        setLanded(true);
        // Clear the pop class after it plays
        setTimeout(() => setLanded(false), 500);
      }
    };

    spinRef.current = setTimeout(tick, 45);
  }

  useEffect(
    () => () => {
      if (spinRef.current) clearTimeout(spinRef.current);
    },
    []
  );

  const hasLiveTap = beers && beers.length > 0;

  return (
    <div className="flex flex-col items-start gap-2 mt-4">
      <p
        className="text-xs font-semibold uppercase tracking-[0.16em]"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        {hasLiveTap ? `${pool.length} beers on tap right now` : "Not sure what to get?"}
      </p>

      <button
        onClick={spin}
        disabled={spinning}
        aria-label="Spin to pick a beer"
        className="group flex items-center gap-3 rounded-lg px-4 py-2.5 min-h-[44px] select-none"
        style={{
          backgroundColor: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.20)",
          cursor: spinning ? "default" : "pointer",
          transition: "background-color 0.15s ease",
        }}
      >
        {/* Spinning arrow — full rotation while spinning */}
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            fontSize: "1.1rem",
            animation: spinning ? "spin-ccw 0.5s linear infinite" : "none",
            transition: spinning ? "none" : "transform 0.2s ease",
          }}
        >
          ↻
        </span>

        {/* Beer name — blurs while ticking, pops on land */}
        <span
          className="font-display text-xl uppercase leading-none tracking-tight"
          style={{
            color: "white",
            display: "inline-block",
            minWidth: hasLiveTap ? "13rem" : "9rem",
            filter: spinning ? "blur(1.5px)" : "blur(0)",
            transform: landed ? "scale(1.08)" : "scale(1)",
            transition: spinning
              ? "filter 0.08s ease"
              : landed
                ? "transform 0.12s cubic-bezier(0.2,0.8,0.2,1), filter 0.15s ease"
                : "transform 0.3s cubic-bezier(0.2,0.8,0.2,1), filter 0.15s ease",
          }}
        >
          {current}
        </span>
      </button>

      {/* Show tap list link after first spin */}
      {hasSpun && !spinning && afterSpinHref !== null && (
        <Link
          href={afterSpinHref ?? "/appleton-drinks-menu/"}
          className="text-xs underline underline-offset-4 hover:opacity-80 transition-opacity"
          style={{ color: "rgba(255,255,255,0.50)" }}
        >
          {hasLiveTap
            ? `See full tap list \u2192`
            : "See what\u2019s pouring \u2192"}
        </Link>
      )}

      <style>{`
        @keyframes spin-ccw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
