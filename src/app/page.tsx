import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { locationsQuery, taproomPhotosQuery, activeSeasonalThemeQuery } from "@/lib/sanity/queries";
import { computeOpenClosed, isLateNight } from "@/lib/hours";
import { LOCATION_STATIC_DATA } from "@/lib/location-data";
import OpenClosedBadge from "@/components/ui/OpenClosedBadge";
import QuoteBanner from "@/components/ui/QuoteBanner";
import TaproomPhotoGrid from "@/components/ui/TaproomPhotoGrid";
import type { Location, TaproomPhoto, SeasonalTheme } from "@/types";

export const revalidate = 900;

export const metadata = {
  title: "Hop Yard Ale Works — Great Beer, Great Pizza, Great Company",
  description:
    "Two Wisconsin taprooms brewing small-batch craft beer and firing up bold pizzas. Find us in Appleton and Menomonee Falls.",
};

export default async function HomePage() {
  const [locations, photos, activeTheme] = await Promise.all([
    sanityClient.fetch<Location[]>(locationsQuery).catch(() => [] as Location[]),
    sanityClient.fetch<TaproomPhoto[]>(taproomPhotosQuery).catch(() => [] as TaproomPhoto[]),
    sanityClient.fetch<SeasonalTheme | null>(activeSeasonalThemeQuery).catch(() => null),
  ]);

  const appletonStatic = LOCATION_STATIC_DATA["appleton"];
  const fallsStatic = LOCATION_STATIC_DATA["the-falls"];

  const appleton =
    locations.find((l) => l.slug?.current === "appleton") ??
    (appletonStatic as Location);
  const theFalls =
    locations.find((l) => l.slug?.current === "the-falls") ??
    (fallsStatic as Location);

  const appletonStatus = appleton?.hours ? computeOpenClosed(appleton) : null;
  const fallsStatus = theFalls?.hours ? computeOpenClosed(theFalls) : null;

  const appletonOrderUrl = appleton?.orderOnlineUrl ?? appletonStatic.orderOnlineUrl!;
  const fallsOrderUrl = theFalls?.orderOnlineUrl ?? fallsStatic.orderOnlineUrl!;

  const lateNight = isLateNight();

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex min-h-[75vh] items-center justify-center overflow-hidden"
        style={{ backgroundColor: "var(--color-ink)" }}
        aria-label="Hero"
      >
        <div className="absolute inset-0 bg-black/30" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pt-24 pb-16 text-center text-white sm:px-6">
          {activeTheme?.badgeText && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold"
              style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
            >
              {activeTheme.badgeText}
            </div>
          )}
          <h1
            className="font-heading text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
            style={{ color: "var(--color-warm-white)" }}
          >
            Great Beer.
            <br />
            Great Pizza.
            <br />
            Great Company.
          </h1>
          <p className="mt-5 text-lg text-white/80 sm:text-xl">
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
              status={appletonStatus}
              href="/appleton/"
              orderHref={appletonOrderUrl}
            />
            <LocationHeroCard
              name="Menomonee Falls"
              tagline="Craft beer and wood-fired pizza in the heart of the Falls."
              status={fallsStatus}
              href="/the-falls/"
              orderHref={fallsOrderUrl}
            />
          </div>
        </div>
      </section>

      {/* Rotating quote */}
      <QuoteBanner />

      {/* What we do */}
      <section className="section-padding" aria-label="About">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-3">
      <AboutPillar
              icon="🍺"
              heading="Brewed Here"
              body="Every beer on tap is brewed in-house at our Appleton brewhouse and served at both locations. Rotating taps, seasonal releases, and a few you&rsquo;ll keep coming back for."
            />
            <AboutPillar
              icon="🍕"
              heading="Wood-Fired Pizza"
              body="Wood-fired every order, with specialty pies and a build-your-own option for when you already know what you want."
            />
            <AboutPillar
              icon="🤝"
              heading="Good Company"
              body="A neighborhood taproom first. We&rsquo;re here to make everyone comfortable — whether you&rsquo;re a craft beer regular or just figuring out what a hazy IPA is."
            />
          </div>
        </div>
      </section>

      {/* Location cards */}
      <section
        className="section-padding"
        style={{ backgroundColor: "var(--color-warm-white)" }}
        aria-label="Locations"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2
            className="mb-8 font-heading text-3xl font-bold sm:text-4xl"
            style={{ color: "var(--color-ink)" }}
          >
            Find Us
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <LocationCard
              name="Appleton"
              address="512 W Northland Ave, Appleton WI"
              hoursNote="Wed–Sat 11 AM–10 PM · Sun 12–6 PM"
              status={appletonStatus}
              foodHref="/appleton-food-menu/"
              drinksHref="/appleton-drinks-menu/"
              orderHref={appletonOrderUrl}
              locationHref="/appleton/"
              mapsHref="https://maps.app.goo.gl/9N2389HKdPiMQgzL7"
            />
            <LocationCard
              name="Menomonee Falls"
              address="N88W16521 Main St, Menomonee Falls WI"
              hoursNote="Tue–Thu 4–10 PM · Fri–Sat 11 AM–10 PM"
              status={fallsStatus}
              foodHref="/the-falls-food-menu/"
              drinksHref="/the-falls-drinks-menu/"
              orderHref={fallsOrderUrl}
              locationHref="/the-falls/"
              mapsHref="https://maps.app.goo.gl/DWFo5Du6CZfUqkt7A"
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
                className="font-heading text-2xl font-bold sm:text-3xl"
                style={{ color: "var(--color-ink)" }}
              >
                From the Taproom
              </h2>
              {photos.length > 8 && (
                <Link
                  href="/photos/"
                  className="text-sm font-medium hover:underline underline-offset-2"
                  style={{ color: "var(--color-green)" }}
                >
                  View all →
                </Link>
              )}
            </div>
            <TaproomPhotoGrid photos={photos} limit={8} />
          </div>
        </section>
      )}

      {/* Social nudge */}
      <section
        className="section-padding"
        style={{ backgroundColor: "var(--color-ink)" }}
        aria-label="Follow us"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <h2
              className="font-heading text-2xl font-bold sm:text-3xl"
              style={{ color: "white" }}
            >
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
              href="/appleton-food-menu/"
              cta="View Menus"
            />
            <NextStepCard
              title="Upcoming Events"
              description="Live music, tap releases, and community nights."
              href="/events/"
              cta="See Events"
            />
            <NextStepCard
              title="Order Online"
              description="Pick up or delivery through Toast. Ready when you are."
              href={appletonOrderUrl}
              cta="Order Now"
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
  status,
  href,
  orderHref,
}: {
  name: string;
  tagline: string;
  status: { isOpen: boolean; label: string } | null;
  href: string;
  orderHref: string;
}) {
  return (
    <div
      className="rounded-xl p-6 flex flex-col"
      style={{
        backgroundColor: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      <h2 className="font-heading text-xl font-bold text-white">{name}</h2>
      <p className="mt-1 text-sm text-white/75">{tagline}</p>
      {status && (
        <div className="mt-3">
          <OpenClosedBadge status={status} />
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
  status,
  foodHref,
  drinksHref,
  orderHref,
  locationHref,
  mapsHref,
}: {
  name: string;
  address: string;
  hoursNote: string;
  status: { isOpen: boolean; label: string } | null;
  foodHref: string;
  drinksHref: string;
  orderHref: string;
  locationHref: string;
  mapsHref: string;
}) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ border: "1px solid rgba(0,0,0,0.08)", backgroundColor: "white" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
      <h3
        className="font-heading text-xl font-bold"
        style={{ color: "var(--color-ink)" }}
      >
            {name}
          </h3>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
            {address}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>
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

      {status && (
        <div className="mt-3">
          <OpenClosedBadge status={status} />
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

function AboutPillar({
  icon,
  heading,
  body,
}: {
  icon: string;
  heading: string;
  body: string;
}) {
  return (
    <div>
      <div className="text-3xl mb-3" aria-hidden="true">{icon}</div>
      <h3
        className="font-heading text-lg font-bold mb-2"
        style={{ color: "var(--color-ink)" }}
      >
        {heading}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--color-ink)" }}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  );
}

function NextStepCard({
  title,
  description,
  href,
  cta,
  highlight = false,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: highlight ? "var(--color-ink)" : "white",
        color: highlight ? "var(--color-warm-white)" : "var(--color-ink)",
        border: highlight ? "none" : "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <h3 className="font-heading text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm opacity-80">{description}</p>
      <Link
        href={href}
        className="mt-4 inline-flex min-h-[44px] items-center rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
        style={{
          backgroundColor: highlight ? "var(--color-seasonal-cta)" : "var(--color-seasonal-cta)",
          color: "white",
        }}
      >
        {cta}
      </Link>
    </div>
  );
}
