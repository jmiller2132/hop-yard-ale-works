import type { Metadata } from "next";
import Link from "next/link";
import { UNTAPPD_CONFIG } from "@/lib/untappd";
import { LOCATION_STATIC_DATA } from "@/lib/location-data";
import {
  APPLETON_WINE_MENU,
  APPLETON_CIDERS_SELTZERS,
  APPLETON_NA,
  APPLETON_NA_WINE,
} from "@/data/menu-appleton";
import DrinksMenuClient from "@/components/menu/DrinksMenuClient";
import StickyOrderBar from "@/components/menu/StickyOrderBar";
import LocationContextBar from "@/components/layout/LocationContextBar";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Appleton Drinks Menu — Hop Yard Ale Works",
  description:
    "What's on tap right now at Hop Yard Ale Works Appleton, plus wine, ciders, seltzers, and non-alcoholic options.",
};

const config = UNTAPPD_CONFIG["appleton"];
const ORDER_URL = LOCATION_STATIC_DATA["appleton"].orderOnlineUrl!;

export default function AppletonDrinksMenuPage() {
  const allNa = [...APPLETON_NA, ...APPLETON_NA_WINE];

  return (
    <>
      <section
        className="relative flex items-end pb-8 pt-20 sm:pt-24"
        style={{ minHeight: "clamp(180px, 40vh, 280px)", backgroundColor: "var(--color-ink)" }}
        aria-label="Drinks Menu"
      >
        <div className="absolute inset-0 bg-black/25" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
          <Link
            href="/appleton/"
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-3 transition-opacity hover:opacity-70"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" />
            </svg>
            Appleton
          </Link>
          <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">
            Drinks
          </h1>
          <p className="mt-1 text-white/60 text-sm font-medium uppercase tracking-wider">Appleton</p>
        </div>
      </section>

      <LocationContextBar />

      <DrinksMenuClient
        breweryId={config.breweryId}
        menuId={config.menuId}
        untappdLabel={config.label}
        wineItems={APPLETON_WINE_MENU}
        ciderItems={APPLETON_CIDERS_SELTZERS}
        naItems={allNa}
        orderUrl={ORDER_URL}
        locationName="Appleton"
        foodHref="/appleton-food-menu/"
      />

      <StickyOrderBar href={ORDER_URL} locationName="Appleton" />
    </>
  );
}
