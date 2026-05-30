import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "This page went 86.",
};

export default function NotFound() {
  return (
    <div
      className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center section-padding"
      style={{ color: "var(--color-ink)" }}
    >
      <h1 className="font-heading text-4xl font-bold sm:text-5xl" style={{ color: "var(--color-teal)" }}>
        This page went 86.
      </h1>
      <p className="mt-4 text-lg" style={{ color: "var(--color-muted)" }}>
        But you found us, which counts for something.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md px-5 py-3 text-sm font-semibold text-white min-h-[44px] flex items-center transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-seasonal-cta)" }}
        >
          Home
        </Link>
        <Link
          href="/appleton-food-menu/"
          className="rounded-md border px-5 py-3 text-sm font-medium min-h-[44px] flex items-center transition-colors hover:bg-gray-50"
          style={{ borderColor: "var(--color-teal)", color: "var(--color-teal)" }}
        >
          Food Menu
        </Link>
        <Link
          href="/appleton-drinks-menu/"
          className="rounded-md border px-5 py-3 text-sm font-medium min-h-[44px] flex items-center transition-colors hover:bg-gray-50"
          style={{ borderColor: "var(--color-teal)", color: "var(--color-teal)" }}
        >
          Drinks
        </Link>
      </div>
    </div>
  );
}
