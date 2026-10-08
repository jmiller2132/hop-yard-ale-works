import Link from "next/link";
import Image from "next/image";
import { sanityClient } from "@/lib/sanity/client";
import { locationsQuery, taproomPhotosQuery, activeSeasonalThemeQuery } from "@/lib/sanity/queries";
import { isLateNight } from "@/lib/hours";
import { LOCATIONS, hoursSummaryText, locationForBadge } from "@/lib/location-data";
import { organizationJsonLd } from "@/lib/structured-data";
import { jsonLdString } from "@/lib/site";
import OpenClosedBadgeLive from "@/components/ui/OpenClosedBadgeLive";
import QuoteBanner from "@/components/ui/QuoteBanner";
import TaproomPhotoGrid from "@/components/ui/TaproomPhotoGrid";
import type { Metadata } from "next";
import type { Location, TaproomPhoto, SeasonalTheme } from "@/types";

export const revalidate = 900;

// Field colors sampled from can photos. Engine Co. was not in those photos.
// Grounds for the homepage sections, not beer labels.
const SECTION = {
  brewed: { bg: "#E36B2C", fg: "#231F20" },
  pizza: { bg: "#E2A21A", fg: "#231F20" },
  company: { bg: "#2F6B32", fg: "#F5F2EE" },
  findUs: { bg: "#6E342C", fg: "#F5F2EE" },
  social: { bg: "#8C2F2A", fg: "#F5F2EE" },
} as const;

export const metadata: Metadata = {
  title: {
    absolute: "Hop Yard Ale Works | Craft Brewery & Wood-Fired Pizza in Appleton & Menomonee Falls, WI",
  },
  description:
    "Two Wisconsin taprooms — Appleton and Menomonee Falls — brewing craft beer and serving wood-fired pizza. See hours, menus, and order online.",
};

export default async function HomePage() {
  const [locations, photos, activeTheme] = await Promise.all([
    sanityClient.fetch<Location[]>(locationsQuery).catch(() => [] as Location[]),
    sanityClient.fetch<TaproomPhoto[]>(taproomPhotosQuery).catch(() => [] as TaproomPhoto[]),
    sanityClient.fetch<SeasonalTheme | null>(activeSeasonalThemeQuery).catch(() => null),
  ]);

  const appleton = locationForBadge(
    "appleton",
    locations.find((l) => l.slug?.current === "appleton")
  );
  const theFalls = locationForBadge(
    "the-falls",
    locations.find((l) => l.slug?.current === "the-falls")
  );

  const appletonOrderUrl = appleton.orderOnlineUrl;
  const fallsOrderUrl = theFalls.orderOnlineUrl;

  const lateNight = isLateNight();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(organizationJsonLd()) }}
      />

      {/* Hero — temporary look pass. Can type and a finished photo set are shelved. */}
      <section
        className="relative flex min-h-[92vh] items-end overflow-hidden"
        style={{ backgroundColor: "var(--color-ink)" }}
        aria-label="Hero"
      >
        <Image
          src="/look/taproom.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 42%, rgba(0,0,0,0.25) 100%)" }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-28 pb-10 text-white sm:px-6 sm:pb-14">
          {activeTheme?.badgeText && (
            <div className="mb-5 inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
            >
              {activeTheme.badgeText}
            </div>
          )}
          <img
            src="/look/stamp-white.svg"
            alt="Hop Yard Ale Works"
            width={112}
            height={112}
            className="h-24 w-24 sm:h-28 sm:w-28"
          />
          <h1
            className="mt-6 max-w-4xl font-display text-5xl uppercase leading-[0.88] tracking-tight sm:text-7xl lg:text-8xl"
            style={{ color: "var(--color-warm-white)" }}
          >
            Great Beer.
            <br />
            Great Pizza.
            <br />
            Great Company.
          </h1>
          <p className="mt-5 text-sm uppercase tracking-[0.18em] text-white/75">
            Two Wisconsin taprooms. One community.
          </p>

          {lateNight && (
            <p className="mt-3 text-sm italic text-white/60">
              You&rsquo;re up late. So is the dough.
            </p>
          )}

          <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-6 text-left items-stretch">
            <LocationHeroCard
              name="Appleton"
              tagline="The original taproom & brewhouse."
              locationHours={appleton}
              href="/appleton/"
              orderHref={appletonOrderUrl}
            />
            <LocationHeroCard
              name="Menomonee Falls"
              tagline="Craft beer and wood-fired pizza in the heart of the Falls."
              locationHours={theFalls}
              href="/the-falls/"
              orderHref={fallsOrderUrl}
            />
          </div>
        </div>
      </section>

      {/* Color fields are the sections. Copy is the existing homepage text. */}
      <section aria-label="About">
        <div
          className="px-6 py-16 sm:px-10 sm:py-24"
          style={{ backgroundColor: SECTION.brewed.bg, color: SECTION.brewed.fg }}
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-4xl uppercase leading-[0.9] sm:text-6xl">
              Brewed Here
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
              Every beer on tap is brewed in-house at our Appleton brewhouse and served at both locations. Rotating taps, seasonal releases, and a few you&rsquo;ll keep coming back for.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[320px] lg:min-h-[520px]">
            <Image
              src="/look/pizza.png"
              alt="Wood-fired pizzas and a pint on a table in the taproom"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div
            className="flex flex-col justify-center px-6 py-16 sm:px-10 sm:py-24"
            style={{ backgroundColor: SECTION.pizza.bg, color: SECTION.pizza.fg }}
          >
            <h2 className="font-display text-4xl uppercase leading-[0.9] sm:text-6xl">
              Wood-Fired Pizza
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
              Wood-fired every order, with specialty pies and a build-your-own option for when you already know what you want.
            </p>
          </div>
        </div>

        <div
          className="px-6 py-16 sm:px-10 sm:py-24"
          style={{ backgroundColor: SECTION.company.bg, color: SECTION.company.fg }}
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-4xl uppercase leading-[0.9] sm:text-6xl">
              Good Company
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
              A neighborhood taproom first. We&rsquo;re here to make everyone comfortable — whether you&rsquo;re a craft beer regular or just figuring out what a hazy IPA is.
            </p>
          </div>
        </div>
      </section>

      <QuoteBanner />

      <div className="relative h-56 sm:h-80">
        <Image
          src="/look/mural.png"
          alt="Painted Hop Yard Ale Works wall"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Location cards */}
      <section
        className="section-padding"
        style={{ backgroundColor: SECTION.findUs.bg }}
        aria-label="Locations"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2
            className="mb-8 font-display text-4xl uppercase leading-[0.9] sm:text-6xl"
            style={{ color: SECTION.findUs.fg }}
          >
            Find Us
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <LocationCard
              name="Appleton"
              address="512 W Northland Ave, Appleton WI"
              hoursNote={hoursSummaryText("appleton")}
              locationHours={appleton}
              foodHref={LOCATIONS.appleton.paths.food}
              drinksHref={LOCATIONS.appleton.paths.drinks}
              orderHref={appletonOrderUrl}
              locationHref={LOCATIONS.appleton.paths.home}
              mapsHref={LOCATIONS.appleton.googleMapsUrl}
            />
            <LocationCard
              name="Menomonee Falls"
              address="N88W16521 Main St, Menomonee Falls WI"
              hoursNote={hoursSummaryText("the-falls")}
              locationHours={theFalls}
              foodHref={LOCATIONS["the-falls"].paths.food}
              drinksHref={LOCATIONS["the-falls"].paths.drinks}
              orderHref={fallsOrderUrl}
              locationHref={LOCATIONS["the-falls"].paths.home}
              mapsHref={LOCATIONS["the-falls"].googleMapsUrl}
            />
          </div>
        </div>
      </section>

      {/* From the Taproom photo grid — only renders when photos exist in Sanity */}
      {photos.length > 0 && (
        <section className="section-padding" aria-label="From the taproom">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-baseline justify-between mb-6">
              <h2
                className="font-display text-2xl sm:text-3xl"
                style={{ color: "var(--color-ink)" }}
              >
                From the Taproom
              </h2>
              {photos.length > 8 && (
                <Link
                  href="/photos/"
                  className="text-sm font-medium hover:underline underline-offset-2"
                  style={{ color: "var(--color-green-text)" }}
                >
                  View all →
                </Link>
              )}
            </div>
            <TaproomPhotoGrid photos={photos} limit={8} />
          </div>
        </section>
      )}

      <div className="relative h-64 sm:h-[28rem]" style={{ backgroundColor: "#1c1c1c" }}>
        <Image
          src="/look/cans.png"
          alt="Driving Miss Haisy, Flight of the Nectaron, and Running Teeth First"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Temporary stand-in until the shot list is photographed */}
      <section aria-label="Taproom photos">
        <div className="grid sm:grid-cols-3">
          <PhotoTile src="/look/moss-sign.png" alt="Hop Yard letters on a wood-slat wall" />
          <PhotoTile src="/look/dining.png" alt="A full table in the taproom" />
          <PhotoTile src="/look/pallet-sign.png" alt="Wooden Hop Yard Ale Works sign" />
        </div>
      </section>

      {/* Social nudge */}
      <section
        className="section-padding"
        style={{ backgroundColor: SECTION.social.bg, color: SECTION.social.fg }}
        aria-label="Follow us"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <h2 className="font-display text-4xl uppercase leading-[0.9] sm:text-6xl">
              Show Us Your Night
            </h2>
            <p className="mt-3 max-w-lg text-sm text-white/80">
              The first slice, the birthday round, the crew that finally made it out —
              tag{" "}
              <span className="font-semibold text-white">#HopYardAleWorks</span>{" "}
              and we&rsquo;ll find it.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a
                href="https://www.instagram.com/hopyardaleworks/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold min-h-[44px]"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
              <a
                href="https://www.facebook.com/hopyardaleworks/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold min-h-[44px]"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
              {/* TODO: swap to a dedicated photos@ address when created */}
              <a
                href="mailto:hopyardaleworks@gmail.com?subject=Taproom Photo"
                className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold min-h-[44px]"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                Send Us a Photo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section className="section-padding" aria-label="Next steps">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <NextStepCard
              title="See the Menus"
              description="Food, drinks, and everything in between. Updated regularly."
              links={[{ label: "View Menus", href: "/appleton-food-menu/" }]}
            />
            <NextStepCard
              title="Upcoming Events"
              description="What's coming up at both locations."
              links={[{ label: "See Events", href: "/events/" }]}
            />
            <NextStepCard
              title="Order Online"
              description="Pick up or delivery through Toast. Ready when you are."
              links={[
                { label: "Order — Appleton", href: appletonOrderUrl, external: true },
                { label: "Order — Menomonee Falls", href: fallsOrderUrl, external: true },
              ]}
              highlight
            />
          </div>
        </div>
      </section>
    </>
  );
}

function LocationHeroCard({
  name,
  tagline,
  locationHours,
  href,
  orderHref,
}: {
  name: string;
  tagline: string;
  locationHours: { hours?: import("@/types").DayHours[]; sundayHours?: { open: string; close: string; isClosed: boolean }; holidayOverrides?: import("@/types").HolidayOverride[] } | null;
  href: string;
  orderHref: string;
}) {
  return (
    <div
      className="flex h-full flex-col p-6"
      style={{
        backgroundColor: "rgba(20,16,14,0.72)",
        border: "1px solid rgba(255,255,255,0.28)",
      }}
    >
      <h2 className="font-display text-xl text-white">{name}</h2>
      <p className="mt-1 text-sm text-white/75">{tagline}</p>
      {locationHours?.hours && (
        <div className="mt-3">
          <OpenClosedBadgeLive location={locationHours} />
        </div>
      )}
      <div className="mt-auto pt-4 flex flex-wrap gap-2">
        <Link
          href={href}
          className="rounded-md px-4 py-2 text-sm font-semibold text-white min-h-[44px] flex items-center"
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          Visit
        </Link>
        <Link
          href={orderHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md px-4 py-2 text-sm font-semibold min-h-[44px] flex items-center"
          style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
        >
          Order Online
        </Link>
      </div>
    </div>
  );
}

function LocationCard({
  name,
  address,
  hoursNote,
  locationHours,
  foodHref,
  drinksHref,
  orderHref,
  locationHref,
  mapsHref,
}: {
  name: string;
  address: string;
  hoursNote: string;
  locationHours: { hours?: import("@/types").DayHours[]; sundayHours?: { open: string; close: string; isClosed: boolean }; holidayOverrides?: import("@/types").HolidayOverride[] } | null;
  foodHref: string;
  drinksHref: string;
  orderHref: string;
  locationHref: string;
  mapsHref: string;
}) {
  return (
    <div
      className="p-6"
      style={{ border: "1px solid rgba(35,31,32,0.18)", backgroundColor: "white" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
      <h3
        className="font-display text-xl"
        style={{ color: "var(--color-ink)" }}
      >
            {name}
          </h3>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
            {address}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--color-ink)" }}>
            {hoursNote}
          </p>
        </div>
        <Link
          href={locationHref}
          className="flex-shrink-0 text-xs font-medium underline underline-offset-2 mt-1"
          style={{ color: "var(--color-teal)" }}
        >
          Details
        </Link>
      </div>

      {locationHours?.hours && (
        <div className="mt-3">
          <OpenClosedBadgeLive location={locationHours} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={foodHref}
          className="rounded-md border px-3 py-2 text-sm font-medium min-h-[44px] flex items-center hover:bg-gray-50 transition-colors"
          style={{ borderColor: "var(--color-teal)", color: "var(--color-teal)" }}
        >
          Food
        </Link>
        <Link
          href={drinksHref}
          className="rounded-md border px-3 py-2 text-sm font-medium min-h-[44px] flex items-center hover:bg-gray-50 transition-colors"
          style={{ borderColor: "var(--color-teal)", color: "var(--color-teal)" }}
        >
          Drinks
        </Link>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border px-3 py-2 text-sm font-medium min-h-[44px] flex items-center hover:bg-gray-50 transition-colors"
          style={{ borderColor: "rgba(0,0,0,0.15)", color: "var(--color-muted)" }}
        >
          Directions
        </a>
        <Link
          href={orderHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md px-3 py-2 text-sm font-semibold text-white min-h-[44px] flex items-center hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--color-seasonal-cta)" }}
        >
          Order Online
        </Link>
      </div>
    </div>
  );
}

function PhotoTile({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-72 sm:h-96">
      <Image src={src} alt={alt} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
    </div>
  );
}

function NextStepCard({
  title,
  description,
  links,
  highlight = false,
}: {
  title: string;
  description: string;
  links: { label: string; href: string; external?: boolean }[];
  highlight?: boolean;
}) {
  return (
    <div
      className="p-6"
      style={{
        backgroundColor: highlight ? "var(--color-ink)" : "white",
        color: highlight ? "var(--color-warm-white)" : "var(--color-ink)",
        border: highlight ? "none" : "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <h3 className="font-display text-lg">{title}</h3>
      <p className="mt-2 text-sm opacity-80">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-flex min-h-[44px] items-center rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
