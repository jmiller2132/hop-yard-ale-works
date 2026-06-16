"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ContextConfig {
  locationName: string;
  locationPath: string;
  currentMenu: "food" | "drinks";
  foodPath: string;
  drinksPath: string;
  otherLocationName: string;
  otherPath: string;
}

const CONTEXT_MAP: Record<string, ContextConfig> = {
  "/appleton-food-menu/": {
    locationName: "Appleton",
    locationPath: "/appleton/",
    currentMenu: "food",
    foodPath: "/appleton-food-menu/",
    drinksPath: "/appleton-drinks-menu/",
    otherLocationName: "The Falls",
    otherPath: "/the-falls-food-menu/",
  },
  "/appleton-drinks-menu/": {
    locationName: "Appleton",
    locationPath: "/appleton/",
    currentMenu: "drinks",
    foodPath: "/appleton-food-menu/",
    drinksPath: "/appleton-drinks-menu/",
    otherLocationName: "The Falls",
    otherPath: "/the-falls-drinks-menu/",
  },
  "/the-falls-food-menu/": {
    locationName: "The Falls",
    locationPath: "/the-falls/",
    currentMenu: "food",
    foodPath: "/the-falls-food-menu/",
    drinksPath: "/the-falls-drinks-menu/",
    otherLocationName: "Appleton",
    otherPath: "/appleton-food-menu/",
  },
  "/the-falls-drinks-menu/": {
    locationName: "The Falls",
    locationPath: "/the-falls/",
    currentMenu: "drinks",
    foodPath: "/the-falls-food-menu/",
    drinksPath: "/the-falls-drinks-menu/",
    otherLocationName: "Appleton",
    otherPath: "/appleton-drinks-menu/",
  },
};

export default function LocationContextBar() {
  const pathname = usePathname();
  const ctx = CONTEXT_MAP[pathname] ?? CONTEXT_MAP[pathname + "/"];
  if (!ctx) return null;

  return (
    <div
      className="sticky top-16 z-30 border-b"
      style={{ backgroundColor: "var(--color-ink)", borderColor: "rgba(255,255,255,0.1)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-0 px-4 sm:px-6" style={{ minHeight: "44px" }}>

        {/* Back to location */}
        <Link
          href={ctx.locationPath}
          className="flex items-center gap-1.5 py-2 pr-4 text-sm font-medium transition-opacity hover:opacity-70 shrink-0"
          style={{ color: "rgba(255,255,255,0.9)" }}
          aria-label={`Back to ${ctx.locationName}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
          <span>{ctx.locationName}</span>
        </Link>

        {/* Divider */}
        <span className="text-white/20 select-none shrink-0">|</span>

        {/* Food / Drinks tabs */}
        <div className="flex items-center gap-1 px-3">
          <Link
            href={ctx.foodPath}
            className="rounded px-3 py-1 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: ctx.currentMenu === "food" ? "rgba(255,255,255,0.15)" : "transparent",
              color: ctx.currentMenu === "food" ? "white" : "rgba(255,255,255,0.5)",
            }}
          >
            Food
          </Link>
          <Link
            href={ctx.drinksPath}
            className="rounded px-3 py-1 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: ctx.currentMenu === "drinks" ? "rgba(255,255,255,0.15)" : "transparent",
              color: ctx.currentMenu === "drinks" ? "white" : "rgba(255,255,255,0.5)",
            }}
          >
            Drinks
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Switch location */}
        <span className="text-white/20 select-none shrink-0 hidden sm:block">|</span>
        <Link
          href={ctx.otherPath}
          className="hidden sm:flex items-center gap-1 py-2 pl-4 text-xs font-medium transition-opacity hover:opacity-70 shrink-0"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          {ctx.otherLocationName}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

      </div>
    </div>
  );
}
