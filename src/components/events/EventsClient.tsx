"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import type { Event } from "@/types";
import { downloadIcs } from "@/lib/event-calendar";

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00");
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    date.toLocaleDateString("en-US", { ...opts, timeZone: "America/Chicago" });
  return {
    weekday: fmt({ weekday: "long" }),
    weekdayShort: fmt({ weekday: "short" }),
    month: fmt({ month: "long" }),
    monthShort: fmt({ month: "short" }),
    day: fmt({ day: "numeric" }),
    year: fmt({ year: "numeric" }),
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
  "Live Music":   { bg: "rgba(106,191,75,0.12)",   activeBg: "#2F7A1F",           text: "#2d6b1a",          activeText: "white" },
  "Tap Release":  { bg: "rgba(217,119,6,0.12)",    activeBg: "#b45309",           text: "#92400e",          activeText: "white" },
  "Out & About":  { bg: "rgba(109,40,217,0.10)",   activeBg: "#6d28d9",           text: "#5b21b6",          activeText: "white" },
  "Special":      { bg: "rgba(71,85,105,0.12)",    activeBg: "#475569",           text: "#334155",          activeText: "white" },
  "Closure":      { bg: "rgba(220,38,38,0.10)",    activeBg: "#dc2626",           text: "#b91c1c",          activeText: "white" },
};

const CLOSURE = "Closure";

const LOCATIONS = [
  { slug: "all", label: "Both locations", color: "var(--color-ink)" },
  { slug: "appleton", label: "Appleton", color: "#2F7A1F" },
  { slug: "the-falls", label: "The Falls", color: "#b45309" },
] as const;

type LocationSlug = (typeof LOCATIONS)[number]["slug"];

const OFFSITE_COLOR = "#6d28d9";

function locationMeta(event: Event) {
  const slug = event.location?.slug?.current;
  const known = LOCATIONS.find((l) => l.slug === slug && l.slug !== "all");
  if (known) return { label: known.label, color: known.color, href: `/${known.slug}/` };
  if (event.location) return { label: event.location.name, color: OFFSITE_COLOR, href: `/${slug}/` };
  return null;
}

function accentFor(event: Event) {
  return locationMeta(event)?.color ?? OFFSITE_COLOR;
}

interface EventsClientProps {
  events: Event[];
}

const FILTERS_CHANGED = "events-filters-changed";

function subscribeToSearch(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(FILTERS_CHANGED, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(FILTERS_CHANGED, onChange);
  };
}

export default function EventsClient({ events }: EventsClientProps) {
  const search = useSyncExternalStore(
    subscribeToSearch,
    () => window.location.search,
    () => ""
  );

  const categories = [
    "All",
    ...Object.keys(CATEGORY_STYLES).filter(
      (c) => c !== "All" && c !== CLOSURE && events.some((e) => e.category === c)
    ),
  ];

  const params = new URLSearchParams(search);
  const locParam = params.get("location");
  const catParam = params.get("category");
  const activeLocation: LocationSlug =
    LOCATIONS.find((l) => l.slug === locParam)?.slug ?? "all";
  const activeCategory = catParam && categories.includes(catParam) ? catParam : "All";

  function updateFilters(next: { location?: LocationSlug; category?: string }) {
    const location = next.location ?? activeLocation;
    const category = next.category ?? activeCategory;

    const nextParams = new URLSearchParams(window.location.search);
    if (location === "all") nextParams.delete("location");
    else nextParams.set("location", location);
    if (category === "All") nextParams.delete("category");
    else nextParams.set("category", category);
    const qs = nextParams.toString();
    window.history.replaceState(window.history.state, "", qs ? `?${qs}` : window.location.pathname);
    window.dispatchEvent(new CustomEvent(FILTERS_CHANGED));
  }

  const locationMatches = (e: Event) =>
    activeLocation === "all" ||
    !e.location || // no location = community event, always visible
    e.location.slug?.current === activeLocation;

  const closures = events.filter((e) => e.category === CLOSURE && locationMatches(e));
  const filtered = events.filter(
    (e) =>
      e.category !== CLOSURE &&
      locationMatches(e) &&
      (activeCategory === "All" || e.category === activeCategory)
  );

  const [featured, ...rest] = filtered;
  const grouped = groupByMonth(rest);
  const isFiltered = activeLocation !== "all" || activeCategory !== "All";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <LocationToggle active={activeLocation} onSelect={(location) => updateFilters({ location })} />
        {categories.length > 2 && (
          <CategoryChips
            options={categories}
            active={activeCategory}
            onSelect={(category) => updateFilters({ category })}
          />
        )}
      </div>

      {closures.length > 0 && <ClosureNotice closures={closures} />}

      {/* Results */}
      {/* min-height keeps the page tall enough that filtering never forces the browser to clamp scroll */}
      <div className={`${events.length > 0 ? "min-h-[80svh]" : ""} [overflow-anchor:none]`}>
        {!featured ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              {isFiltered ? "No upcoming events match those filters." : "No events posted right now."}
            </p>
            {!isFiltered && (
              <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
                Follow us on{" "}
                <a
                  href="https://www.instagram.com/hopyardaleworks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                  style={{ color: "var(--color-green-text)" }}
                >
                  Instagram
                </a>{" "}
                or{" "}
                <a
                  href="https://www.facebook.com/hopyardaleworks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                  style={{ color: "var(--color-green-text)" }}
                >
                  Facebook
                </a>{" "}
                for the latest.
              </p>
            )}
            {isFiltered && (
              <button
                onClick={() => updateFilters({ location: "all", category: "All" })}
                className="mt-4 rounded-full px-4 py-2 text-sm font-medium min-h-[40px] transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--color-ink)", color: "white" }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <section aria-labelledby="next-up" className="mb-12">
              <h2
                id="next-up"
                className="mb-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-muted)" }}
              >
                Next up
              </h2>
              <FeaturedEventCard event={featured} />
            </section>

            {rest.length > 0 && (
              <div className="space-y-12">
                {Array.from(grouped.entries()).map(([month, monthEvents]) => (
                  <section key={month} aria-label={month}>
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
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function LocationToggle({
  active,
  onSelect,
}: {
  active: LocationSlug;
  onSelect: (v: LocationSlug) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Location"
      className="inline-flex w-full rounded-full p-1 sm:w-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
    >
      {LOCATIONS.map((loc) => {
        const isActive = active === loc.slug;
        return (
          <button
            key={loc.slug}
            role="radio"
            aria-checked={isActive}
            onClick={() => onSelect(loc.slug)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium min-h-[36px] transition-colors sm:flex-none"
            style={{
              backgroundColor: isActive ? "white" : "transparent",
              color: isActive ? "var(--color-ink)" : "var(--color-muted)",
              boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
            }}
          >
            {loc.slug !== "all" && (
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: loc.color }} aria-hidden="true" />
            )}
            {loc.label}
          </button>
        );
      })}
    </div>
  );
}

function CategoryChips({
  options,
  active,
  onSelect,
}: {
  options: string[];
  active: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Category"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [scrollbar-width:none]"
    >
      {options.map((opt) => {
        const isActive = active === opt;
        const s = CATEGORY_STYLES[opt] ?? CATEGORY_STYLES["All"];
        return (
          <button
            key={opt}
            aria-pressed={isActive}
            onClick={() => onSelect(opt)}
            className="flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-colors min-h-[32px]"
            style={{
              backgroundColor: isActive ? s.activeBg : s.bg,
              color: isActive ? s.activeText : s.text,
            }}
          >
            {opt === "All" ? "All events" : opt}
          </button>
        );
      })}
    </div>
  );
}

function ClosureNotice({ closures }: { closures: Event[] }) {
  const s = CATEGORY_STYLES[CLOSURE];
  return (
    <section
      aria-label="Upcoming closures"
      className="mb-10 rounded-xl px-5 py-4"
      style={{ backgroundColor: s.bg, border: "1px solid rgba(220,38,38,0.2)" }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: s.text }}>
        Upcoming closures
      </h2>
      <ul className="mt-2 space-y-2">
        {closures.map((event) => {
          const { weekdayShort, monthShort, day } = formatDate(event.date);
          const loc = locationMeta(event);
          return (
            <li key={event._id} className="text-sm" style={{ color: "var(--color-ink)" }}>
              <time dateTime={event.date} className="font-semibold">
                {weekdayShort}, {monthShort} {day}
              </time>
              {loc && <span style={{ color: "var(--color-muted)" }}> · {loc.label}</span>}
              <span> — {event.title}</span>
              {event.description && (
                <p className="mt-0.5 text-sm" style={{ color: "var(--color-muted)" }}>
                  {event.description}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Badges({ event, onDark = false }: { event: Event; onDark?: boolean }) {
  const badgeClass = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0";
  const cat = event.category ? CATEGORY_STYLES[event.category] ?? CATEGORY_STYLES["All"] : null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {event.category && cat && (
        <span
          className={badgeClass}
          style={onDark ? { backgroundColor: cat.activeBg, color: "white" } : { backgroundColor: cat.bg, color: cat.text }}
        >
          {event.category}
        </span>
      )}
      {event.isRecurring && (
        <span
          className={badgeClass}
          style={
            onDark
              ? { backgroundColor: "rgba(255,255,255,0.12)", color: "white" }
              : { backgroundColor: "rgba(106,191,75,0.12)", color: "#2d6b1a" }
          }
        >
          Recurring
        </span>
      )}
      {event.isPlaceholder && (
        <span
          className={badgeClass}
          style={
            onDark
              ? { backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)" }
              : { backgroundColor: "rgba(0,0,0,0.06)", color: "var(--color-muted)" }
          }
        >
          Sample
        </span>
      )}
    </div>
  );
}

function MetaLine({ event, onDark = false }: { event: Event; onDark?: boolean }) {
  const loc = locationMeta(event);
  const muted = onDark ? "rgba(255,255,255,0.7)" : "var(--color-muted)";
  const items: ReactNode[] = [];
  if (event.time) items.push(<span key="time">{event.time}</span>);
  if (loc) {
    items.push(
      <Link
        key="loc"
        href={loc.href}
        className="inline-flex items-center gap-1.5 hover:underline underline-offset-2"
        style={{ color: muted }}
      >
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: loc.color }} aria-hidden="true" />
        {loc.label}
      </Link>
    );
  }
  if (event.recurrenceNote) items.push(<span key="rec">{event.recurrenceNote}</span>);
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm" style={{ color: muted }}>
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-2">
          {i > 0 && <span aria-hidden="true">·</span>}
          {item}
        </span>
      ))}
    </div>
  );
}

function ActionLinks({ event, onDark = false }: { event: Event; onDark?: boolean }) {
  const secondary = onDark
    ? { backgroundColor: "rgba(255,255,255,0.1)", color: "white" }
    : { backgroundColor: "rgba(0,0,0,0.05)", color: "var(--color-ink)" };
  const secondaryClass =
    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium min-h-[36px] hover:opacity-80 transition-opacity";

  return (
    <div className="mt-4 flex flex-wrap gap-2">
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
        <a href={event.externalUrl} target="_blank" rel="noopener noreferrer" className={secondaryClass} style={secondary}>
          More Info
        </a>
      )}
      {event.artistLinks?.map((link) => (
        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className={secondaryClass} style={secondary}>
          {link.label} ↗
        </a>
      ))}
      <button type="button" onClick={() => downloadIcs(event)} className={secondaryClass} style={secondary}>
        <CalendarIcon />
        Add to calendar
      </button>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
    </svg>
  );
}

function FeaturedEventCard({ event }: { event: Event }) {
  const { weekday, month, day } = formatDate(event.date);
  const accent = accentFor(event);

  return (
    <article
      className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
      style={{
        backgroundColor: "var(--color-ink)",
        color: "white",
        border: event.isPlaceholder ? "1px dashed rgba(255,255,255,0.3)" : "none",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: accent }} aria-hidden="true" />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <time
          dateTime={event.date}
          className="flex-shrink-0 font-heading leading-none"
        >
          <span className="block text-sm font-medium uppercase tracking-wider text-white/60">{weekday}</span>
          <span className="mt-1 block text-4xl font-bold sm:text-5xl">
            {month} {day}
          </span>
        </time>

        <div className="flex-1 min-w-0 sm:border-l sm:border-white/10 sm:pl-6">
          <Badges event={event} onDark />
          <h3 className="mt-2 font-heading text-2xl font-bold leading-tight sm:text-3xl">{event.title}</h3>
          <div className="mt-2">
            <MetaLine event={event} onDark />
          </div>
          {event.description && (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">{event.description}</p>
          )}
          <ActionLinks event={event} onDark />
        </div>
      </div>
    </article>
  );
}

function EventCard({ event }: { event: Event }) {
  const { monthShort, day, weekdayShort } = formatDate(event.date);
  const accent = accentFor(event);

  return (
    <article
      className="relative overflow-hidden rounded-xl bg-white p-5 sm:p-6"
      style={{
        border: event.isPlaceholder ? "1px dashed rgba(0,0,0,0.2)" : "1px solid rgba(0,0,0,0.07)",
      }}
    >
      <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: accent }} aria-hidden="true" />
      <div className="flex gap-5">
        <time
          dateTime={event.date}
          className="flex-shrink-0 flex flex-col items-center justify-center rounded-lg w-16 h-16 text-center"
          style={{ backgroundColor: "var(--color-warm-white)", color: "var(--color-ink)" }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wide leading-none" style={{ color: accent }}>
            {weekdayShort}
          </span>
          <span className="font-heading text-2xl font-bold leading-tight">{day}</span>
          <span className="text-[11px] uppercase tracking-wide leading-none opacity-60">{monthShort}</span>
        </time>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-heading text-lg font-semibold leading-tight" style={{ color: "var(--color-ink)" }}>
              {event.title}
            </h3>
            <Badges event={event} />
          </div>

          <div className="mt-1">
            <MetaLine event={event} />
          </div>

          {event.description && (
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-ink)", opacity: 0.75 }}>
              {event.description}
            </p>
          )}

          <ActionLinks event={event} />
        </div>
      </div>
    </article>
  );
}
