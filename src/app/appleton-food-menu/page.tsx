import type { Metadata } from "next";
import Link from "next/link";
import { APPLETON_FOOD_MENU } from "@/data/menu-appleton";
import { LOCATION_STATIC_DATA } from "@/lib/location-data";
import FoodMenuClient from "@/components/menu/FoodMenuClient";
import StickyOrderBar from "@/components/menu/StickyOrderBar";
import LocationContextBar from "@/components/layout/LocationContextBar";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Appleton Food Menu — Hop Yard Ale Works",
  description:
    "Wood-fired pizzas crafted to pair perfectly with craft beer. View the full Appleton food menu at Hop Yard Ale Works.",
};

const ORDER_URL = LOCATION_STATIC_DATA["appleton"].orderOnlineUrl!;

export default function AppletonFoodMenuPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative flex items-end pb-8 pt-20 sm:pt-24"
        style={{
          minHeight: "clamp(180px, 40vh, 280px)",
          backgroundColor: "var(--color-ink)",
        }}
        aria-label="Food Menu"
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
            Food Menu
          </h1>
          <p className="mt-1 text-white/60 text-sm font-medium uppercase tracking-wider">Appleton</p>
        </div>
      </section>

      {/* Location context bar */}
      <LocationContextBar />

      {/* Menu with sub-nav, filters, and content */}
      <FoodMenuClient
        items={APPLETON_FOOD_MENU}
        orderUrl={ORDER_URL}
        locationName="Appleton"
        drinksHref="/appleton-drinks-menu/"
      />

      {/* Mobile sticky order bar */}
      <StickyOrderBar href={ORDER_URL} locationName="Appleton" />
    </>
  );
}
