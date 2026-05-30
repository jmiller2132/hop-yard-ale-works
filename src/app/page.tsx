import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { locationsQuery } from "@/lib/sanity/queries";
import { computeOpenClosed, isLateNight } from "@/lib/hours";
import { LOCATION_STATIC_DATA } from "@/lib/location-data";
import OpenClosedBadge from "@/components/ui/OpenClosedBadge";
import type { Location } from "@/types";

export const revalidate = 900; // 15 minutes for open/closed accuracy

export const metadata = {
  title: "Hop Yard Ale Works — Great Beer, Great Pizza, Great Company",
  description:
    "Two Wisconsin taprooms brewing small-batch craft beer and firing up bold pizzas. Find us in Appleton and Menomonee Falls.",
};

export default async function HomePage() {
  const locations = await sanityClient
    .fetch<Location[]>(locationsQuery)
    .catch(() => [] as Location[]);

  // Fall back to static data while Sanity is being populated
  const appletonStatic = LOCATION_STATIC_DATA["appleton"];
  const fallsStatic = LOCATION_STATIC_DATA["the-falls"];

  const appleton = locations.find((l) => l.slug?.current === "appleton") ??
    (appletonStatic as Location);
  const theFalls = locations.find((l) => l.slug?.current === "the-falls") ??
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
        className="relative flex min-h-[70vh] items-center justify-center overflow-hidden section-padding"
        style={{ backgroundColor: "var(--color-teal)" }}
        aria-label="Hero"
      >
        {/* Background overlay placeholder — real image loaded from Sanity */}
        <div className="absolute inset-0 bg-black/30" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center text-white sm:px-6">
          <h1
            className="font-heading text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
            style={{ color: "var(--color-warm-white)" }}
          >
            Great Beer, Great Pizza,
            <br />
            Great Company.
          </h1>
          <p className="mt-4 text-lg opacity-90 sm:text-xl">
            Two Wisconsin taprooms. One community.
          </p>

          {lateNight && (
            <p className="mt-6 text-sm italic opacity-70">
              You're up late. So is the dough.
            </p>
          )}

          {/* Dual location CTA cards */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-6">
            <LocationHeroCard
              name="Appleton"
              tagline={appleton?.tagline ?? appletonStatic.tagline ?? "The original taproom"}
              status={appletonStatus}
              href="/appleton/"
              orderHref={appletonOrderUrl}
            />
            <LocationHeroCard
              name="Menomonee Falls"
              tagline={theFalls?.tagline ?? fallsStatic.tagline ?? "Pizza-forward taproom"}
              status={fallsStatus}
              href="/the-falls/"
              orderHref={fallsOrderUrl}
            />
          </div>
        </div>
      </section>

      {/* Quote Banner — client component for sessionStorage */}
      <QuoteBannerPlaceholder />

      {/* Location Quick-Select */}
      <section className="section-padding" aria-label="Choose your location">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2
            className="mb-8 text-center font-heading text-3xl font-bold sm:text-4xl"
            style={{ color: "var(--color-ink)" }}
          >
            Find Your Spot
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <LocationCard
              name="Appleton"
              address="512 W Northland Ave, Appleton WI"
              status={appletonStatus}
              foodHref="/appleton-food-menu/"
              drinksHref="/appleton-drinks-menu/"
              orderHref={appletonOrderUrl}
              locationHref="/appleton/"
            />
            <LocationCard
              name="Menomonee Falls"
              address="N88W16521 Main St, Menomonee Falls WI"
              status={fallsStatus}
              foodHref="/the-falls-food-menu/"
              drinksHref="/the-falls-drinks-menu/"
              orderHref={fallsOrderUrl}
              locationHref="/the-falls/"
            />
          </div>
        </div>
      </section>

      {/* From the Taproom photo feed — client component stub */}
      <section
        className="section-padding overflow-hidden"
        style={{ backgroundColor: "var(--color-teal)" }}
        aria-label="From the taproom"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2
            className="mb-6 font-heading text-2xl font-bold sm:text-3xl"
            style={{ color: "var(--color-gold)" }}
          >
            From the Taproom
          </h2>
          <div
            className="flex items-center justify-center rounded-lg py-16 text-center"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <p className="text-sm italic opacity-60" style={{ color: "var(--color-warm-white)" }}>
              Community photos loading…
            </p>
          </div>
        </div>
      </section>

      {/* Tagged at Hop Yard — UGC embed */}
      <section className="section-padding" aria-label="Tagged at Hop Yard">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2
            className="mb-2 font-heading text-2xl font-bold sm:text-3xl"
            style={{ color: "var(--color-ink)" }}
          >
            Tagged at Hop Yard
          </h2>
          <p className="mb-6 text-sm" style={{ color: "var(--color-muted)" }}>
            Tag your photos <span className="font-medium">#hopyardaleworks</span>
          </p>
          {/* Curator.io / Taggbox embed goes here */}
          <div
            className="flex items-center justify-center rounded-lg py-16 text-center"
            style={{ backgroundColor: "rgba(0,0,0,0.03)", border: "1px dashed var(--color-muted)" }}
          >
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Instagram UGC feed — connect Curator.io or Taggbox embed
            </p>
          </div>
        </div>
      </section>

      {/* Next Step row */}
      <section
        className="section-padding"
        style={{ backgroundColor: "var(--color-warm-white)" }}
        aria-label="Next steps"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <NextStepCard
              title="Find a Location"
              description="Appleton or Menomonee Falls — we've got you covered."
              href="/appleton/"
              cta="Choose Location"
            />
            <NextStepCard
              title="View Menus"
              description="Food, drinks, and everything in between."
              href="/appleton-food-menu/"
              cta="See the Menu"
            />
            <NextStepCard
              title="Order Online"
              description="Ready when you are. Pick up or delivery."
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
      className="rounded-xl p-6 text-left"
      style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
    >
      <h2 className="font-heading text-xl font-bold text-white">{name}</h2>
      <p className="mt-1 text-sm text-white/80">{tagline}</p>
      {status && (
        <div className="mt-3">
          <OpenClosedBadge status={status} />
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={href}
          className="rounded-md px-4 py-2 text-sm font-semibold text-white min-h-[44px] flex items-center transition-colors"
          style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
        >
          Visit
        </Link>
        <Link
          href={orderHref}
          className="rounded-md px-4 py-2 text-sm font-semibold min-h-[44px] flex items-center transition-colors"
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
  status,
  foodHref,
  drinksHref,
  orderHref,
  locationHref,
}: {
  name: string;
  address: string;
  status: { isOpen: boolean; label: string } | null;
  foodHref: string;
  drinksHref: string;
  orderHref: string;
  locationHref: string;
}) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ border: "1px solid rgba(0,0,0,0.08)", backgroundColor: "white" }}
    >
      <h3 className="font-heading text-xl font-bold" style={{ color: "var(--color-teal)" }}>
        {name}
      </h3>
      <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
        {address}
      </p>
      {status && (
        <div className="mt-3">
          <OpenClosedBadge status={status} />
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={foodHref}
          className="rounded-md border px-3 py-2 text-sm font-medium min-h-[44px] flex items-center transition-colors hover:bg-gray-50"
          style={{ borderColor: "var(--color-teal)", color: "var(--color-teal)" }}
        >
          View Food
        </Link>
        <Link
          href={drinksHref}
          className="rounded-md border px-3 py-2 text-sm font-medium min-h-[44px] flex items-center transition-colors hover:bg-gray-50"
          style={{ borderColor: "var(--color-teal)", color: "var(--color-teal)" }}
        >
          View Drinks
        </Link>
        <Link
          href={orderHref}
          className="rounded-md px-3 py-2 text-sm font-semibold text-white min-h-[44px] flex items-center transition-opacity hover:opacity-90"
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
        backgroundColor: highlight ? "var(--color-teal)" : "white",
        color: highlight ? "var(--color-warm-white)" : "var(--color-ink)",
        border: highlight ? "none" : "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <h3 className="font-heading text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm opacity-80">{description}</p>
      <Link
        href={href}
        className="mt-4 inline-flex min-h-[44px] items-center rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{
          backgroundColor: highlight ? "var(--color-gold)" : "var(--color-seasonal-cta)",
          color: highlight ? "var(--color-ink)" : "white",
        }}
      >
        {cta}
      </Link>
    </div>
  );
}

// Placeholder for the client-side QuoteBanner
// The real component reads from sessionStorage/localStorage
function QuoteBannerPlaceholder() {
  return (
    <section
      className="py-6 px-4 text-center sm:px-6"
      style={{ backgroundColor: "var(--color-warm-white)" }}
      aria-label="Quote"
    >
      <blockquote className="mx-auto max-w-2xl">
        <p
          className="font-heading text-lg italic sm:text-xl"
          style={{ color: "var(--color-teal)" }}
        >
          "Without question the greatest invention in the history of mankind is beer…
          the wheel does not go nearly as well with pizza."
        </p>
        <footer className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
          — Dave Barry
        </footer>
      </blockquote>
    </section>
  );
}
