"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LOCATION_MAP: Record<string, { label: string; opposite: string; oppositePath: string }> = {
  "/appleton-food-menu/": {
    label: "Appleton",
    opposite: "The Falls",
    oppositePath: "/the-falls-food-menu/",
  },
  "/appleton-food-menu": {
    label: "Appleton",
    opposite: "The Falls",
    oppositePath: "/the-falls-food-menu/",
  },
  "/the-falls-food-menu/": {
    label: "The Falls",
    opposite: "Appleton",
    oppositePath: "/appleton-food-menu/",
  },
  "/appleton-drinks-menu/": {
    label: "Appleton",
    opposite: "The Falls",
    oppositePath: "/the-falls-drinks-menu/",
  },
  "/the-falls-drinks-menu/": {
    label: "The Falls",
    opposite: "Appleton",
    oppositePath: "/appleton-drinks-menu/",
  },
};

export default function LocationContextBar() {
  const pathname = usePathname();
  const ctx = LOCATION_MAP[pathname] ?? LOCATION_MAP[pathname + "/"];

  if (!ctx) return null;

  return (
    <div
      className="sticky top-16 z-30 border-b py-2 px-4 sm:px-6"
      style={{
        backgroundColor: "var(--color-teal)",
        borderColor: "rgba(255,255,255,0.15)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 text-sm">
        <span className="text-white/70">Viewing:</span>
        <span className="font-semibold text-white">{ctx.label}</span>
        <span className="text-white/40">|</span>
        <Link
          href={ctx.oppositePath}
          className="font-medium underline-offset-2 hover:underline transition-colors"
          style={{ color: "var(--color-gold)" }}
        >
          Switch to {ctx.opposite}
        </Link>
      </div>
    </div>
  );
}
