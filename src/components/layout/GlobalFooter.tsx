"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { GlobalConfig } from "@/types";

interface GlobalFooterProps {
  config?: GlobalConfig | null;
}

// Footer icon strip — base icons using inline SVG paths
// All icons use currentColor so they can be tinted
const FOOTER_ICONS = [
  {
    id: "pint",
    label: "Pint glass",
    path: "M6 2h12l-2 18H8L6 2zm4 6h4m-4 4h4",
  },
  {
    id: "hops",
    label: "Hop cone",
    path: "M12 3C8 3 5 7 5 12s3 9 7 9 7-4 7-9-3-9-7-9zm0 0v18M9 7.5c1 1 2 1.5 3 1.5M15 7.5c-1 1-2 1.5-3 1.5M9 12c1 1 2 1.5 3 1.5M15 12c-1 1-2 1.5-3 1.5M9 16c1 1 2 1.5 3 1.5M15 16c-1 1-2 1.5-3 1.5",
  },
  {
    id: "wheat",
    label: "Wheat stalk",
    path: "M12 21V5M9 8l3-3 3 3M9 12l3-3 3 3M9 16l3-3 3 3M6 19l6-6 6 6",
  },
  {
    id: "barrel",
    label: "Barrel",
    path: "M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 4h10M7 16h10M12 4v16",
  },
  {
    id: "bottle",
    label: "Beer bottle",
    path: "M9 2v5l-2 3v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V10L15 7V2H9zm0 0h6m-6 5h6",
  },
  {
    id: "pizza",
    label: "Pizza slice",
    path: "M12 2L3 20h18L12 2zm0 0v18M7 14h10",
  },
  {
    id: "pretzel",
    label: "Pretzel",
    path: "M12 4C9 4 7 6 7 9c0 2 1 3 2 4l-3 4a4 4 0 0 0 7 0l1-1 1 1a4 4 0 0 0 7 0l-3-4c1-1 2-2 2-4 0-3-2-5-5-5h-4z",
  },
  {
    id: "wisconsin",
    label: "Wisconsin",
    path: "M4 6l2-1 1 1h2l1-2 2 1 1-1h3l1 2 1-1 1 1-1 3-1 1v2l1 1-1 2-2 1-1 2-2 1-2-1-1 1-1-1v-2l-2-1V9l1-1-1-2z",
  },
];

// Seasonal icons — only shown when a matching theme is active
const SEASONAL_ICONS: Record<string, { id: string; label: string; path: string }> = {
  halloween: {
    id: "snowflake",
    label: "Snowflake",
    path: "M12 2v20M2 12h20M5 5l14 14M19 5L5 19",
  },
  christmas: {
    id: "snowflake",
    label: "Snowflake",
    path: "M12 2v20M2 12h20M5 5l14 14M19 5L5 19",
  },
  summerBright: {
    id: "sun",
    label: "Sun",
    path: "M12 2v2M12 20v2M2 12h2M20 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  },
  fourthOfJuly: {
    id: "sun",
    label: "Sun",
    path: "M12 2v2M12 20v2M2 12h2M20 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  },
  oktoberfest: {
    id: "mapleleaf",
    label: "Maple leaf",
    path: "M12 2l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5z",
  },
  stPatricks: {
    id: "raindrop",
    label: "Raindrop",
    path: "M12 3C12 3 6 10 6 14a6 6 0 0 0 12 0c0-4-6-11-6-11z",
  },
};

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Appleton", href: "/appleton/" },
  { label: "The Falls", href: "/the-falls/" },
  { label: "Events", href: "/events/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
  { label: "Apply", href: "/apply/" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/hopyardaleworks/", icon: "instagram" },
  { label: "Facebook", href: "https://www.facebook.com/hopyardaleworks/", icon: "facebook" },
  { label: "Untappd", href: "https://untappd.com/HopYardAleWorks", icon: "untappd" },
  { label: "Linktree", href: "https://linktr.ee/hopyardaleworks", icon: "linktree" },
];

const DEFAULT_FOOTER_MESSAGES = [
  "Thanks for supporting local.",
  "See you at the bar.",
  "Pizza + Pints = Perfect Night.",
  "Brewed in Wisconsin. Loved everywhere.",
  "We'll save you a stool.",
];

export default function GlobalFooter({ config }: GlobalFooterProps) {
  const [footerMessage, setFooterMessage] = useState<string | null>(null);
  const [emailValue, setEmailValue] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);

  useEffect(() => {
    // Pick a random footer message per page load
    const messages =
      config?.footerMessages?.map((m) => m.text).filter(Boolean) ??
      DEFAULT_FOOTER_MESSAGES;
    const idx = Math.floor(Math.random() * messages.length);
    setFooterMessage(messages[idx] ?? null);

    // Read theme from DOM data attribute
    const themeAttr = document.documentElement.getAttribute("data-theme");
    setActiveTheme(themeAttr);
  }, [config]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValue.trim()) return;
    // TODO: wire to Mailchimp API
    setEmailSubmitted(true);
  };

  // Build the icon strip: base icons + seasonal icon at end if applicable
  const iconStrip = [...FOOTER_ICONS];
  const seasonalIcon = activeTheme ? SEASONAL_ICONS[activeTheme] : null;
  if (seasonalIcon) iconStrip.push(seasonalIcon);

  // Triplicate for seamless scroll loop
  const iconList = [...iconStrip, ...iconStrip, ...iconStrip];

  return (
    <footer
      className="mt-auto"
      style={{ backgroundColor: "var(--color-ink)", color: "var(--color-warm-white)" }}
    >
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Appleton */}
          <div>
            <h3
              className="mb-3 font-heading text-base font-semibold tracking-wide uppercase"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Appleton
            </h3>
            <address className="not-italic text-sm leading-relaxed opacity-85">
              512 W Northland Ave<br />
              Appleton, WI 54911
            </address>
            <p className="mt-3 text-xs opacity-70 leading-relaxed">
              Wed–Sat &nbsp;11 AM–10 PM<br />
              Sun &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;12–6 PM<br />
              Mon–Tue &nbsp;Closed
            </p>
          </div>

          {/* Menomonee Falls */}
          <div>
            <h3
              className="mb-3 font-heading text-base font-semibold tracking-wide uppercase"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Menomonee Falls
            </h3>
            <address className="not-italic text-sm leading-relaxed opacity-85">
              N88W16521 Main St<br />
              Menomonee Falls, WI 53051
            </address>
            <p className="mt-3 text-xs opacity-70 leading-relaxed">
              Tue–Thu &nbsp;4–10 PM<br />
              Fri–Sat &nbsp;&nbsp;11 AM–10 PM<br />
              Sun–Mon Closed
            </p>
          </div>

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

          {/* Email signup + Social */}
          <div>
            <h3
              className="mb-3 font-heading text-base font-semibold tracking-wide uppercase"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Stay in the Loop
            </h3>
            {emailSubmitted ? (
              <p className="text-sm opacity-85">You're on the list. See you soon.</p>
            ) : (
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2">
                <label htmlFor="footer-email" className="text-sm opacity-80">
                  Get updates on events and new taps
                </label>
                <input
                  id="footer-email"
                  type="email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  placeholder="your@email.com"
                  className="rounded-md px-3 py-2 text-sm min-h-[44px]"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "var(--color-warm-white)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
                <button
                  type="submit"
                  className="rounded-md px-4 py-2 text-sm font-semibold min-h-[44px] transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: "var(--color-seasonal-cta)",
                    color: "white",
                  }}
                >
                  Subscribe
                </button>
              </form>
            )}

            {/* Social links */}
            <div className="mt-6 flex items-center gap-4">
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

      {/* Marquee icon strip */}
      <div
        className="border-t overflow-hidden"
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
        aria-hidden="true"
      >
        <div
          className="relative flex"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="flex animate-marquee gap-10 py-4 will-change-transform">
            {iconList.map((icon, i) => (
              <span
                key={`${icon.id}-${i}`}
                className="flex-shrink-0"
                style={{ color: "rgba(255,255,255,0.5)", opacity: 1 }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-label={icon.label}
                >
                  <path d={icon.path} />
                </svg>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t px-4 py-4 sm:px-6"
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs opacity-60 sm:flex-row">
          {footerMessage && (
            <p className="italic">{footerMessage}</p>
          )}
          <p>&copy; {new Date().getFullYear()} Hop Yard Ale Works. All rights reserved.</p>
          <a href="/pour/" className="hover:opacity-100 transition-opacity" style={{ opacity: 0.3 }}>
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
