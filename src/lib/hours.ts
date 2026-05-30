import type { Location, OpenClosedStatus } from "@/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [time, period] = timeStr.trim().split(" ");
  const [h, m] = time.split(":").map(Number);
  let hours = h;
  if (period?.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (period?.toUpperCase() === "AM" && hours === 12) hours = 0;
  return { hours, minutes: m ?? 0 };
}

function timeToMinutes(timeStr: string): number {
  const { hours, minutes } = parseTime(timeStr);
  return hours * 60 + minutes;
}

export function computeOpenClosed(location: Location): OpenClosedStatus {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })
  );

  const dayOfWeek = now.getDay();
  const dayName = DAYS[dayOfWeek];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayDate = now.toISOString().split("T")[0];

  // Check holiday override
  const holiday = location.holidayOverrides?.find((o) => o.date === todayDate);
  if (holiday) {
    return {
      isOpen: false,
      label: `Closed · ${holiday.label}${holiday.hoursNote ? ` (${holiday.hoursNote})` : ""}`,
    };
  }

  // Use Sunday hours if today is Sunday and sundayHours is defined
  const useSundayHours = dayOfWeek === 0 && location.sundayHours;
  const hoursToday = useSundayHours
    ? location.sundayHours!
    : location.hours?.find((h) => h.day === dayName);

  if (!hoursToday || hoursToday.isClosed) {
    // Find next open day
    const nextOpen = findNextOpenDay(location, dayOfWeek);
    return { isOpen: false, label: `Closed · Opens ${nextOpen}` };
  }

  const openMinutes = timeToMinutes(hoursToday.open);
  const closeMinutes = timeToMinutes(hoursToday.close);

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return { isOpen: true, label: "Open Now" };
  }

  if (currentMinutes < openMinutes) {
    return { isOpen: false, label: `Closed · Opens today at ${hoursToday.open}` };
  }

  // Past closing — find next open day
  const nextOpen = findNextOpenDay(location, dayOfWeek);
  return { isOpen: false, label: `Closed · Opens ${nextOpen}` };
}

function findNextOpenDay(location: Location, currentDayIndex: number): string {
  for (let i = 1; i <= 7; i++) {
    const nextIndex = (currentDayIndex + i) % 7;
    const nextDay = DAYS[nextIndex];
    const isSunday = nextIndex === 0;
    const nextHours = isSunday && location.sundayHours
      ? location.sundayHours
      : location.hours?.find((h) => h.day === nextDay);
    if (nextHours && !nextHours.isClosed) {
      const label = i === 1 ? "tomorrow" : nextDay;
      return `${label} at ${nextHours.open}`;
    }
  }
  return "soon";
}

export function isLateNight(): boolean {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })
  );
  const hour = now.getHours();
  return hour >= 0 && hour < 5;
}

export function isSunday(): boolean {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })
  );
  return now.getDay() === 0;
}
