"use client";

import { useState } from "react";
import Link from "next/link";

interface EmployeePick {
  employeeName: string;
  pickType: "drinking" | "eating";
  itemName: string;
  message?: string;
  staffBio?: string;
}

interface EmployeePickCardProps {
  pick: EmployeePick;
}

export default function EmployeePickCard({ pick }: EmployeePickCardProps) {
  const [flipped, setFlipped] = useState(false);

  const frontText =
    pick.pickType === "drinking"
      ? `Right now ${pick.employeeName} is drinking the ${pick.itemName}.`
      : `Right now ${pick.employeeName} is eating the ${pick.itemName}.`;

  return (
    <div
      className="relative cursor-pointer select-none"
      style={{ perspective: "900px" }}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
      tabIndex={0}
      role="button"
      aria-label={flipped ? "Flip back" : "Learn more about this pick"}
    >
      <div
        className="relative transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          minHeight: "140px",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl p-5 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            backgroundColor: "var(--color-ink)",
            color: "white",
          }}
        >
          <div>
            <p className="font-heading text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-green)" }}>
              Staff Pick
            </p>
            <p className="text-base leading-snug">{frontText}</p>
            {pick.message && (
              <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                &ldquo;{pick.message}&rdquo;
              </p>
            )}
          </div>
          {pick.staffBio && (
            <p className="mt-3 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              Tap to flip →
            </p>
          )}
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl p-5 flex flex-col justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundColor: "var(--color-green)",
            color: "white",
          }}
        >
          <p className="font-heading text-sm font-semibold mb-2">{pick.employeeName}</p>
          <p className="text-sm leading-relaxed">
            {pick.staffBio ?? "Part of the team. Knows good beer."}
          </p>
          <p className="mt-3 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            Tap to flip back →
          </p>
        </div>
      </div>
    </div>
  );
}

// Static fallback picks used when no CMS data
export const FALLBACK_PICKS: EmployeePick[] = [
  {
    employeeName: "Oliver",
    pickType: "drinking",
    itemName: "Engine Co. Red",
    message: "Brewed it myself. Not biased.",
    staffBio: "Co-founder, head brewer, and the reason the Engine Co. Red exists. Has been behind the bar since day one.",
  },
];

export function EmployeePickSection({ locationSlug }: { locationSlug: string }) {
  const pick = FALLBACK_PICKS[0];
  return (
    <section className="section-padding" style={{ backgroundColor: "var(--color-warm-white)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-sm">
          <EmployeePickCard pick={pick} />
          <p className="mt-3 text-xs" style={{ color: "var(--color-muted)" }}>
            Staff picks change regularly.{" "}
            <Link
              href={`/${locationSlug}-drinks-menu/`}
              className="underline underline-offset-2"
            >
              See what&apos;s on tap →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
