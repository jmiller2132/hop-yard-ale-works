import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { locationBySlugQuery, liveMusicTodayQuery } from "@/lib/sanity/queries";
import { LOCATIONS, addressLines, hoursRows, locationForBadge } from "@/lib/location-data";
import { locationJsonLd } from "@/lib/structured-data";
import { jsonLdString } from "@/lib/site";
import OpenClosedBadgeLive from "@/components/ui/OpenClosedBadgeLive";
import HoursTable from "@/components/ui/HoursTable";
import WeatherNudge from "@/components/ui/WeatherNudge";
import { EmployeePickSection } from "@/components/ui/EmployeePickCard";
import type { Location } from "@/types";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Appleton Brewery & Wood-Fired Pizza Taproom",
  description:
    "Craft beer brewed on site and wood-fired pizza at 512 W Northland Ave, Appleton, WI. Hours, menus, directions, and online ordering.",
};

const INFO = LOCATIONS.appleton;

export default async function AppletonPage() {
  const cms = await sanityClient
    .fetch<Location | null>(locationBySlugQuery, { slug: "appleton" })
    .catch(() => null);

  const location = locationForBadge("appleton", cms);

  const todayChicago = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(
    new Date()
  );

  const liveMusicCount = await sanityClient
    .fetch<number>(liveMusicTodayQuery, { today: todayChicago, locationSlug: "appleton" })
    .catch(() => 0);

  const hasLiveMusicToday = liveMusicCount > 0;

  const orderUrl = location.orderOnlineUrl;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(locationJsonLd("appleton")) }}
      />

      {/* Hero */}
      <section
        className="lg:grid lg:min-h-[70vh] lg:grid-cols-2"
        style={{ backgroundColor: "var(--color-ink)" }}
        aria-label="Appleton location"
      >
        <div className="flex flex-col justify-end px-4 pb-8 pt-8 sm:px-6 sm:pt-16 lg:px-10 lg:pb-16 lg:pt-28">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">
            Hop Yard Ale Works
          </p>
          <h1 className="font-display text-5xl sm:text-7xl uppercase leading-[0.9] text-white">
            Appleton
          </h1>
          <p className="mt-2 text-white/80 text-lg">The original taproom.</p>

          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <OpenClosedBadgeLive location={location} />
            {hasLiveMusicToday && (
              <span
                className="text-sm font-medium px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "var(--color-green-strong)", color: "white" }}
              >
                Live Music Today
              </span>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/appleton-food-menu/"
              className="rounded-md px-5 py-3 text-sm font-bold min-h-[48px] flex items-center gap-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "white", color: "var(--color-ink)" }}
            >
              Food Menu
            </Link>
            <Link
              href="/appleton-drinks-menu/"
              className="rounded-md px-5 py-3 text-sm font-bold min-h-[48px] flex items-center gap-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "white", color: "var(--color-ink)" }}
            >
              Drinks Menu
            </Link>
            <Link
              href={orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-5 py-3 text-sm font-bold min-h-[48px] flex items-center gap-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--color-green-strong)", color: "white" }}
            >
              Order Online
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-full">
          <Image
            src="/look/appleton-exterior.jpg"
            alt="Hop Yard Ale Works building exterior in Appleton with the rustic wood sign"
            fill
            priority
            quality={90}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-center"
          />
        </div>
      </section>

      <div className="relative w-full overflow-hidden" style={{ height: "clamp(160px, 32vw, 560px)" }}>
        <Image
          src="/look/appleton-bar-interior.jpg"
          alt="Bar interior at Hop Yard Ale Works Appleton — chalkboard beer glass art, barrel, and logo mat"
          fill
          sizes="100vw"
          quality={88}
          className="object-cover object-center"
        />
      </div>

      {/* Hours + Address */}
      <section id="hours" className="section-padding scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">

            {/* Hours */}
            <div>
              <h2 className="font-heading text-xl font-bold mb-4" style={{ color: "var(--color-ink)" }}>
                Hours
              </h2>
              <HoursTable rows={hoursRows("appleton")} />
              <p className="mt-3 text-base leading-relaxed sm:text-sm" style={{ color: "var(--color-muted)" }}>
                {INFO.kitchenNote} Hours subject to change on holidays.
              </p>
              <WeatherNudge locationSlug="appleton" drinksHref="/appleton-drinks-menu/" />
            </div>

            {/* Find Us */}
            <div>
              <h2 className="font-heading text-xl font-bold mb-4" style={{ color: "var(--color-ink)" }}>
                Find Us
              </h2>
              <address className="not-italic text-base leading-relaxed sm:text-sm" style={{ color: "var(--color-ink)" }}>
                {addressLines("appleton")[0]}<br />
                {addressLines("appleton")[1]}
              </address>
              <p className="mt-4">
                <a
                  href={INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold min-h-[44px]"
                  style={{ backgroundColor: "var(--color-green-strong)", color: "white" }}
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
              <div className="space-y-2 text-base leading-relaxed sm:text-sm" style={{ color: "var(--color-ink)" }}>
                <p>
                  A neighborhood taproom with a working brewhouse in the back. All the beer
                  served at both locations is brewed here. Come to drink it fresh.
                </p>
                <p>
                  Wood-fired pizza, a full tap list that rotates regularly, and live music
                  most Sundays outside of football season. Good for a quick pint or a full
                  evening out.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <EmployeePickSection locationSlug="appleton" />

      {/* Photo grid — all landscape 4:3, consistent height */}
      <section aria-label="Appleton photos" style={{ backgroundColor: "#1c1c1c" }}>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {[
            { src: "/look/appleton-taps-wide.jpg", alt: "Hop Yard tap handles at the Appleton bar", pos: "center" },
            { src: "/look/appleton-patio-orange.jpg", alt: "Sunny outdoor patio with orange umbrellas at Hop Yard Ale Works Appleton", pos: "center" },
            { src: "/look/appleton-bar-overview.jpg", alt: "Full bar at Hop Yard Ale Works Appleton with the hop mascot on the wall", pos: "center" },
            { src: "/look/appleton-mural.jpg", alt: "Hop Yard Ale Works mural on the Appleton building exterior", pos: "top" },
          ].map(({ src, alt, pos }) => (
            <div key={src} className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                quality={85}
                className={`object-cover object-${pos}`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/appleton-food-menu/"
              className="flex flex-col p-6 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#E2A21A", color: "#231F20" }}
            >
              <span className="font-display text-3xl uppercase leading-[0.9]">Food Menu</span>
              <span className="mt-2 text-sm">Specialty pies, BYO, dessert →</span>
            </Link>
            <Link
              href="/appleton-drinks-menu/"
              className="flex flex-col p-6 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2F6B32", color: "#F5F2EE" }}
            >
              <span className="font-display text-3xl uppercase leading-[0.9]">Drinks Menu</span>
              <span className="mt-2 text-sm">On tap, wine, ciders, NA →</span>
            </Link>
            <Link
              href="/events/"
              className="flex flex-col p-6 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#E36B2C", color: "#231F20" }}
            >
              <span className="font-display text-3xl uppercase leading-[0.9]">Events</span>
              <span className="mt-2 text-sm">Live music, tap releases →</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
