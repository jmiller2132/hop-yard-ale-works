"use client";

import Link from "next/link";

interface StickyOrderBarProps {
  href: string;
  locationName: string;
}

export default function StickyOrderBar({ href, locationName }: StickyOrderBarProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden"
      style={{
        backgroundColor: "var(--color-warm-white)",
        borderTop: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Link
        href={href}
        className="flex w-full items-center justify-center rounded-lg py-3.5 text-base font-semibold text-white min-h-[44px] transition-opacity active:opacity-90"
        style={{ backgroundColor: "var(--color-seasonal-cta)" }}
      >
        Order Online — {locationName}
      </Link>
    </div>
  );
}
