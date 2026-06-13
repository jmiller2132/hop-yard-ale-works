"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

const STYLES = [
  {
    name: "Blonde Ale",
    color: "#F5C842",
    description: "Light, easy, perfect first craft beer. Approachable and clean.",
    ideal: "New to craft beer",
  },
  {
    name: "Hazy IPA",
    color: "#E8A020",
    description: "Hazy, juicy, low bitterness. Great if you like fruity drinks.",
    ideal: "Like fruity flavors",
  },
  {
    name: "West Coast IPA",
    color: "#C47A1A",
    description: "Crisp, bitter, piney. The classic bold hop experience.",
    ideal: "Like bold & bitter",
  },
  {
    name: "Wheat / Hefeweizen",
    color: "#E8CB6A",
    description: "Cloudy, light, hints of citrus or banana. Easy and refreshing.",
    ideal: "Like lighter beers",
  },
  {
    name: "Porter",
    color: "#5C3A1E",
    description: "Dark, smooth, roasty. Like coffee met craft beer.",
    ideal: "Like coffee or chocolate",
  },
  {
    name: "Stout",
    color: "#2C1A0E",
    description: "Rich, dark, full-bodied. Chocolate and coffee run deep.",
    ideal: "Want something bold",
  },
  {
    name: "Lager",
    color: "#F0D060",
    description: "Clean, crisp, refreshing. The everyday classic, done right.",
    ideal: "Want something familiar",
  },
  {
    name: "Sour",
    color: "#A8C840",
    description: "Tart, funky, often fruity. An adventure worth taking.",
    ideal: "Like trying something different",
  },
];

export default function LearnToBrewery() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between mb-3 gap-4">
        <h3
          className="font-heading text-lg font-semibold"
          style={{ color: "var(--color-ink)" }}
        >
          New to craft beer?
        </h3>
        <span className="text-xs hidden sm:block" style={{ color: "var(--color-muted)" }}>
          A quick guide from the bar.
        </span>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-3 sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {STYLES.map((style) => (
          <div
            key={style.name}
            className="flex-shrink-0 w-44 sm:w-auto rounded-xl p-4"
            style={{
              backgroundColor: "white",
              border: "1px solid rgba(0,0,0,0.07)",
            }}
          >
            {/* Color swatch */}
            <div
              className="w-8 h-8 rounded-full mb-3"
              style={{ backgroundColor: style.color }}
              aria-hidden="true"
            />
            <h4
              className="font-heading text-sm font-semibold leading-tight"
              style={{ color: "var(--color-ink)" }}
            >
              {style.name}
            </h4>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
              {style.description}
            </p>
            <p
              className="mt-2 text-xs font-medium"
              style={{ color: "var(--color-green)" }}
            >
              If you: {style.ideal}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
