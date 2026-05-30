import type { Metadata } from "next";
import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { locationBySlugQuery } from "@/lib/sanity/queries";
import { computeOpenClosed, isSunday } from "@/lib/hours";
import { LOCATION_STATIC_DATA } from "@/lib/location-data";
import OpenClosedBadge from "@/components/ui/OpenClosedBadge";
import type { Location } from "@/types";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Appleton — Hop Yard Ale Works",
  description:
    "Visit Hop Yard Ale Works in Appleton, WI. The original taproom — craft beer, wood-fired pizza, and great company at 512 W Northland Ave.",
};

export default async function AppletonPage() {
  const cms = await sanityClient
    .fetch<Location | null>(locationBySlugQuery, { slug: "appleton" })
    .catch(() => null);

  const location = cms ?? (LOCATION_STATIC_DATA["appleton"] as Location);
  const status = location?.hours ? computeOpenClosed(location) : null;
  const sunday = isSunday();

  const orderUrl =
    location?.orderOnlineUrl ??
    LOCATION_STATIC_DATA["appleton"].orderOnlineUrl!;

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex min-h-[50vh] items-end pb-10 pt-24 sm:min-h-[55vh]"
        style={{ backgroundColor: "var(--color-teal)" }}
      >
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6">
          <h1
            className="font-heading text-4xl font-bold text-white sm:text-5xl"
          >
            Appleton
          </h1>
          <p className="mt-2 text-white/80 text-lg">The original taproom.</p>

          {status && (
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <OpenClosedBadge status={status} />
              {sunday && (
                <span
                  className="text-sm font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "var(--color-gold)", color: "var(--color-ink)" }}
                >
                  Live music tonight
                </span>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/appleton-food-menu/"
              className="rounded-md px-4 py-2.5 text-sm font-semibold text-white min-h-[44px] flex items-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              View Food
            </Link>
            <Link
              href="/appleton-drinks-menu/"
              className="rounded-md px-4 py-2.5 text-sm font-semibold text-white min-h-[44px] flex items-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              View Drinks
            </Link>
            <Link
              href={orderUrl}
              className="rounded-md px-4 py-2.5 text-sm font-semibold min-h-[44px] flex items-center"
              style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
            >
              Order Online
            </Link>
          </div>
        </div>
      </section>

      {/* Hours + Address */}
      <section className="section-padding">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="font-heading text-2xl font-bold mb-4" style={{ color: "var(--color-teal)" }}>
                Hours
              </h2>
              <ul className="space-y-1 text-sm" style={{ color: "var(--color-ink)" }}>
                <li>Wed–Sat &nbsp;&nbsp;11 AM–10 PM</li>
                <li>Sun &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;12–6 PM</li>
                <li style={{ color: "var(--color-muted)" }}>Mon–Tue &nbsp;Closed</li>
              </ul>
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold mb-4" style={{ color: "var(--color-teal)" }}>
                Find Us
              </h2>
              <address className="not-italic text-sm leading-relaxed" style={{ color: "var(--color-ink)" }}>
                512 W Northland Ave<br />
                Appleton, WI 54911
              </address>
              <p className="mt-3">
                <a
                  href="https://maps.app.goo.gl/9N2389HKdPiMQgzL7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline underline-offset-2"
                  style={{ color: "var(--color-seasonal-cta)" }}
                >
                  Get directions →
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
