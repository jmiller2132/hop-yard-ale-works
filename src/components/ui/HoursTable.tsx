"use client";

import { useEffect, useState } from "react";

interface DayRow {
  day: string;
  hours: string;
  closed?: boolean;
}

interface HoursTableProps {
  rows: DayRow[];
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function HoursTable({ rows }: HoursTableProps) {
  const [todayName, setTodayName] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })
    );
    setTodayName(DAY_NAMES[now.getDay()]);
  }, []);

  return (
    <table className="w-full border-collapse text-base sm:text-sm">
      <tbody>
        {rows.map(({ day, hours, closed }) => {
          const isToday = todayName === day;
          const todayBg = isToday ? { backgroundColor: "var(--color-green-strong)" } : undefined;
          return (
            <tr key={day}>
              <td
                className="py-2 pl-2.5 pr-4 font-medium"
                style={{
                  ...todayBg,
                  color: isToday ? "white" : "var(--color-ink)",
                  borderRadius: isToday ? "6px 0 0 6px" : undefined,
                }}
              >
                {day}
                {isToday && (
                  <span className="ml-2 text-xs opacity-75 font-normal">today</span>
                )}
              </td>
              <td
                className="py-2 pr-2.5"
                style={{
                  ...todayBg,
                  color: isToday ? "rgba(255,255,255,0.9)" : closed ? "var(--color-muted)" : "var(--color-ink)",
                  borderRadius: isToday ? "0 6px 6px 0" : undefined,
                }}
              >
                {hours}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
