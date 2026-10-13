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
];

function randomFrom<T>(arr: T[], exclude?: T): T {
  const pool = exclude !== undefined ? arr.filter((x) => x !== exclude) : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

interface SpinTheTapProps {
  /** Live HYW beers from Untappd. When present, spins real beer names. */
  beers?: TapBeer[] | null;
}

export default function SpinTheTap({ beers }: SpinTheTapProps) {
  const pool = beers && beers.length > 0 ? beers.map((b) => b.name) : FALLBACK_STYLES;

  const [current, setCurrent] = useState(() => randomFrom(pool));
  const [spinning, setSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const spinRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when pool changes (e.g. after hydration)
  useEffect(() => {
    setCurrent(randomFrom(pool));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beers]);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setHasSpun(true);

    let count = 0;
    const total = 6 + Math.floor(Math.random() * 4);
    let prev = current;

    const tick = () => {
      count++;
      const next = randomFrom(pool, prev);
      prev = next;
      setCurrent(next);
      const delay =
        count < total * 0.5 ? 80 : count < total * 0.8 ? 140 : 220;

      if (count < total) {
        spinRef.current = setTimeout(tick, delay);
      } else {
        setSpinning(false);
      }
    };

    spinRef.current = setTimeout(tick, 80);
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
        {hasLiveTap ? "What's on tap right now" : "Not sure what to get?"}
      </p>

      <button
        onClick={spin}
        disabled={spinning}
        aria-label="Spin to pick a beer"
        className="group flex items-center gap-2 rounded-lg px-4 py-2.5 min-h-[44px] transition-all duration-150 select-none"
        style={{
          backgroundColor: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.20)",
          cursor: spinning ? "default" : "pointer",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            transform: spinning ? "rotate(180deg)" : "rotate(0deg)",
            transition: spinning
              ? "transform 0.4s linear"
              : "transform 0.2s ease",
          }}
        >
          ↻
        </span>

        <span
          className="font-display text-xl uppercase leading-none tracking-tight transition-opacity duration-100"
          style={{
            color: "white",
            opacity: spinning ? 0.55 : 1,
            // Keep a reasonable min-width so the button doesn't resize
            minWidth: hasLiveTap ? "12rem" : "9rem",
            display: "inline-block",
          }}
        >
          {current}
        </span>
      </button>

      {/* Show "See tap list" link once the user has spun at least once */}
      {hasSpun && !spinning && (
        <Link
          href="/appleton-drinks-menu/"
          className="text-xs underline underline-offset-4 hover:opacity-80 transition-opacity"
          style={{ color: "rgba(255,255,255,0.50)" }}
        >
          {hasLiveTap
            ? `See full tap list \u2192`
            : "See what\u2019s pouring \u2192"}
        </Link>
      )}
    </div>
  );
}
