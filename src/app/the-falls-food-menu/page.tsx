import type { Metadata } from "next";
import { APPLETON_FOOD_MENU } from "@/data/menu-appleton";
import { LOCATIONS } from "@/lib/location-data";
import FoodMenuClient from "@/components/menu/FoodMenuClient";
import FoodMenuHero from "@/components/menu/FoodMenuHero";
import StickyOrderBar from "@/components/menu/StickyOrderBar";
import LocationContextBar from "@/components/layout/LocationContextBar";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Menomonee Falls Wood-Fired Pizza Menu",
  description:
    "Wood-fired pizzas at Hop Yard Ale Works in Menomonee Falls, WI. Same food menu as our Appleton taproom. View the full menu and order online.",
};

const ORDER_URL = LOCATIONS["the-falls"].orderOnlineUrl;

export default function TheFallsFoodMenuPage() {
  return (
    <>
      <FoodMenuHero backHref="/the-falls/" backLabel="The Falls" place="Menomonee Falls" />

      {/* Location context bar */}
      <LocationContextBar />

      <FoodMenuClient
        items={APPLETON_FOOD_MENU}
        orderUrl={ORDER_URL}
        locationName="The Falls"
        drinksHref="/the-falls-drinks-menu/"
      />

      <StickyOrderBar href={ORDER_URL} locationName="The Falls" />
    </>
  );
}
