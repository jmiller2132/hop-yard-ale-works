"use client";

import { useState } from "react";
import Link from "next/link";
import type { Event } from "@/types";

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00");
  return {
    weekday: date.toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Chicago" }),
    month: date.toLocaleDateString("en-US", { month: "long", timeZone: "America/Chicago" }),
    monthShort: date.toLocaleDateString("en-US", { month: "short", timeZone: "America/Chicago" }),
    day: date.toLocaleDateString("en-US", { day: "numeric", timeZone: "America/Chicago" }),
    year: date.toLocaleDateString("en-US", { year: "numeric", timeZone: "America/Chicago" }),
  };
}

function groupByMonth(events: Event[]): Map<string, Event[]> {
  const groups = new Map<string, Event[]>();
  for (const event of events) {
    const { month, year } = formatDate(event.date);
    const key = `${month} ${year}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }
  return groups;
}

const CATEGORY_STYLES: Record<string, { bg: string; activeBg: string; text: string; activeText: string }> = {
  All:            { bg: "rgba(0,0,0,0.05)",       activeBg: "var(--color-ink)",  text: "var(--color-ink)", activeText: "white" },
  "Live Music":   { bg: "rgba(106,191,75,0.12)",   activeBg: "#4a9e2f",           text: "#2d6b1a",          activeText: "white" },
  "Tap Release":  { bg: "rgba(217,119,6,0.12)",    activeBg: "#b45309",           text: "#92400e",          activeText: "white" },
  "Out & About":  { bg: "rgba(109,40,217,0.10)",   activeBg: "#6d28d9",           text: "#5b21b6",          activeText: "white" },
  "Special":      { bg: "rgba(71,85,105,0.12)",    activeBg: "#475569",           text: "#334155",          activeText: "white" },
  "Closure":      { bg: "rgba(220,38,38,0.10)",    activeBg: "#dc2626",           text: "#b91c1c",          activeText: "white" },
};

const LOCATION_STYLES: Record<string, { bg: string; activeBg: string; text: string; activeText: string }> = {
  All:          { bg: "rgba(0,0,0,0.05)",       activeBg: "var(--color-ink)",  text: "var(--color-ink)", activeText: "white" },
  "Appleton":   { bg: "rgba(106,191,75,0.12)",   activeBg: "#4a9e2f",           text: "#2d6b1a",          activeText: "white" },
  "The Falls":  { bg: "rgba(217,119,6,0.12)",    activeBg: "#b45309",           text: "#92400e",          activeText: "white" },
};

interface EventsClientProps {
  events: Event[];
  hasPlaceholders: boolean;
}

export default function EventsClient({ events, hasPlaceholders }: EventsClientProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLocation, setActiveLocation] = useState("All");

  const filtered = events.filter((e) => {
    const catMatch = activeCategory === "All" || e.category === activeCategory;
    const locMatch =
      activeLocation === "All" ||
      !e.location ||  // no location = community event, always visible
      (activeLocation === "Appleton" && e.location?.slug?.current === "appleton") ||
      (activeLocation === "The Falls" && e.location?.slug?.current === "the-falls");
    return catMatch && locMatch;
  });

  const grouped = groupByMonth(filtered);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

      {/* Sample events notice */}
      {hasPlaceholders && (
        <div
          className="mb-8 rounded-xl px-5 py-4 text-sm"
          style={{ backgroundColor: "rgba(106,191,75,0.08)", border: "1px solid rgba(106,191,75,0.25)" }}
        >
          <p style={{ color: "var(--color-ink)" }}>
            <span className="font-semibold" style={{ color: "var(--color-green)" }}>
              Some events below are marked "Sample."
            </span>{" "}
            These are placeholder entries showing what the calendar could look like — tap releases,
            trivia nights, Oktoberfest, etc. Real events are unlabeled. Once live events are
            added in the CMS, samples disappear automatically.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-8">
        <FilterGroup
          label="Category"
          options={Object.keys(CATEGORY_STYLES)}
          styles={CATEGORY_STYLES}
          active={activeCategory}
          onSelect={setActiveCategory}
        />
        <FilterGroup
          label="Location"
          options={Object.keys(LOCATION_STYLES)}
          styles={LOCATION_STYLES}
          active={activeLocation}
          onSelect={setActiveLocation}
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm" style={{ color: "var(--color-muted)" }}>
          No events match those filters.
        </p>
      ) : (
        <div className="space-y-12">
          {Array.from(grouped.entries()).map(([month, monthEvents]) => (
            <div key={month}>
              <h2
                className="font-heading text-xl font-bold mb-5 pb-2 border-b"
                style={{ color: "var(--color-ink)", borderColor: "rgba(0,0,0,0.08)" }}
              >
                {month}
              </h2>
              <div className="space-y-4">
                {monthEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  options,
  styles,
  active,
  onSelect,
}: {
  label: string;
  options: string[];
  styles: Record<string, { bg: string; activeBg: string; text: string; activeText: string }>;
  active: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium uppercase tracking-wider mr-1" style={{ color: "var(--color-muted)" }}>
        {label}
      </span>
      {options.map((opt) => {
        const isActive = active === opt;
        const s = styles[opt] ?? styles["All"];
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className="rounded-full px-3 py-1 text-sm font-medium transition-colors min-h-[32px]"
            style={{
              backgroundColor: isActive ? s.activeBg : s.bg,
              color: isActive ? s.activeText : s.text,
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const { monthShort, day, weekday } = formatDate(event.date);

  return (
    <article
      className="rounded-xl p-5 sm:p-6"
      style={{
        backgroundColor: "white",
        border: event.isPlaceholder
          ? "1px dashed rgba(0,0,0,0.2)"
          : "1px solid rgba(0,0,0,0.07)",
      }}
    >
      <div className="flex gap-5">
        {/* Date block */}
        <div
          className="flex-shrink-0 flex flex-col items-center justify-center rounded-lg w-14 h-14 text-center"
          style={{ backgroundColor: "var(--color-ink)", color: "white" }}
          aria-label={`${weekday}, ${monthShort} ${day}`}
        >
          <span className="text-xs uppercase tracking-wide opacity-70 leading-none">{monthShort}</span>
          <span className="font-heading text-xl font-bold leading-tight">{day}</span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2">
            <h3
              className="font-heading text-lg font-semibold leading-tight"
              style={{ color: "var(--color-ink)" }}
            >
              {event.title}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {event.isPlaceholder && (
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0"
                  style={{ backgroundColor: "rgba(0,0,0,0.06)", color: "var(--color-muted)" }}
                >
                  Sample
                </span>
              )}
              {event.isRecurring && (
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0"
                  style={{ backgroundColor: "rgba(106,191,75,0.12)", color: "var(--color-green)" }}
                >
                  Recurring
                </span>
              )}
              {event.category && (() => {
                const s = CATEGORY_STYLES[event.category!] ?? CATEGORY_STYLES["All"];
                return (
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0"
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    {event.category}
                  </span>
                );
              })()}
            </div>
          </div>

          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm" style={{ color: "var(--color-muted)" }}>
            {event.time && <span>{event.time}</span>}
            {event.location && (
              <Link
                href={`/${event.location.slug.current}/`}
                className="hover:underline underline-offset-2"
                style={{ color: "var(--color-muted)" }}
              >
                {event.location.name}
              </Link>
            )}
            {event.recurrenceNote && <span>{event.recurrenceNote}</span>}
          </div>

          {event.description && (
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-ink)", opacity: 0.75 }}>
              {event.description}
            </p>
          )}

          {/* Action links row */}
          {(event.requiresTicket && event.ticketUrl || event.externalUrl || (event.artistLinks && event.artistLinks.length > 0)) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {event.requiresTicket && event.ticketUrl && (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold min-h-[36px] hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
                >
                  Get Tickets
                </a>
              )}
              {event.externalUrl && (
                <a
                  href={event.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium min-h-[36px] hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "var(--color-ink)" }}
                >
                  More Info
                </a>
              )}
              {event.artistLinks?.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium min-h-[36px] hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "var(--color-ink)" }}
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
