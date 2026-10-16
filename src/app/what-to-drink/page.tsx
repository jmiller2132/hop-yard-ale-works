import type { Metadata } from "next";
import BeerQuiz from "@/components/quiz/BeerQuiz";
import { fetchAllTapBeers } from "@/lib/untappd-scrape";
import { UNTAPPD_CONFIG } from "@/lib/untappd";

export const revalidate = 1800; // match Untappd cache

export const metadata: Metadata = {
  title: "What Should I Drink? Beer Finder Quiz",
  description:
    "Four quick questions to find your perfect pint at Hop Yard Ale Works. IPAs, stouts, lagers, sours — figure out what sounds right tonight.",
};

export default async function WhatToDrinkPage() {
  const beers = await fetchAllTapBeers([
    { breweryId: UNTAPPD_CONFIG.appleton.breweryId, menuId: UNTAPPD_CONFIG.appleton.menuId },
    { breweryId: UNTAPPD_CONFIG["the-falls"].breweryId, menuId: UNTAPPD_CONFIG["the-falls"].menuId },
  ]).catch(() => []);

  return (
    <>
      {/* Hero */}
      <section
        className="page-hero"
        aria-label="Beer finder quiz"
      >
        <div className="mx-auto w-full max-w-xl px-4 sm:px-6">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            4 questions
          </p>
          <h1 className="font-display text-5xl sm:text-7xl uppercase leading-[0.9] text-white">
            What Should
            <br />I Drink?
          </h1>
          <p className="mt-4 text-white/65 text-base max-w-xs leading-relaxed">
            Answer four quick questions and we&rsquo;ll point you at something pouring right now.
            {beers.length > 0 && (
              <span className="block mt-1 text-white/40">
                {beers.length} Hop Yard beers on tap right now.
              </span>
            )}
          </p>
        </div>
      </section>

      {/* Quiz */}
      <BeerQuiz beers={beers.length > 0 ? beers : null} />
    </>
  );
}
