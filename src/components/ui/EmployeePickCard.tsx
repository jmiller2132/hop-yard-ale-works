"use client";

import { useState } from "react";
import Link from "next/link";

interface EmployeePick {
  employeeName: string;
  location: "appleton" | "the-falls";
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
          minHeight: "170px",
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
            <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
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
          <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            Tap to flip back →
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Dummy picks ────────────────────────────────────────────────────────────

const ALL_PICKS: EmployeePick[] = [
  // Appleton
  {
    employeeName: "Devon",
    location: "appleton",
    pickType: "drinking",
    itemName: "Flight of the Nectaron",
    message: "Every single time.",
    staffBio: "Devon has been behind the Appleton bar long enough to have strong opinions about hop varieties. The Nectaron always wins.",
  },
  {
    employeeName: "Jeff",
    location: "appleton",
    pickType: "eating",
    itemName: "Catalina Wine Mixer",
    message: "Don't overthink it.",
    staffBio: "Jeff will tell you he's tried every pizza on the menu. He's not wrong. The Catalina Wine Mixer keeps coming out on top.",
  },
  {
    employeeName: "Shandi",
    location: "appleton",
    pickType: "drinking",
    itemName: "Overzealous Mariachi Band",
    message: "The name alone should sell you.",
    staffBio: "Shandi picked this one before she even finished the pint. Says the name matches the energy.",
  },
  // The Falls
  {
    employeeName: "Paris",
    location: "the-falls",
    pickType: "drinking",
    itemName: "Mossie's Irish Stout",
    message: "Smooth every time. No notes.",
    staffBio: "Paris has been at The Falls since nearly the beginning. Her go-to hasn't changed in months.",
  },
  {
    employeeName: "Riley",
    location: "the-falls",
    pickType: "eating",
    itemName: "Should'a Been a Cowboy",
    message: "Get the ranch on the side. Trust me.",
    staffBio: "Riley will recommend this pizza to literally anyone who asks. And some who don't.",
  },
  {
    employeeName: "Dave",
    location: "the-falls",
    pickType: "drinking",
    itemName: "Running Teeth First",
    message: "Ask me what's in it. I dare you.",
    staffBio: "Dave has been pouring at The Falls long enough to know that the answer is always Running Teeth First.",
  },
];

function getPickForLocation(locationSlug: string): EmployeePick {
  const locationPicks = ALL_PICKS.filter((p) => p.location === locationSlug);
  if (!locationPicks.length) return ALL_PICKS[0];
  // Rotate based on day of week so it changes daily without being random on each load
  const dayIndex = new Date().getDay();
  return locationPicks[dayIndex % locationPicks.length];
}

export function EmployeePickSection({ locationSlug }: { locationSlug: string }) {
  const pick = getPickForLocation(locationSlug);
  const drinksHref = `/${locationSlug}-drinks-menu/`;
  return (
    <section className="section-padding" style={{ backgroundColor: "var(--color-warm-white)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-sm">
          <EmployeePickCard pick={pick} />
          <p className="mt-3 text-xs" style={{ color: "var(--color-muted)" }}>
            Staff picks rotate regularly.{" "}
            <Link href={drinksHref} className="underline underline-offset-2">
              See what&apos;s on tap →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
