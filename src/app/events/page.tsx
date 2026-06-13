import type { Metadata } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { upcomingEventsQuery } from "@/lib/sanity/queries";
import { SEED_EVENTS } from "@/data/events-seed";
import EventsClient from "@/components/events/EventsClient";
import type { Event } from "@/types";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Events — Hop Yard Ale Works",
  description:
    "Upcoming events at Hop Yard Ale Works in Appleton and Menomonee Falls. Live music, tap releases, and community nights.",
};

function buildJsonLd(events: Event[]) {
  return events
    .filter((e) => !e.isPlaceholder)
    .map((e) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: e.title,
      startDate: e.time ? `${e.date}T${to24h(e.time)}` : e.date,
      location: {
        "@type": "Place",
        name: e.location?.name ?? "Hop Yard Ale Works",
        address: {
          "@type": "PostalAddress",
          addressLocality:
            e.location?.slug?.current === "the-falls" ? "Menomonee Falls" : "Appleton",
          addressRegion: "WI",
          addressCountry: "US",
        },
      },
      description: e.description ?? "",
      url: e.ticketUrl ?? "https://www.hopyardaleworks.com/events/",
      organizer: {
        "@type": "Organization",
        name: "Hop Yard Ale Works",
        url: "https://www.hopyardaleworks.com",
      },
    }));
}

function to24h(time: string): string {
  try {
    const [t, period] = time.trim().split(" ");
    const [h, m] = t.split(":").map(Number);
    let hours = h;
    if (period?.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (period?.toUpperCase() === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}:00`;
  } catch {
    return "00:00:00";
  }
}

export default async function EventsPage() {
  const now = new Date().toISOString().split("T")[0];

  const cmsEvents = await sanityClient
    .fetch<Event[]>(upcomingEventsQuery, { now, start: 0, end: 50 })
    .catch(() => [] as Event[]);

  const events =
    cmsEvents.length > 0
      ? cmsEvents
      : SEED_EVENTS.filter((e) => e.date >= now).sort((a, b) =>
          a.date.localeCompare(b.date)
        );

  const hasPlaceholders = events.some((e) => e.isPlaceholder);
  const jsonLd = buildJsonLd(events);

  return (
    <>
      {jsonLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Hero */}
      <section
        className="relative flex items-end pb-8 pt-20 sm:pt-24"
        style={{ minHeight: "clamp(180px, 40vh, 280px)", backgroundColor: "var(--color-ink)" }}
        aria-label="Events"
      >
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
          <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">Events</h1>
          <p className="mt-2 text-white/70 text-sm">
            Live music, tap releases, and whatever else we&rsquo;ve got going on.
          </p>
        </div>
      </section>

      <EventsClient events={events} hasPlaceholders={hasPlaceholders} />
    </>
  );
}
