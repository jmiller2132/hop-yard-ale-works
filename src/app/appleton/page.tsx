import type { Metadata } from "next";
import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { locationBySlugQuery } from "@/lib/sanity/queries";
import { computeOpenClosed, isSunday } from "@/lib/hours";
import { LOCATION_STATIC_DATA } from "@/lib/location-data";
import OpenClosedBadge from "@/components/ui/OpenClosedBadge";
import HoursTable from "@/components/ui/HoursTable";
import WeatherNudge from "@/components/ui/WeatherNudge";
import { EmployeePickSection } from "@/components/ui/EmployeePickCard";
import type { Location } from "@/types";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Appleton — Hop Yard Ale Works",
  description:
    "Visit Hop Yard Ale Works in Appleton, WI. The original taproom — craft beer, wood-fired pizza, and great company at 512 W Northland Ave.",
};

const APPLETON_HOURS_ROWS = [
  { day: "Sunday",    hours: "12–6 PM" },
  { day: "Monday",    hours: "Closed",  closed: true },
  { day: "Tuesday",   hours: "Closed",  closed: true },
  { day: "Wednesday", hours: "11 AM–10 PM" },
  { day: "Thursday",  hours: "11 AM–10 PM" },
  { day: "Friday",    hours: "11 AM–10 PM" },
  { day: "Saturday",  hours: "11 AM–10 PM" },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "BreweryOrWinery",
  name: "Hop Yard Ale Works — Appleton",
  url: "https://www.hopyardaleworks.com/appleton/",
  address: {
    "@type": "PostalAddress",
    streetAddress: "512 W Northland Ave",
    addressLocality: "Appleton",
    addressRegion: "WI",
    postalCode: "54911",
    addressCountry: "US",
  },
  hasMap: "https://maps.app.goo.gl/9N2389HKdPiMQgzL7",
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday",    opens: "12:00", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Wednesday", opens: "11:00", closes: "22:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday",  opens: "11:00", closes: "22:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday",    opens: "11:00", closes: "22:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday",  opens: "11:00", closes: "22:00" },
  ],
  servesCuisine: ["Craft Beer", "Pizza"],
  priceRange: "$$",
};

export default async function AppletonPage() {
  const cms = await sanityClient
    .fetch<Location | null>(locationBySlugQuery, { slug: "appleton" })
    .catch(() => null);

  const location = cms ?? (LOCATION_STATIC_DATA["appleton"] as Location);
  const status = location?.hours ? computeOpenClosed(location) : null;
  const sunday = isSunday();

  const orderUrl =
    location?.orderOnlineUrl ??
    LOCATION_STATIC_DATA["appleton"].orderOnlineUrl!;

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
        aria-label="Appleton location"
      >
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6">
          <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">
            Appleton
          </h1>
          <p className="mt-2 text-white/80 text-lg">The original taproom.</p>

          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {status && <OpenClosedBadge status={status} />}
            {sunday && (
              <span
                className="text-sm font-medium px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "var(--color-green)", color: "white" }}
              >
                Live music tonight
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/appleton-food-menu/"
              className="rounded-md px-4 py-2.5 text-sm font-semibold text-white min-h-[44px] flex items-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              Food Menu
            </Link>
            <Link
              href="/appleton-drinks-menu/"
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
              <HoursTable rows={APPLETON_HOURS_ROWS} />
              <p className="mt-3 text-xs" style={{ color: "var(--color-muted)" }}>
                Kitchen closes 30 min before close. Hours subject to change on holidays.
              </p>
              <WeatherNudge locationSlug="appleton" drinksHref="/appleton-drinks-menu/" />
            </div>

            {/* Find Us */}
            <div>
              <h2 className="font-heading text-xl font-bold mb-4" style={{ color: "var(--color-ink)" }}>
                Find Us
              </h2>
              <address className="not-italic text-sm leading-relaxed" style={{ color: "var(--color-ink)" }}>
                512 W Northland Ave<br />
                Appleton, WI 54911
              </address>
              <p className="mt-4">
                <a
                  href="https://maps.app.goo.gl/9N2389HKdPiMQgzL7"
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
            <div className="lg:col-span-1 sm:col-span-2 lg:col-auto">
              <h2 className="font-heading text-xl font-bold mb-4" style={{ color: "var(--color-ink)" }}>
                What to Expect
              </h2>
              <div className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--color-ink)" }}>
                <p>
                  A neighborhood taproom with a working brewhouse in the back. All the beer
                  served at both locations is brewed here. Come to drink it fresh.
                </p>
                <p>
                  Wood-fired pizza, a full tap list that rotates regularly, and live music
                  most Sundays. Good for a quick pint or a full evening out.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <EmployeePickSection locationSlug="appleton" />

      {/* Quick links */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/appleton-food-menu/"
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
              href="/appleton-drinks-menu/"
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
