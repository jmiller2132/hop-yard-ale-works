"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface WeatherNudge {
  message: string;
}

const SESSION_KEY = "hopyard_weather_nudge_v2";

function getWeatherMessage(temp: number, weathercode: number): string | null {
  const isRainy = [51,53,55,61,63,65,80,81,82].includes(weathercode);
  const isSnowy = [71,73,75,77,85,86].includes(weathercode);

  if (isSnowy) return `${temp}°F and snowing. Cold outside. Not in here.`;
  if (isRainy) return `${temp}°F and raining. The patio's still open if you're brave.`;
  if (temp <= 32) return `${temp}°F out there. Porter weather.`;
  if (temp <= 50) return `${temp}°F — a little crisp. Something dark and smooth sounds right.`;
  if (temp <= 65) return `${temp}°F out there. A good day for a pint.`;
  if (temp <= 79) return `${temp}°F — solid patio weather.`;
  return `${temp}°F out there. Something hazy sounds right.`;
}

async function fetchNudge(): Promise<WeatherNudge | null> {
  try {
    // Get rough location from IP (no key required)
    const geoRes = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
    const geo = await geoRes.json();
    if (!geo.latitude || !geo.longitude) return null;

    const wxRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&current_weather=true&temperature_unit=fahrenheit`,
      { signal: AbortSignal.timeout(4000) }
    );
    const wx = await wxRes.json();
    const temp: number = wx?.current_weather?.temperature;
    const code: number = wx?.current_weather?.weathercode;
    if (temp == null) return null;

    const message = getWeatherMessage(Math.round(temp), code);
    return message ? { message } : null;
  } catch {
    return null;
  }
}

interface WeatherNudgeProps {
  drinksHref?: string;
}

export default function WeatherNudge({ drinksHref }: WeatherNudgeProps) {
  const [nudge, setNudge] = useState<WeatherNudge | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      setNudge(cached === "null" ? null : JSON.parse(cached));
      setLoaded(true);
      return;
    }

    fetchNudge().then((result) => {
      sessionStorage.setItem(SESSION_KEY, result ? JSON.stringify(result) : "null");
      setNudge(result);
      setLoaded(true);
    });
  }, []);

  if (!loaded || !nudge) return null;

  return (
    <p
      className="text-sm mt-3"
      style={{ color: "var(--color-muted)" }}
    >
      {nudge.message}{" "}
      {drinksHref && (
        <Link
          href={drinksHref}
          className="underline underline-offset-2 hover:opacity-70 transition-opacity"
          style={{ color: "var(--color-ink)" }}
        >
          See what&apos;s pouring →
        </Link>
      )}
    </p>
  );
}
