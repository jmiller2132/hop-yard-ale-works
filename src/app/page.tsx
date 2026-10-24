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
import HeroParallaxImage from "@/components/ui/HeroParallaxImage";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import ScrollPizzaSpin from "@/components/ui/ScrollPizzaSpin";
import ScrollBeerFill from "@/components/ui/ScrollBeerFill";
import WordReveal from "@/components/ui/WordReveal";
import TiltCard from "@/components/ui/TiltCard";
import FloatingBubbles from "@/components/ui/FloatingBubbles";
import ShareNightButtons from "@/components/ui/ShareNightButtons";
import type { Metadata } from "next";
import type { Location, TaproomPhoto, SeasonalTheme } from "@/types";

export const revalidate = 900;

// Homepage section grounds — all values are brand palette tokens.
// brewed  → moss (deep moss green)
// pizza   → pine (weathered wood plank — fits the wood-fired theme)
// company → taproom-orange (one use of the accent; keep as the single orange hit on this page)
// findUs  → badge-spruce (deep teal-near-black)
// social  → cinder (building exterior dark)
const SECTION = {
  brewed:  { bg: "#4c6b2f", fg: "#ede8df" },
  pizza:   { bg: "#d6af7a", fg: "#1c1c1c" },
  company: { bg: "#e9562b", fg: "#1c1c1c" },
  findUs:  { bg: "#1a393c", fg: "#ede8df" },
  social:  { bg: "#3b3e44", fg: "#ede8df" },
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

      <section
        className="relative flex items-start overflow-hidden md:min-h-[75vh] md:items-end"
        style={{ backgroundColor: "var(--color-ink)" }}
        aria-label="Hero"
      >
        <HeroParallaxImage />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 42%, rgba(0,0,0,0.25) 100%)" }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-8 pb-6 text-white sm:px-6 sm:pt-28 sm:pb-14">
          {activeTheme?.badgeText && (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
            >
              {activeTheme.badgeText}
            </div>
          )}
          <img
            src="/look/stamp-white.png"
            alt="Hop Yard Ale Works"
            width={112}
            height={112}
            className="h-16 w-16 sm:h-28 sm:w-28"
          />
          <h1
            className="mt-4 max-w-4xl font-display text-5xl uppercase leading-[0.95] sm:mt-6 sm:text-7xl sm:leading-[0.88] sm:tracking-tight lg:text-8xl"
            style={{ color: "var(--color-warm-white)" }}
          >
            Great Beer.
            <br />
            Great Pizza.
            <br />
            Great Company.
          </h1>
          <p className="mt-4 text-base text-white/85 sm:mt-5 sm:text-sm sm:uppercase sm:tracking-[0.18em] sm:text-white/75">
            Two Wisconsin taprooms. One community.
          </p>

          {lateNight && (
            <p className="mt-3 text-sm italic text-white/60">
              You&rsquo;re up late. So is the dough.
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-2 text-left items-stretch sm:mt-10 sm:gap-6">
            <LocationHeroCard
              name="Appleton"
              tagline="The original taproom & brewhouse."
              locationHours={appleton}
              href="/appleton/"
              orderHref={appletonOrderUrl}
            />
            <LocationHeroCard
              name="Menomonee Falls"
              mobileName="The Falls"
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
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[320px] lg:min-h-[520px]">
            <Image
              src="/look/appleton-tanks.webp"
              alt="Brewing barrels in the Appleton brewhouse"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[center_75%]"
            />
          </div>
          <div
            className="relative overflow-hidden flex flex-col justify-center px-5 py-12 sm:px-10 sm:py-24"
            style={{ backgroundColor: SECTION.brewed.bg, color: SECTION.brewed.fg }}
          >
            <ScrollBeerFill />
            <WordReveal
              as="h2"
              className="font-display text-5xl uppercase leading-[0.95] sm:text-6xl sm:leading-[0.9]"
            >
              Brewed Here
            </WordReveal>
            <RevealOnScroll delay={220}>
              <p className="mt-4 max-w-xl text-base leading-relaxed">
                Every beer on tap is brewed in-house at our Appleton brewhouse and served at both locations. Rotating taps, seasonal releases, and a few you&rsquo;ll keep coming back for.
              </p>
            </RevealOnScroll>
          </div>
        </div>

        <div className="grid lg:grid-cols-2">
          <div
            className="relative overflow-hidden order-2 flex flex-col justify-center px-5 py-12 sm:px-10 sm:py-24 lg:order-1"
            style={{ backgroundColor: SECTION.pizza.bg, color: SECTION.pizza.fg }}
          >
            <ScrollPizzaSpin />
            <WordReveal
              as="h2"
              className="font-display text-5xl uppercase leading-[0.95] sm:text-6xl sm:leading-[0.9]"
            >
              Wood-Fired Pizza
            </WordReveal>
            <RevealOnScroll delay={280}>
              <p className="mt-4 max-w-xl text-base leading-relaxed">
                Wood-fired every order, with specialty pies and a build-your-own option for when you already know what you want.
              </p>
            </RevealOnScroll>
          </div>
          <div className="relative order-1 min-h-[320px] lg:order-2 lg:min-h-[520px]">
            <Image
              src="/look/appleton-oven-fire.jpg"
              alt="Wood-fired pizza oven with live fire at Hop Yard Ale Works in Appleton"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              quality={90}
              className="object-cover"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[320px] lg:min-h-[520px]">
            <Image
              src="/look/appleton-patio-dog.jpg"
              alt="Friends enjoying an afternoon on the Hop Yard patio"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              quality={90}
              className="object-cover"
            />
          </div>
          <div
            className="relative overflow-hidden flex flex-col justify-center px-5 py-12 sm:px-10 sm:py-24"
            style={{ backgroundColor: SECTION.company.bg, color: SECTION.company.fg }}
          >
            <FloatingBubbles />
            <div className="relative z-10">
              <WordReveal
                as="h2"
                className="font-display text-5xl uppercase leading-[0.95] sm:text-6xl sm:leading-[0.9]"
              >
                Good Company
              </WordReveal>
              <RevealOnScroll delay={210}>
                <p className="mt-4 max-w-xl text-base leading-relaxed">
                  A neighborhood taproom first. We&rsquo;re here to make everyone comfortable — whether you&rsquo;re a craft beer regular or just figuring out what a hazy IPA is.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      <QuoteBanner />

      <section aria-label="Both taprooms" style={{ backgroundColor: "var(--color-ink)" }}>
        <div className="mx-auto grid max-w-6xl gap-2 p-2 sm:grid-cols-2 sm:p-3">
          <Link href="/appleton/" className="group relative block h-72 overflow-hidden sm:h-[26rem]">
            <Image
              src="/look/appleton-exterior.jpg"
              alt=""
              fill
              sizes="(min-width: 640px) 576px, 100vw"
              quality={90}
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/10" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <p className="font-display text-5xl uppercase leading-[0.95] text-white sm:text-6xl sm:leading-[0.9]">Appleton</p>
              <p className="mt-1 text-sm text-white/80">512 W Northland Ave</p>
            </div>
          </Link>
          <Link href="/the-falls/" className="group relative block h-72 overflow-hidden sm:h-[26rem]">
            <Image
              src="/look/falls-exterior.webp"
              alt=""
              fill
              sizes="(min-width: 640px) 576px, 100vw"
              quality={90}
              className="object-cover object-[center_24%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/10" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <p className="font-display text-4xl uppercase leading-[0.95] text-white sm:text-6xl sm:leading-[0.9]">Menomonee Falls</p>
              <p className="mt-1 text-sm text-white/80">N88W16521 Main St</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Location cards */}
      <section
        className="section-padding"
        style={{ backgroundColor: SECTION.findUs.bg }}
        aria-label="Locations"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <WordReveal
            as="h2"
            className="mb-8 font-display text-5xl uppercase leading-[0.95] sm:text-6xl sm:leading-[0.9]"
            style={{ color: SECTION.findUs.fg }}
          >
            Find Us
          </WordReveal>
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

      <div style={{ backgroundColor: "var(--color-ink)" }}>
        <Image
          src="/look/cans-five.jpg"
          alt="Driving Miss Haisy, Flight of the Nectaron, Orange County Hefe, Running Teeth First, and Mossie's"
          width={1200}
          height={800}
          sizes="(min-width: 1024px) 1024px, 100vw"
          quality={90}
          className="mx-auto h-auto w-full max-w-5xl"
        />
        {/* To-go cans callout */}
        <div className="flex items-center justify-center gap-3 px-4 py-5 text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.14em]"
            style={{ backgroundColor: "var(--color-gold)", color: "var(--color-ink)" }}
          >
            🥫 To-Go Cans Available — Take Your Favorites Home
          </span>
        </div>
      </div>

      <section aria-label="Appleton taproom photos" style={{ backgroundColor: "var(--color-ink)" }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-[2px]">
          {[
            { src: "/look/appleton-cheers-wall.jpg", alt: "Cheers neon sign on green moss wall with booth seating at Hop Yard Ale Works Appleton" },
            { src: "/look/appleton-exterior.jpg", alt: "Hop Yard Ale Works building exterior in Appleton" },
            { src: "/look/appleton-mural.jpg", alt: "Large Hop Yard Ale Works mural on the Appleton building" },
            { src: "/look/appleton-bar-overview.jpg", alt: "Full bar at Hop Yard Ale Works Appleton" },
            { src: "/look/appleton-patio-orange.jpg", alt: "Sunny outdoor patio with orange umbrellas at Hop Yard Ale Works Appleton" },
            { src: "/look/appleton-taps-wide.jpg", alt: "Row of Hop Yard tap handles at the Appleton taproom" },
          ].map(({ src, alt }) => (
            <div key={src} className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                quality={85}
                className="object-cover object-center"
              />
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Menomonee Falls taproom photos" style={{ backgroundColor: "var(--color-ink)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[2px]">
          {[
            { src: "/look/falls-wall.webp", alt: "Painted Hop Yard mark and barrels on the Menomonee Falls wall" },
            { src: "/look/falls-taps.webp", alt: "Tap wall in Menomonee Falls, with the hop beard on green tile" },
            { src: "/look/falls-letters.webp", alt: "Lit Hop Yard letters, benches, and barrels in Menomonee Falls" },
          ].map(({ src, alt }) => (
            <div key={src} className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                quality={90}
                className="object-cover object-center"
              />
            </div>
          ))}
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
            <h2 className="font-display text-5xl uppercase leading-[0.95] sm:text-6xl sm:leading-[0.9]">
              Show Us Your Night
            </h2>
            <p className="mt-3 max-w-lg text-base text-white/80">
              The first slice, the birthday round, the crew that finally made it out —
              tag{" "}
              <span className="font-semibold text-white">#HopYardAleWorks</span>{" "}
              and we&rsquo;ll find it.
            </p>
            <ShareNightButtons />
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section className="section-padding" aria-label="Next steps">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <RevealOnScroll>
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
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}

function LocationHeroCard({
  name,
  mobileName,
  tagline,
  locationHours,
  href,
  orderHref,
}: {
  name: string;
  mobileName?: string;
  tagline: string;
  locationHours: { hours?: import("@/types").DayHours[]; sundayHours?: { open: string; close: string; isClosed: boolean }; holidayOverrides?: import("@/types").HolidayOverride[] } | null;
  href: string;
  orderHref: string;
}) {
  return (
    <div
      className="flex h-full flex-col p-3 sm:p-6"
      style={{
        backgroundColor: "rgba(20,16,14,0.72)",
        border: "1px solid rgba(255,255,255,0.28)",
      }}
    >
      <h2 className="font-heading text-base font-bold uppercase tracking-wide text-white sm:text-lg">
        {mobileName ? (
          <>
            <span className="sm:hidden">{mobileName}</span>
            <span className="hidden sm:inline">{name}</span>
          </>
        ) : (
          name
        )}
      </h2>
      <p className="font-tag mt-1 hidden text-sm text-white/75 sm:block">{tagline}</p>
      {locationHours?.hours && (
        <div className="mt-2 sm:mt-3">
          <OpenClosedBadgeLive location={locationHours} />
        </div>
      )}
      <p className="mt-2 hidden text-xs text-white/50 sm:block">🥫 To-go cans available</p>
      <div className="mt-auto flex flex-col gap-2 pt-3 sm:flex-row sm:flex-wrap sm:pt-4">
        <Link
          href={href}
          className="flex min-h-[44px] items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white sm:px-4"
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
          className="flex min-h-[44px] items-center justify-center rounded-md px-3 py-2 text-sm font-semibold sm:px-4"
          style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
        >
          <span className="sm:hidden">Order</span>
          <span className="hidden sm:inline">Order Online</span>
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
  const hoursHref = `${locationHref}#hours`;
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
          <p className="mt-1 text-base sm:text-sm" style={{ color: "var(--color-muted)" }}>
            {address}
          </p>
          {/* Hours summary with link to full hours */}
          <p className="mt-2 text-base sm:text-sm" style={{ color: "var(--color-ink)" }}>
            {hoursNote}
          </p>
          <Link
            href={hoursHref}
            className="mt-0.5 inline-block text-xs font-medium underline underline-offset-2 hover:opacity-70 transition-opacity"
            style={{ color: "var(--color-teal)" }}
          >
            Full hours →
          </Link>
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

      <p className="mt-3 text-xs font-medium" style={{ color: "var(--color-muted)" }}>
        🥫 To-go cans available
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
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
    <TiltCard
      maxTilt={5}
      style={{
        backgroundColor: highlight ? "var(--color-ink)" : "white",
        color: highlight ? "var(--color-warm-white)" : "var(--color-ink)",
        border: highlight ? "none" : "1px solid rgba(0,0,0,0.08)",
      }}
    >
    <div
      className="p-6 h-full"
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
    </TiltCard>
  );
}
