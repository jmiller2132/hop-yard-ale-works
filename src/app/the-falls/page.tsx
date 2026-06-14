import type { Metadata } from "next";
import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { locationBySlugQuery } from "@/lib/sanity/queries";
import { computeOpenClosed } from "@/lib/hours";
import { LOCATION_STATIC_DATA } from "@/lib/location-data";
import OpenClosedBadge from "@/components/ui/OpenClosedBadge";
import HoursTable from "@/components/ui/HoursTable";
import WeatherNudge from "@/components/ui/WeatherNudge";
import { EmployeePickSection } from "@/components/ui/EmployeePickCard";
import type { Location } from "@/types";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Menomonee Falls — Hop Yard Ale Works",
  description:
    "Visit Hop Yard Ale Works in Menomonee Falls, WI. Craft beer and wood-fired pizza at N88W16521 Main St. Tue–Thu evenings, Fri–Sat all day.",
};

const FALLS_HOURS_ROWS = [
  { day: "Sunday",    hours: "Closed",    closed: true },
  { day: "Monday",    hours: "Closed",    closed: true },
  { day: "Tuesday",   hours: "4–10 PM" },
  { day: "Wednesday", hours: "4–10 PM" },
  { day: "Thursday",  hours: "4–10 PM" },
  { day: "Friday",    hours: "11 AM–10 PM" },
  { day: "Saturday",  hours: "11 AM–10 PM" },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "BreweryOrWinery",
  name: "Hop Yard Ale Works — Menomonee Falls",
  url: "https://www.hopyardaleworks.com/the-falls/",
  address: {
    "@type": "PostalAddress",
    streetAddress: "N88W16521 Main St",
    addressLocality: "Menomonee Falls",
    addressRegion: "WI",
    postalCode: "53051",
    addressCountry: "US",
  },
  hasMap: "https://maps.app.goo.gl/DWFo5Du6CZfUqkt7A",
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Tuesday",   opens: "16:00", closes: "22:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Wednesday", opens: "16:00", closes: "22:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday",  opens: "16:00", closes: "22:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday",    opens: "11:00", closes: "22:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday",  opens: "11:00", closes: "22:00" },
  ],
  servesCuisine: ["Craft Beer", "Pizza"],
  priceRange: "$$",
};

export default async function TheFallsPage() {
  const cms = await sanityClient
    .fetch<Location | null>(locationBySlugQuery, { slug: "the-falls" })
    .catch(() => null);

  const location = cms ?? (LOCATION_STATIC_DATA["the-falls"] as Location);
  const status = location?.hours ? computeOpenClosed(location) : null;

  const orderUrl =
    location?.orderOnlineUrl ??
    LOCATION_STATIC_DATA["the-falls"].orderOnlineUrl!;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* Hero */}
      <section
        className="relative flex min-h-[50vh] items-end pb-10 pt-24 sm:min-h-[55vh]"
        style={{ backgroundColor: "var(--color-ink)" }}
        aria-label="Menomonee Falls location"
      >
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6">
          <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">
            Menomonee Falls
          </h1>
          <p className="mt-2 text-white/80 text-lg">
            Pizza-forward taproom. New to craft beer? We&rsquo;ll help.
          </p>

          {status && (
            <div className="mt-3">
              <OpenClosedBadge status={status} />
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/the-falls-food-menu/"
              className="rounded-md px-4 py-2.5 text-sm font-semibold text-white min-h-[44px] flex items-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              Food Menu
            </Link>
            <Link
              href="/the-falls-drinks-menu/"
              className="rounded-md px-4 py-2.5 text-sm font-semibold text-white min-h-[44px] flex items-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              Drinks Menu
            </Link>
            <Link
              href={orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-4 py-2.5 text-sm font-semibold min-h-[44px] flex items-center"
              style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
            >
              Order Online
            </Link>
          </div>
        </div>
      </section>

      {/* Hours + Address */}
      <section className="section-padding">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">

            {/* Hours */}
            <div>
              <h2 className="font-heading text-xl font-bold mb-4" style={{ color: "var(--color-ink)" }}>
                Hours
              </h2>
              <HoursTable rows={FALLS_HOURS_ROWS} />
              <p className="mt-3 text-xs" style={{ color: "var(--color-muted)" }}>
                Kitchen closes 30 min before close. Hours subject to change on holidays.
              </p>
              <WeatherNudge drinksHref="/the-falls-drinks-menu/" />
            </div>

            {/* Find Us */}
            <div>
              <h2 className="font-heading text-xl font-bold mb-4" style={{ color: "var(--color-ink)" }}>
                Find Us
              </h2>
              <address className="not-italic text-sm leading-relaxed" style={{ color: "var(--color-ink)" }}>
                N88W16521 Main St<br />
                Menomonee Falls, WI 53051
              </address>
              <p className="mt-4">
                <a
                  href="https://maps.app.goo.gl/DWFo5Du6CZfUqkt7A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold min-h-[44px]"
                  style={{ backgroundColor: "var(--color-green)", color: "white" }}
                >
                  Get directions
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              </p>
            </div>

            {/* What to expect */}
            <div className="sm:col-span-2 lg:col-auto">
              <h2 className="font-heading text-xl font-bold mb-4" style={{ color: "var(--color-ink)" }}>
                What to Expect
              </h2>
              <div className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--color-ink)" }}>
                <p>
                  A relaxed taproom in the heart of Menomonee Falls. Come for a pint and
                  some wood-fired pizza — evenings during the week, all day on weekends.
                </p>
                <p>
                  New to craft beer? The bar is happy to walk you through what&rsquo;s on.
                  No wrong answers.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <EmployeePickSection locationSlug="the-falls" />

      {/* Private Events */}
      <section
        className="section-padding"
        style={{ backgroundColor: "var(--color-ink)", color: "white" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <p className="font-heading text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-green)" }}>
                Private Events
              </p>
              <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
                Host Your Event at The Falls
              </h2>
              <p className="mt-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                The Falls has space for private gatherings — full bar service, wood-fired
                pizza, and a great atmosphere. Available any day we&rsquo;re open, with a
                contract required to reserve.
              </p>
              <ul className="mt-5 space-y-2">
                {["Up to 80 guests", "Full bar service included", "Pizza menu available", "Any day we're open"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                    <span style={{ color: "var(--color-green)" }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/contact/?subject=private-event&location=the-falls"
                  className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold min-h-[44px] transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--color-green)", color: "white" }}
                >
                  Get in Touch
                </Link>
              </div>
            </div>
            <div
              className="rounded-xl p-8 text-center"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <p className="text-lg font-heading font-semibold text-white">
                Interested in hosting?
              </p>
              <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                Email us at{" "}
                <a
                  href="mailto:hopyardthefalls@gmail.com"
                  className="underline underline-offset-2 hover:opacity-70 transition-opacity text-white"
                >
                  hopyardthefalls@gmail.com
                </a>
                {" "}or use the contact form.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/the-falls-food-menu/"
              className="group rounded-xl p-6 flex flex-col hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.07)" }}
            >
              <span className="text-2xl mb-2" aria-hidden="true">🍕</span>
              <span className="font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
                Food Menu
              </span>
              <span className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                Specialty pies, BYO, dessert →
              </span>
            </Link>
            <Link
              href="/the-falls-drinks-menu/"
              className="group rounded-xl p-6 flex flex-col hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.07)" }}
            >
              <span className="text-2xl mb-2" aria-hidden="true">🍺</span>
              <span className="font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
                Drinks Menu
              </span>
              <span className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                On tap, wine, ciders, NA →
              </span>
            </Link>
            <Link
              href="/events/"
              className="group rounded-xl p-6 flex flex-col hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.07)" }}
            >
              <span className="text-2xl mb-2" aria-hidden="true">📅</span>
              <span className="font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
                Events
              </span>
              <span className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                Live music, tap releases →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
