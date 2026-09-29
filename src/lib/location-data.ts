// Single source of truth for location facts rendered on the site: hours,
// address, order and map links. Every hours table, footer, home card, JSON-LD
// block and chatbot answer is derived from LOCATIONS below, so an hours change
// is made here once.

import type { DayHours, Location } from "@/types";

export type LocationSlug = "appleton" | "the-falls";

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
export type Day = (typeof DAYS)[number];

/** 24-hour "HH:MM" times. `null` = closed that day. */
export type DaySchedule = { open: string; close: string } | null;

export interface LocationInfo {
  slug: LocationSlug;
  name: string;
  shortName: string;
  navLabel: string;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  googleMapsUrl: string;
  orderOnlineUrl: string;
  tagline: string;
  hours: Record<Day, DaySchedule>;
  kitchenNote: string;
  paths: { home: string; food: string; drinks: string };
}

const APPLETON_DAY = { open: "11:00", close: "22:00" };
const FALLS_WEEKNIGHT = { open: "16:00", close: "22:00" };
const FALLS_WEEKEND = { open: "11:00", close: "22:00" };

export const LOCATIONS: Record<LocationSlug, LocationInfo> = {
  appleton: {
    slug: "appleton",
    name: "Hop Yard Ale Works — Appleton",
    shortName: "Appleton",
    navLabel: "Appleton",
    street: "512 W Northland Ave",
    city: "Appleton",
    region: "WI",
    postalCode: "54911",
    googleMapsUrl: "https://maps.app.goo.gl/9N2389HKdPiMQgzL7",
    orderOnlineUrl:
      "https://order.toasttab.com/online/hop-yard-ale-works-appleton-512-w-northland-ave",
    tagline: "The original taproom.",
    hours: {
      Sunday: { open: "11:00", close: "16:00" },
      Monday: null,
      Tuesday: null,
      Wednesday: APPLETON_DAY,
      Thursday: APPLETON_DAY,
      Friday: APPLETON_DAY,
      Saturday: APPLETON_DAY,
    },
    kitchenNote: "Kitchen closes 1 hour before close Wed–Sat, and at 4 PM on Sunday.",
    paths: {
      home: "/appleton/",
      food: "/appleton-food-menu/",
      drinks: "/appleton-drinks-menu/",
    },
  },
  "the-falls": {
    slug: "the-falls",
    name: "Hop Yard Ale Works — Menomonee Falls",
    shortName: "Menomonee Falls",
    navLabel: "The Falls",
    street: "N88W16521 Main St",
    city: "Menomonee Falls",
    region: "WI",
    postalCode: "53051",
    googleMapsUrl: "https://maps.app.goo.gl/DWFo5Du6CZfUqkt7A",
    orderOnlineUrl:
      "https://order.toasttab.com/online/hop-yard-ale-works-menomonee-falls-n88w16521-main-street",
    tagline: "Pizza-forward taproom.",
    hours: {
      Sunday: { open: "11:00", close: "16:00" },
      Monday: null,
      Tuesday: FALLS_WEEKNIGHT,
      Wednesday: FALLS_WEEKNIGHT,
      Thursday: FALLS_WEEKNIGHT,
      Friday: FALLS_WEEKEND,
      Saturday: FALLS_WEEKEND,
    },
    kitchenNote: "Kitchen closes 1 hour before close Tue–Sat, and at 4 PM on Sunday.",
    paths: {
      home: "/the-falls/",
      food: "/the-falls-food-menu/",
      drinks: "/the-falls-drinks-menu/",
    },
  },
};

export const LOCATION_SLUGS = Object.keys(LOCATIONS) as LocationSlug[];

// ─── Formatting helpers ───────────────────────────────────────────────────────

function parse24(t: string): { h: number; m: number } {
  const [h, m] = t.split(":").map(Number);
  return { h, m: m ?? 0 };
}

function period(t: string): "AM" | "PM" {
  return parse24(t).h < 12 ? "AM" : "PM";
}

function clock(t: string): string {
  const { h, m } = parse24(t);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, "0")}` : String(h12);
}

/** "16:00" → "4:00 PM" (the format the open/closed badge and Sanity use). */
function to12hLong(t: string): string {
  const { h, m } = parse24(t);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period(t)}`;
}

/** { 16:00, 22:00 } → "4–10 PM"; { 11:00, 22:00 } → "11 AM–10 PM". */
export function formatRange(s: NonNullable<DaySchedule>): string {
  const samePeriod = period(s.open) === period(s.close);
  return samePeriod
    ? `${clock(s.open)}–${clock(s.close)} ${period(s.close)}`
    : `${clock(s.open)} ${period(s.open)}–${clock(s.close)} ${period(s.close)}`;
}

const SHORT_DAY: Record<Day, string> = {
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};

const MONDAY_FIRST: Day[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function sameSchedule(a: DaySchedule, b: DaySchedule): boolean {
  if (a === null || b === null) return a === b;
  return a.open === b.open && a.close === b.close;
}

// ─── Derived views ────────────────────────────────────────────────────────────

/** Rows for <HoursTable>, Sunday first. */
export function hoursRows(slug: LocationSlug) {
  const { hours } = LOCATIONS[slug];
  return DAYS.map((day) => {
    const s = hours[day];
    return s
      ? { day, hours: formatRange(s) }
      : { day, hours: "Closed", closed: true };
  });
}

/**
 * Compact grouped lines, open days first, e.g.
 * ["Wed–Sat 11 AM–10 PM", "Sun 11 AM–4 PM", "Mon–Tue Closed"].
 */
export function hoursSummary(slug: LocationSlug): { days: string; hours: string }[] {
  const { hours } = LOCATIONS[slug];
  const groups: { days: Day[]; schedule: DaySchedule }[] = [];
  for (const day of MONDAY_FIRST) {
    const last = groups[groups.length - 1];
    if (last && sameSchedule(last.schedule, hours[day])) last.days.push(day);
    else groups.push({ days: [day], schedule: hours[day] });
  }
  // Wrap Sunday into a Monday group when they match (e.g. "Sun–Mon Closed").
  if (groups.length > 1) {
    const first = groups[0];
    const last = groups[groups.length - 1];
    if (last.days.includes("Sunday") && sameSchedule(first.schedule, last.schedule)) {
      first.days = [...last.days, ...first.days];
      groups.pop();
    }
  }
  const label = (days: Day[]) =>
    days.length === 1
      ? SHORT_DAY[days[0]]
      : `${SHORT_DAY[days[0]]}–${SHORT_DAY[days[days.length - 1]]}`;
  const open = groups.filter((g) => g.schedule !== null);
  const closed = groups.filter((g) => g.schedule === null);
  return [
    ...open.map((g) => ({ days: label(g.days), hours: formatRange(g.schedule!) })),
    ...closed.map((g) => ({ days: label(g.days), hours: "Closed" })),
  ];
}

/** "Wed–Sat 11 AM–10 PM · Sun 11 AM–4 PM · Mon–Tue Closed" */
export function hoursSummaryText(slug: LocationSlug, separator = " · "): string {
  return hoursSummary(slug)
    .map((l) => `${l.days} ${l.hours}`)
    .join(separator);
}

/** schema.org OpeningHoursSpecification[], grouping days with equal hours. */
export function openingHoursSpecification(slug: LocationSlug) {
  const { hours } = LOCATIONS[slug];
  const byRange = new Map<string, { opens: string; closes: string; days: Day[] }>();
  for (const day of DAYS) {
    const s = hours[day];
    if (!s) continue;
    const key = `${s.open}-${s.close}`;
    const entry = byRange.get(key) ?? { opens: s.open, closes: s.close, days: [] };
    entry.days.push(day);
    byRange.set(key, entry);
  }
  return [...byRange.values()].map((e) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: e.days,
    opens: e.opens,
    closes: e.closes,
  }));
}

/** Hours in the Location shape used by the open/closed badge. */
export function badgeHours(slug: LocationSlug): Pick<Location, "hours" | "sundayHours"> {
  const { hours } = LOCATIONS[slug];
  const toDayHours = (day: Day): DayHours => {
    const s = hours[day];
    return s
      ? { day, open: to12hLong(s.open), close: to12hLong(s.close), isClosed: false }
      : { day, open: "", close: "", isClosed: true };
  };
  const sunday = toDayHours("Sunday");
  return {
    hours: DAYS.filter((d) => d !== "Sunday").map(toDayHours),
    sundayHours: { open: sunday.open, close: sunday.close, isClosed: sunday.isClosed },
  };
}

/**
 * Location for the badge: site hours from LOCATIONS, holiday closures from
 * the CMS document when available.
 */
export function locationForBadge(slug: LocationSlug, cms?: Location | null): Location {
  const info = LOCATIONS[slug];
  return {
    ...(cms ?? {}),
    name: cms?.name ?? info.name,
    orderOnlineUrl: cms?.orderOnlineUrl || info.orderOnlineUrl,
    ...badgeHours(slug),
    holidayOverrides: cms?.holidayOverrides ?? [],
  } as Location;
}

export function addressLines(slug: LocationSlug): [string, string] {
  const l = LOCATIONS[slug];
  return [l.street, `${l.city}, ${l.region} ${l.postalCode}`];
}

/** localStorage key for the last location page visited. */
export const LOCATION_STORAGE_KEY = "hyw-location";

export function readStoredLocation(): LocationSlug | null {
  const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
  return saved === "appleton" || saved === "the-falls" ? saved : null;
}

export function locationFromPath(pathname: string): LocationSlug | null {
  if (pathname.startsWith("/the-falls")) return "the-falls";
  if (pathname.startsWith("/appleton")) return "appleton";
  return null;
}
