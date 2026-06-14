"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface WeatherNudge {
  message: string;
}

const SESSION_KEY = "hopyard_weather_nudge_v2";

function getSeason(month: number): "winter" | "spring" | "summer" | "fall" {
  if (month <= 1 || month === 11) return "winter"; // Dec, Jan, Feb
  if (month <= 4) return "spring";                  // Mar, Apr, May
  if (month <= 7) return "summer";                  // Jun, Jul, Aug
  return "fall";                                     // Sep, Oct, Nov
}

function getWeatherMessage(temp: number, weathercode: number): string | null {
  const isRainy = [51,53,55,61,63,65,80,81,82].includes(weathercode);
  const isSnowy = [71,73,75,77,85,86].includes(weathercode);
  const season = getSeason(new Date().getMonth());

  if (isSnowy) return `${temp}°F and snowing. Cold outside. Not in here.`;

  if (isRainy) {
    if (season === "summer") return `${temp}°F and raining. Summer shower. Patio might be a gamble.`;
    return `${temp}°F and raining. The patio's still open if you're brave.`;
  }

  if (temp <= 32) return `${temp}°F out there. Porter weather.`;

  if (temp <= 50) {
    if (season === "spring") return `${temp}°F — still thawing out. A good excuse to warm up inside.`;
    if (season === "fall")   return `${temp}°F — fall is settling in. Something darker sounds right.`;
    return `${temp}°F out there. Something warm and dark sounds right.`;
  }

  if (temp <= 65) {
    if (season === "spring") return `${temp}°F in ${season} — basically shorts weather around here.`;
    if (season === "summer") return `${temp}°F in summer. A little cool, but the beer's still cold.`;
    if (season === "fall")   return `${temp}°F — classic fall day. Good pint weather.`;
    return `${temp}°F out there. A good day for a pint.`;
  }

  if (temp <= 79) {
    if (season === "fall")   return `${temp}°F in fall? Make the most of it. Patio's open.`;
    if (season === "winter") return `${temp}°F in winter?? Patio's open. We're not asking questions.`;
    return `${temp}°F — solid patio weather.`;
  }

  // 80+
  if (season === "fall") return `${temp}°F in fall. Rare one. Get out here.`;
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
