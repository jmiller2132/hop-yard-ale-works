"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LOCATIONS, addressLines, hoursSummary, type LocationSlug } from "@/lib/location-data";
import { SOCIAL_LINKS } from "@/lib/site";
import type { GlobalConfig } from "@/types";

interface GlobalFooterProps {
  config?: GlobalConfig | null;
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Appleton", href: "/appleton/" },
  { label: "Menomonee Falls", href: "/the-falls/" },
  { label: "Events", href: "/events/" },
  { label: "About", href: "/about/" },
  { label: "FAQ", href: "/faq/" },
  { label: "Contact", href: "/contact/" },
  { label: "Jobs", href: "/apply/" },
  { label: "Privacy", href: "/privacy-policy/" },
];

const FOOTER_LOCATIONS: { slug: LocationSlug; heading: string }[] = [
  { slug: "appleton", heading: "Appleton" },
  { slug: "the-falls", heading: "Menomonee Falls" },
];

export default function GlobalFooter({ config }: GlobalFooterProps) {
  const [footerMessage, setFooterMessage] = useState<string | null>(null);
  useEffect(() => {
    // Pick a random footer message per page load. Messages come only from
    // Sanity (Global Config → Footer Messages); nothing renders if none are set.
    const messages =
      config?.footerMessages?.map((m) => m.text).filter(Boolean) ?? [];
    if (messages.length === 0) return;
    const idx = Math.floor(Math.random() * messages.length);
    setFooterMessage(messages[idx] ?? null);
  }, [config]);

  return (
    <footer
      className="mt-auto"
      style={{ backgroundColor: "var(--color-ink)", color: "var(--color-warm-white)" }}
    >
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {FOOTER_LOCATIONS.map(({ slug, heading }) => {
            const [street, cityLine] = addressLines(slug);
            return (
              <div key={slug}>
                <h3
                  className="mb-3 font-heading text-base font-semibold tracking-wide uppercase"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {heading}
                </h3>
                <address className="not-italic text-sm leading-relaxed opacity-90">
                  {street}<br />
                  {cityLine}
                </address>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 text-sm leading-relaxed opacity-85">
                  {hoursSummary(slug).map((line) => (
                    <div key={line.days} className="contents">
                      <dt>{line.days}</dt>
                      <dd>{line.hours}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <a
                    href={LOCATIONS[slug].orderOnlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 opacity-90 hover:opacity-100"
                  >
                    Order online
                  </a>
                  <a
                    href={LOCATIONS[slug].googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 opacity-90 hover:opacity-100"
                  >
                    Directions
                  </a>
                </p>
              </div>
            );
          })}

          {/* Navigation */}
          <div>
            <h3
              className="mb-3 font-heading text-base font-semibold tracking-wide uppercase"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Navigate
            </h3>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3
              className="mb-3 font-heading text-base font-semibold tracking-wide uppercase"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Stay in the Loop
            </h3>
            {/* TODO: add an email signup once a newsletter provider is connected. */}
            <p className="text-sm opacity-85">
              Follow us for events and new taps.
            </p>

            {/* Social links */}
            <div className="mt-4 flex items-center gap-4">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-70 hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={s.label}
                >
                  <SocialIcon icon={s.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar — extra bottom padding keeps the fixed chat button and
          late-night strip from covering it */}
      <div
        className="border-t px-4 pt-4 pb-32 sm:px-6 md:pb-24"
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs sm:flex-row">
          <p className="opacity-60">&copy; {new Date().getFullYear()} Hop Yard Ale Works. All rights reserved.</p>
          {footerMessage && (
            <p className="italic opacity-60">{footerMessage}</p>
          )}
          <a
            href="/pour/"
            className="opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Play Tap Rush"
          >
            🍺
          </a>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }: { icon: string }) {
  const size = 20;
  if (icon === "facebook") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }
  if (icon === "instagram") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    );
  }
  if (icon === "untappd") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3l1.5 4.5H18l-3.5 2.5 1.5 4.5L12 14l-4 2.5 1.5-4.5L6 9.5h4.5z" />
      </svg>
    );
  }
  if (icon === "linktree") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.953 15.066c-.08.163-.08.324-.08.486.08.891.81 1.539 1.701 1.539h.243l3.727-.054v3.402c0 .972.729 1.782 1.701 1.782.973 0 1.702-.81 1.702-1.782v-3.402l3.726.054h.244c.891 0 1.62-.648 1.7-1.539 0-.162 0-.323-.08-.486l-1.863-3.482 1.863-.054c.891-.027 1.593-.756 1.566-1.647-.027-.864-.756-1.566-1.62-1.566l-3.645.054 2.16-3.78c.459-.81.162-1.836-.648-2.295a1.67 1.67 0 0 0-2.268.621l-2.457 4.267-2.457-4.267a1.675 1.675 0 0 0-2.268-.621c-.81.459-1.107 1.485-.648 2.295l2.16 3.78-3.645-.054c-.864 0-1.593.702-1.62 1.566-.027.891.675 1.62 1.566 1.647l1.863.054-1.863 3.482z"/>
      </svg>
    );
  }
  return null;
}
