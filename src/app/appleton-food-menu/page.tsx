import type { Metadata } from "next";
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
          backgroundColor: "var(--color-teal)",
        }}
        aria-label="Food Menu"
      >
        <div className="absolute inset-0 bg-black/25" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-wider mb-1 opacity-70 text-white">
            Appleton / Food Menu
          </p>
          <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">
            Food Menu
          </h1>
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
