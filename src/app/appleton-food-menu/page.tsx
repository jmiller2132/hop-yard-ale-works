import type { Metadata } from "next";
import { APPLETON_FOOD_MENU } from "@/data/menu-appleton";
import { LOCATIONS } from "@/lib/location-data";
import FoodMenuClient from "@/components/menu/FoodMenuClient";
import FoodMenuHero from "@/components/menu/FoodMenuHero";
import StickyOrderBar from "@/components/menu/StickyOrderBar";
import LocationContextBar from "@/components/layout/LocationContextBar";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Appleton Wood-Fired Pizza Menu",
  description:
    "Wood-fired pizzas crafted to pair perfectly with craft beer. View the full food menu at Hop Yard Ale Works in Appleton, WI, and order online.",
};

const ORDER_URL = LOCATIONS.appleton.orderOnlineUrl;

export default function AppletonFoodMenuPage() {
  return (
    <>
      <FoodMenuHero backHref="/appleton/" backLabel="Appleton" place="Appleton" />

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
