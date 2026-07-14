"use client";

import { useState, useEffect } from "react";
import { computeOpenClosed } from "@/lib/hours";
import OpenClosedBadge from "./OpenClosedBadge";
import type { DayHours, HolidayOverride } from "@/types";

interface LocationHoursData {
  hours?: DayHours[];
  sundayHours?: { open: string; close: string; isClosed: boolean };
  holidayOverrides?: HolidayOverride[];
}

interface OpenClosedBadgeLiveProps {
  location: LocationHoursData;
  className?: string;
}

/**
 * Computes open/closed status on the client so the badge always reflects
 * the real current time, regardless of server-render or page cache age.
 */
export default function OpenClosedBadgeLive({
  location,
  className,
}: OpenClosedBadgeLiveProps) {
  const [status, setStatus] = useState<{ isOpen: boolean; label: string } | null>(null);

  useEffect(() => {
    if (!location.hours) return;

    const compute = () => setStatus(computeOpenClosed(location as Parameters<typeof computeOpenClosed>[0]));
    compute();

    // Re-check every minute so the badge flips at the right time
    const interval = setInterval(compute, 60_000);
    return () => clearInterval(interval);
  }, [location]);

  if (!status) return null;
  return <OpenClosedBadge status={status} className={className} />;
}
