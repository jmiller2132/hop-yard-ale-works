import type { Metadata } from "next";
import { UNTAPPD_CONFIG } from "@/lib/untappd";
import { LOCATION_STATIC_DATA } from "@/lib/location-data";
import {
  FALLS_WINE_MENU,
  FALLS_CIDERS_SELTZERS,
  FALLS_NA,
  FALLS_NA_WINE,
} from "@/data/menu-the-falls";
import DrinksMenuClient from "@/components/menu/DrinksMenuClient";
import StickyOrderBar from "@/components/menu/StickyOrderBar";
import LocationContextBar from "@/components/layout/LocationContextBar";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Menomonee Falls Drinks Menu — Hop Yard Ale Works",
  description:
    "What's on tap right now at Hop Yard Ale Works Menomonee Falls, plus wine, ciders, seltzers, and non-alcoholic options.",
};

const config = UNTAPPD_CONFIG["the-falls"];
const ORDER_URL = LOCATION_STATIC_DATA["the-falls"].orderOnlineUrl!;

export default function TheFallsDrinksMenuPage() {
  const allNa = [...FALLS_NA, ...FALLS_NA_WINE];

  return (
    <>
      <section
        className="relative flex items-end pb-8 pt-20 sm:pt-24"
        style={{ minHeight: "clamp(180px, 40vh, 280px)", backgroundColor: "var(--color-ink)" }}
        aria-label="Drinks Menu"
      >
        <div className="absolute inset-0 bg-black/25" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-wider mb-1 opacity-70 text-white">
            The Falls / Drinks
          </p>
          <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">
            Drinks
          </h1>
          <p className="mt-2 text-white/70 text-sm">
            Beer is first. Always.
          </p>
        </div>
      </section>

      <LocationContextBar />

      <DrinksMenuClient
        breweryId={config.breweryId}
        menuId={config.menuId}
        untappdLabel={config.label}
        wineItems={FALLS_WINE_MENU}
        ciderItems={FALLS_CIDERS_SELTZERS}
        naItems={allNa}
        orderUrl={ORDER_URL}
        locationName="The Falls"
        foodHref="/the-falls-food-menu/"
      />

      <StickyOrderBar href={ORDER_URL} locationName="The Falls" />
    </>
  );
}
