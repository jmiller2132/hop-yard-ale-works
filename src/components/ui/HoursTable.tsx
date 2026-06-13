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
    <table className="w-full text-sm border-separate" style={{ borderSpacing: "0 2px" }}>
      <tbody>
        {rows.map(({ day, hours, closed }) => {
          const isToday = todayName === day;
          return (
            <tr
              key={day}
              className="rounded-lg"
          style={
            isToday
              ? {
                  backgroundColor: "var(--color-green)",
                  color: "white",
                  borderRadius: "6px",
                }
              : {}
          }
            >
              <td
                className="py-1.5 pl-2.5 pr-4 rounded-l-lg font-medium"
                style={{ color: isToday ? "white" : "var(--color-ink)" }}
              >
                {day}
                {isToday && (
                  <span className="ml-2 text-xs opacity-75 font-normal">today</span>
                )}
              </td>
              <td
                className="py-1.5 pr-2.5 rounded-r-lg"
                style={{ color: isToday ? "rgba(255,255,255,0.9)" : closed ? "var(--color-muted)" : "var(--color-ink)" }}
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
