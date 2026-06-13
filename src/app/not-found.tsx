import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "This page went 86.",
  description: "Nothing here — but the food and beer are real. Find your way back.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--color-warm-white)" }}>
      {/* Hero */}
      <section
        className="relative flex flex-1 flex-col items-center justify-center px-4 py-24 text-center overflow-hidden"
        style={{ backgroundColor: "var(--color-ink)", minHeight: "60vh" }}
      >
        {/* Background number */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center font-heading font-bold select-none"
          style={{
            fontSize: "clamp(180px, 35vw, 380px)",
            color: "rgba(255,255,255,0.04)",
            lineHeight: 1,
          }}
        >
          86
        </span>

        <div className="relative z-10 max-w-lg">
          <p
            className="font-heading text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--color-green)" }}
          >
            404
          </p>
          <h1
            className="font-heading text-4xl font-bold sm:text-5xl md:text-6xl text-white"
          >
            This page went 86.
          </h1>
          <p className="mt-5 text-base sm:text-lg" style={{ color: "rgba(255,255,255,0.55)" }}>
            But you found us, which counts for something.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-full px-6 py-3 text-sm font-semibold text-white min-h-[44px] flex items-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--color-green)" }}
            >
              Take me home
            </Link>
            <Link
              href="/appleton-food-menu/"
              className="rounded-full px-6 py-3 text-sm font-medium min-h-[44px] flex items-center transition-colors"
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              Food menu
            </Link>
            <Link
              href="/appleton-drinks-menu/"
              className="rounded-full px-6 py-3 text-sm font-medium min-h-[44px] flex items-center transition-colors"
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              What&apos;s pouring
            </Link>
            <Link
              href="/events/"
              className="rounded-full px-6 py-3 text-sm font-medium min-h-[44px] flex items-center transition-colors"
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              Events
            </Link>
          </div>
        </div>
      </section>

      {/* Quiet bottom section */}
      <section className="px-4 py-16 text-center">
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          If you were looking for something specific,{" "}
          <Link
            href="/contact/"
            className="underline underline-offset-2 hover:opacity-70 transition-opacity"
            style={{ color: "var(--color-ink)" }}
          >
            let us know
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
