import type { Event } from "@/types";

const DEFAULT_DURATION_MINUTES = 120;

type Clock = { hours: number; minutes: number; period?: "AM" | "PM" };

function parseClock(raw: string, fallbackPeriod?: "AM" | "PM"): Clock | null {
  const match = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;
  const period = (match[3]?.toUpperCase() as "AM" | "PM" | undefined) ?? fallbackPeriod;
  let hours = Number(match[1]);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return { hours, minutes: Number(match[2] ?? 0), period };
}

function parseTimeRange(time: string): { start: Clock; end?: Clock } | null {
  const [startRaw, endRaw] = time.split(/\s*[-–—]\s*/);
  const end = endRaw ? parseClock(endRaw) : null;
  const start = parseClock(startRaw, end?.period);
  if (!start) return null;
  const startHadPeriod = /AM|PM/i.test(startRaw);
  if (end && !startHadPeriod) {
    // "9 – 1 AM" means 9 PM: pick whichever half of the day gives a span under 12 hours.
    const gap = (end.hours * 60 + end.minutes - (start.hours * 60 + start.minutes) + 1440) % 1440;
    if (gap >= 720) start.hours = (start.hours + 12) % 24;
  }
  return { start, end: end ?? undefined };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Dates are built in UTC purely as naive wall-clock arithmetic; the TZID on output carries the real zone.
function toStamp(d: Date, withTime: boolean) {
  const date = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
  return withTime ? `${date}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00` : date;
}

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function fold(line: string) {
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 73) parts.push(line.slice(i, i + 73));
  return parts.join("\r\n ");
}

export function buildIcs(event: Event): string {
  const [y, m, d] = event.date.split("-").map(Number);
  const range = event.time ? parseTimeRange(event.time) : null;

  let dtStart: string;
  let dtEnd: string;
  if (range) {
    const start = new Date(Date.UTC(y, m - 1, d, range.start.hours, range.start.minutes));
    let end = range.end
      ? new Date(Date.UTC(y, m - 1, d, range.end.hours, range.end.minutes))
      : new Date(start.getTime() + DEFAULT_DURATION_MINUTES * 60_000);
    if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60_000);
    dtStart = `DTSTART;TZID=America/Chicago:${toStamp(start, true)}`;
    dtEnd = `DTEND;TZID=America/Chicago:${toStamp(end, true)}`;
  } else {
    const start = new Date(Date.UTC(y, m - 1, d));
    const end = new Date(Date.UTC(y, m - 1, d + 1));
    dtStart = `DTSTART;VALUE=DATE:${toStamp(start, false)}`;
    dtEnd = `DTEND;VALUE=DATE:${toStamp(end, false)}`;
  }

  const url = event.ticketUrl ?? event.externalUrl;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hop Yard Ale Works//Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event._id}@hopyardaleworks.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    dtStart,
    dtEnd,
    `SUMMARY:${escapeText(event.title)}`,
    event.description && `DESCRIPTION:${escapeText(event.description)}`,
    event.location && `LOCATION:${escapeText(event.location.name)}`,
    url && `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean) as string[];

  return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadIcs(event: Event) {
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "event"}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}
