import type { Metadata } from "next";
import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { locationBySlugQuery } from "@/lib/sanity/queries";
import { computeOpenClosed } from "@/lib/hours";
import { LOCATION_STATIC_DATA } from "@/lib/location-data";
import OpenClosedBadge from "@/components/ui/OpenClosedBadge";
import type { Location } from "@/types";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Menomonee Falls — Hop Yard Ale Works",
  description:
    "Visit Hop Yard Ale Works in Menomonee Falls, WI. Pizza-forward craft brewery at N88W16521 Main St.",
};

export default async function TheFallsPage() {
  const cms = await sanityClient
    .fetch<Location | null>(locationBySlugQuery, { slug: "the-falls" })
    .catch(() => null);

  const location = cms ?? (LOCATION_STATIC_DATA["the-falls"] as Location);
  const status = location?.hours ? computeOpenClosed(location) : null;

  const orderUrl =
    location?.orderOnlineUrl ??
    LOCATION_STATIC_DATA["the-falls"].orderOnlineUrl!;

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex min-h-[50vh] items-end pb-10 pt-24 sm:min-h-[55vh]"
        style={{ backgroundColor: "var(--color-teal)" }}
      >
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6">
          <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">
            Menomonee Falls
          </h1>
          <p className="mt-2 text-white/80 text-lg">
            Great beer. Great pizza. New to craft beer? We'll help.
          </p>

          {status && (
            <div className="mt-3">
              <OpenClosedBadge status={status} />
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/the-falls-food-menu/"
              className="rounded-md px-4 py-2.5 text-sm font-semibold text-white min-h-[44px] flex items-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              View Food
            </Link>
            <Link
              href="/the-falls-drinks-menu/"
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
                <li>Tue–Thu &nbsp;&nbsp;4–10 PM</li>
                <li>Fri–Sat &nbsp;&nbsp;&nbsp;11 AM–10 PM</li>
                <li style={{ color: "var(--color-muted)" }}>Sun–Mon Closed</li>
              </ul>
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold mb-4" style={{ color: "var(--color-teal)" }}>
                Find Us
              </h2>
              <address className="not-italic text-sm leading-relaxed" style={{ color: "var(--color-ink)" }}>
                N88W16521 Main St<br />
                Menomonee Falls, WI 53051
              </address>
              <p className="mt-3">
                <a
                  href="https://maps.app.goo.gl/DWFo5Du6CZfUqkt7A"
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
