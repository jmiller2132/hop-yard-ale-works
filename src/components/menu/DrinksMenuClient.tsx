"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import UntappdEmbed from "./UntappdEmbed";
import LearnToBrewery from "./LearnToBrewery";
import MenuSectionNav from "./MenuSectionNav";
import SpinTheTap from "@/components/ui/SpinTheTap";
import type { WineItemSeed } from "@/data/menu-appleton";
import type { DrinkItemSeed } from "@/data/menu-the-falls";
import type { TapBeer } from "@/lib/untappd-scrape";

const SECTIONS = [
  { id: "on-tap", label: "On Tap" },
  { id: "wine", label: "Wine" },
  { id: "ciders-seltzers", label: "Ciders & Seltzers", shortLabel: "Ciders" },
  { id: "non-alcoholic", label: "Non-Alcoholic", shortLabel: "NA" },
];


interface DrinksMenuClientProps {
  breweryId: number;
  menuId: number;
  untappdLabel: string;
  wineItems: WineItemSeed[];
  ciderItems: DrinkItemSeed[];
  naItems: DrinkItemSeed[];
  orderUrl: string;
  locationName: string;
  foodHref: string;
  tapBeers?: TapBeer[] | null;
}

export default function DrinksMenuClient({
  breweryId,
  menuId,
  untappdLabel,
  wineItems,
  ciderItems,
  naItems,
  orderUrl,
  locationName,
  foodHref,
  tapBeers,
}: DrinksMenuClientProps) {
  const [activeSection, setActiveSection] = useState("on-tap");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const scrollingRef = useRef(false);

  const handleSectionSelect = useCallback((id: string) => {
    setActiveSection(id);
    const el = sectionRefs.current[id];
    if (el) {
      scrollingRef.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => { scrollingRef.current = false; }, 800);
    }
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !scrollingRef.current) setActiveSection(id);
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Group wine by section
  const wineSections = Array.from(new Set(wineItems.map((i) => i.section)));
  const ciderSections = Array.from(new Set(ciderItems.map((i) => i.section)));

  return (
    <>
      <MenuSectionNav
        sections={SECTIONS}
        activeId={activeSection}
        onSelect={handleSectionSelect}
      />

      <div className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 md:pb-12">

        {/* On Tap */}
        <section
          ref={(el) => { sectionRefs.current["on-tap"] = el; }}
          id="on-tap"
          className="pt-10"
        >
          <UntappdEmbed
            breweryId={breweryId}
            menuId={menuId}
            label={untappdLabel}
          />

          <LearnToBrewery />

          {/* Spin the Tap + Quiz — below the menu, alongside "New to craft beer?" */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {/* Spin the Tap */}
            <div
              className="rounded p-6 flex flex-col"
              style={{ backgroundColor: "var(--color-ink)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                Feeling lucky?
              </p>
              <h3 className="font-display text-2xl uppercase leading-tight mb-2" style={{ color: "white" }}>
                Spin the Tap
              </h3>
              <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                Hit the button — we&rsquo;ll pull a random beer from tonight&rsquo;s tap list.
              </p>
              <SpinTheTap beers={tapBeers ?? null} afterSpinHref={null} />
            </div>

            {/* Quiz CTA */}
            <Link
              href="/what-to-drink/"
              className="rounded p-6 flex flex-col group hover:opacity-95 transition-opacity"
              style={{ backgroundColor: "var(--color-teal)", color: "white" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                Not sure?
              </p>
              <h3 className="font-display text-2xl uppercase leading-tight mb-2">
                Find My Beer
              </h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                Four quick questions. We&rsquo;ll match you to something on tap right now.
              </p>
              <span
                className="mt-auto pt-5 text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Take the quiz →
              </span>
            </Link>
          </div>
        </section>

        {/* Wine */}
        <section
          ref={(el) => { sectionRefs.current["wine"] = el; }}
          id="wine"
          className="pt-12"
        >
          <h2
            className="font-heading text-3xl font-bold mb-1 sm:text-2xl"
            style={{ color: "var(--color-ink)" }}
          >
            Wine
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
            All wine served by the glass.
          </p>

          {wineSections.map((section) => {
            const sectionItems = wineItems.filter((i) => i.section === section);
            return (
              <div key={section} className="mb-8">
                <h3
                  className="font-heading text-base font-semibold mb-3 pb-2 border-b"
                  style={{ color: "var(--color-ink)", borderColor: "rgba(0,0,0,0.08)" }}
                >
                  {section}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {sectionItems.map((item) => (
                    <WineCard key={item.name} item={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* Ciders & Seltzers */}
        <section
          ref={(el) => { sectionRefs.current["ciders-seltzers"] = el; }}
          id="ciders-seltzers"
          className="pt-12"
        >
          <h2
            className="font-heading text-3xl font-bold mb-6 sm:text-2xl"
            style={{ color: "var(--color-ink)" }}
          >
            Ciders & Seltzers
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ciderItems.map((item) => (
              <DrinkCard key={item.name} item={item} />
            ))}
          </div>
        </section>

        {/* Non-Alcoholic */}
        <section
          ref={(el) => { sectionRefs.current["non-alcoholic"] = el; }}
          id="non-alcoholic"
          className="pt-12"
        >
          <h2
            className="font-heading text-3xl font-bold mb-6 sm:text-2xl"
            style={{ color: "var(--color-ink)" }}
          >
            Non-Alcoholic
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {naItems.map((item) => (
              <DrinkCard key={item.name} item={item} />
            ))}
          </div>
        </section>

        {/* End of menu line */}
        <p
          className="mt-16 text-center text-sm italic"
          style={{ color: "var(--color-muted)" }}
        >
          You read the whole thing. The bar respects that.
        </p>

        {/* NextStep */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 pb-4">
          <Link
            href={foodHref}
            className="flex flex-col rounded p-6 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--color-ink)", color: "white" }}
          >
            <span className="font-heading text-lg font-bold">Hungry?</span>
            <span className="mt-1 text-sm opacity-80">See the full food menu →</span>
          </Link>
          <Link
            href={orderUrl}
            className="flex flex-col rounded p-6 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
          >
            <span className="font-heading text-lg font-bold">Order Online</span>
            <span className="mt-1 text-sm opacity-80">Pick up or delivery via Toast →</span>
          </Link>
        </div>
      </div>

      {/* end of file — no toast needed on this page */}
    </>
  );
}

function WineCard({ item }: { item: WineItemSeed }) {
  return (
    <div
      className="rounded p-5"
      style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.07)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4
            className="font-heading text-base font-semibold sm:text-sm"
            style={{ color: "var(--color-ink)" }}
          >
            {item.name}
          </h4>
          {item.producer && (
            <p className="text-xs mt-0.5" style={{ color: "var(--color-teal)" }}>
              {item.location}
            </p>
          )}
          {item.description && (
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              {item.description}
            </p>
          )}
        </div>
        <span
          className="flex-shrink-0 font-mono-brand text-sm font-bold"
          style={{ color: "var(--color-ink)" }}
        >
          {item.price}
        </span>
      </div>
    </div>
  );
}

function DrinkCard({ item }: { item: DrinkItemSeed }) {
  return (
    <div
      className="rounded p-5"
      style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.07)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4
            className="font-heading text-base font-semibold sm:text-sm"
            style={{ color: "var(--color-ink)" }}
          >
            {item.name}
          </h4>
          {item.description && (
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              {item.description}
            </p>
          )}
          {item.tags && item.tags.includes("glutenFree") && (
            <span
              className="inline-block mt-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: "#FEF9C3", color: "#713F12" }}
            >
              GF
            </span>
          )}
        </div>
        <span
          className="flex-shrink-0 font-mono-brand text-sm font-bold"
          style={{ color: "var(--color-ink)" }}
        >
          {item.price}
        </span>
      </div>
    </div>
  );
}
