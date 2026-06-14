"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { GlobalConfig } from "@/types";

interface GlobalFooterProps {
  config?: GlobalConfig | null;
}

// Footer icon strip — real PNG icons, tinted via CSS filter
const BASE_ICONS = [
  { id: "pint",      src: "/icons/pint.png",      label: "Pint glass" },
  { id: "hops",      src: "/icons/hops.png",      label: "Hop cone" },
  { id: "wheat",     src: "/icons/wheat.png",     label: "Wheat" },
  { id: "barrel",    src: "/icons/barrel.png",    label: "Barrel" },
  { id: "bottle",    src: "/icons/bottle.png",    label: "Beer bottle" },
  { id: "pizza",     src: "/icons/pizza.png",     label: "Pizza" },
  { id: "pretzel",   src: "/icons/pretzel.png",   label: "Pretzel" },
  { id: "wisconsin", src: "/icons/wisconsin.png", label: "Wisconsin" },
  { id: "water",     src: "/icons/water.png",     label: "Water drop" },
];

const SEASONAL_ICON_MAP: Record<string, { src: string; label: string }> = {
  halloween:    { src: "/icons/snowflake.png", label: "Snowflake" },
  christmas:    { src: "/icons/snowflake.png", label: "Snowflake" },
  summerBright: { src: "/icons/sun.png",       label: "Sun" },
  fourthOfJuly: { src: "/icons/sun.png",       label: "Sun" },
  oktoberfest:  { src: "/icons/mapleleaf.png", label: "Maple leaf" },
  stPatricks:   { src: "/icons/water.png",     label: "Water drop" },
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
    const themeAttr = document.documentElement.getAttribute("data-theme");
    setActiveTheme(themeAttr);
  }, [config]);

  // Build strip: base icons + seasonal icon if applicable, tripled for seamless loop
  const stripIcons = [...BASE_ICONS];
  const seasonalIcon = activeTheme ? SEASONAL_ICON_MAP[activeTheme] : null;
  if (seasonalIcon) stripIcons.push({ id: "seasonal", ...seasonalIcon });
  const tileList = [...stripIcons, ...stripIcons, ...stripIcons];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValue.trim()) return;
    // TODO: wire to Mailchimp API
    setEmailSubmitted(true);
  };

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
        className="overflow-hidden"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        aria-hidden="true"
      >
        <div
          className="relative flex"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          }}
        >
          <div className="flex animate-marquee will-change-transform items-center" style={{ gap: "40px", padding: "20px 0" }}>
            {tileList.map((icon, i) => (
              <img
                key={`${icon.id}-${i}`}
                src={icon.src}
                alt={icon.label}
                width={36}
                height={36}
                className="flex-shrink-0"
                style={{
                  filter: "brightness(0) invert(1)",
                  opacity: 0.45,
                  objectFit: "contain",
                }}
              />
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
