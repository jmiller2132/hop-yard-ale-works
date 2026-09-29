import type { Metadata } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { upcomingEventsQuery } from "@/lib/sanity/queries";
import { LOCATIONS, type LocationSlug } from "@/lib/location-data";
import { SITE_URL, absoluteUrl, jsonLdString } from "@/lib/site";
import EventsClient from "@/components/events/EventsClient";
import type { Event } from "@/types";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Events in Appleton & Menomonee Falls",
  description:
    "Upcoming events at Hop Yard Ale Works in Appleton and Menomonee Falls, WI.",
};

function buildJsonLd(events: Event[]) {
  return events.flatMap((e) => {
    const slug = e.location?.slug?.current as LocationSlug | undefined;
    const venue = slug ? LOCATIONS[slug] : undefined;
    if (!venue || e.category === "Closure") return [];
    const time = e.time ? to24h(e.time) : null;
    return [
      {
        "@context": "https://schema.org",
        "@type": "Event",
        name: e.title,
        startDate: time ? `${e.date}T${time}` : e.date,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: venue.name,
          address: {
            "@type": "PostalAddress",
            streetAddress: venue.street,
            addressLocality: venue.city,
            addressRegion: venue.region,
            postalCode: venue.postalCode,
            addressCountry: "US",
          },
        },
        description: e.description ?? "",
        url: e.externalUrl ?? e.ticketUrl ?? absoluteUrl("/events/"),
        organizer: {
          "@type": "Organization",
          name: "Hop Yard Ale Works",
          url: SITE_URL,
        },
      },
    ];
  });
}

/** "7:00 PM" → "19:00:00"; returns null for free text like "July 16–19". */
function to24h(time: string): string | null {
  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\b/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

export default async function EventsPage() {
  // en-CA formats as YYYY-MM-DD; using UTC here would drop tonight's events after 7 PM Central.
  const now = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());

  const events = await sanityClient
    .fetch<Event[]>(upcomingEventsQuery, { now, start: 0, end: 50 })
    .catch(() => [] as Event[]);

  const jsonLd = buildJsonLd(events);

  return (
    <>
      {jsonLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
        />
      )}

      {/* Hero */}
      <section
        className="relative flex items-end pb-8 pt-20 sm:pt-24"
        style={{ minHeight: "clamp(180px, 40vh, 280px)", backgroundColor: "var(--color-ink)" }}
        aria-label="Events"
      >
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6">
          <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">Events</h1>
          <p className="mt-2 text-white/70 text-sm">
            What&rsquo;s coming up at Appleton and Menomonee Falls.
          </p>
        </div>
      </section>

      <EventsClient events={events} />
    </>
  );
}
