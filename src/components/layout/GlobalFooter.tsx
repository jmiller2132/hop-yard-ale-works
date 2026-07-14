"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { GlobalConfig } from "@/types";

interface GlobalFooterProps {
  config?: GlobalConfig | null;
}

// Marquee tile definitions — colorful SVG tiles inspired by the Cross reference
interface TileDef {
  bg: string;
  icon: "hops" | "pint" | "wheat" | "barrel" | "pizza" | "flame" | "star" | "diamond" | "wave" | "pretzel" | "leaf" | "mug";
  fg: string;
}

const MARQUEE_TILES: TileDef[] = [
  { bg: "#6ABF4B", icon: "hops",     fg: "#231F20" },
  { bg: "#231F20", icon: "pint",     fg: "#6ABF4B" },
  { bg: "#C94B2A", icon: "flame",    fg: "#F5F2EE" },
  { bg: "#2D4F54", icon: "wheat",    fg: "#D4A017" },
  { bg: "#D4A017", icon: "star",     fg: "#231F20" },
  { bg: "#F5F2EE", icon: "pizza",    fg: "#C94B2A" },
  { bg: "#6ABF4B", icon: "barrel",   fg: "#F5F2EE" },
  { bg: "#2D4F54", icon: "mug",      fg: "#6ABF4B" },
  { bg: "#C94B2A", icon: "pretzel",  fg: "#F5F2EE" },
  { bg: "#D4A017", icon: "diamond",  fg: "#2D4F54" },
  { bg: "#231F20", icon: "wave",     fg: "#D4A017" },
  { bg: "#F5F2EE", icon: "leaf",     fg: "#2D4F54" },
];

function MarqueeTile({ tile }: { tile: TileDef }) {
  const S = 72;
  return (
    <div
      style={{
        width: S,
        height: S,
        backgroundColor: tile.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: 4,
      }}
    >
      <TileIcon type={tile.icon} fg={tile.fg} bg={tile.bg} size={36} />
    </div>
  );
}

function TileIcon({ type, fg, bg, size }: { type: TileDef["icon"]; fg: string; bg: string; size: number }) {
  const s = size;
  switch (type) {
    case "hops":
      return (
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
          <ellipse cx="18" cy="10" rx="5" ry="7" fill={fg} opacity="0.9"/>
          <ellipse cx="11" cy="20" rx="5" ry="7" fill={fg} opacity="0.7"/>
          <ellipse cx="25" cy="20" rx="5" ry="7" fill={fg} opacity="0.7"/>
          <line x1="18" y1="10" x2="18" y2="32" stroke={fg} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="11" y1="20" x2="18" y2="26" stroke={fg} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="25" y1="20" x2="18" y2="26" stroke={fg} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case "pint":
      return (
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
          <path d="M12 6h12l-2 22H14L12 6z" fill={fg} opacity="0.9"/>
          <path d="M13 12h10" stroke={fg} strokeWidth="0" opacity="0"/>
          <rect x="12" y="6" width="12" height="4" rx="1" fill={fg}/>
          <ellipse cx="18" cy="16" rx="4" ry="2" fill={fg} opacity="0.3"/>
        </svg>
      );
    case "wheat":
      return (
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
          <line x1="18" y1="30" x2="18" y2="6" stroke={fg} strokeWidth="2" strokeLinecap="round"/>
          <ellipse cx="18" cy="9"  rx="3" ry="4" fill={fg}/>
          <ellipse cx="13" cy="14" rx="3" ry="4" fill={fg} transform="rotate(-30 13 14)"/>
          <ellipse cx="23" cy="14" rx="3" ry="4" fill={fg} transform="rotate(30 23 14)"/>
          <ellipse cx="13" cy="21" rx="3" ry="4" fill={fg} transform="rotate(-30 13 21)"/>
          <ellipse cx="23" cy="21" rx="3" ry="4" fill={fg} transform="rotate(30 23 21)"/>
        </svg>
      );
    case "barrel":
      return (
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
          <rect x="10" y="8" width="16" height="20" rx="6" fill={fg} opacity="0.9"/>
          <line x1="10" y1="14" x2="26" y2="14" stroke={bg} strokeWidth="1.5"/>
          <line x1="10" y1="22" x2="26" y2="22" stroke={bg} strokeWidth="1.5"/>
          <line x1="18" y1="8"  x2="18" y2="28" stroke={bg} strokeWidth="1.5"/>
        </svg>
      );
    case "pizza":
      return (
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
          <path d="M18 6 L30 28 L6 28 Z" fill={fg} opacity="0.9"/>
          <circle cx="18" cy="22" r="2" fill={bg}/>
          <circle cx="14" cy="17" r="1.5" fill={bg}/>
          <circle cx="22" cy="17" r="1.5" fill={bg}/>
        </svg>
      );
    case "flame":
      return (
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
          <path d="M18 6c0 0-8 8-8 16a8 8 0 0 0 16 0c0-4-3-7-3-7s-1 4-3 4c-2 0-2-3-2-3s-2 3-2 5a4 4 0 0 0 8 0c0-2-1-4-1-4s4 2 4 6" fill={fg} opacity="0.9"/>
          <path d="M18 8c0 0-6 7-6 14a6 6 0 0 0 12 0c0-3-2-5-2-5s-1 3-2 3c-1.5 0-2-2-2-2s-1 2-1 4a3 3 0 0 0 6 0" fill={fg}/>
        </svg>
      );
    case "star":
      return (
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
          <polygon points="18,5 21,14 30,14 23,20 26,29 18,23 10,29 13,20 6,14 15,14" fill={fg}/>
        </svg>
      );
    case "diamond":
      return (
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
          <rect x="10" y="10" width="16" height="16" rx="2" fill={fg} opacity="0.9" transform="rotate(45 18 18)"/>
          <rect x="14" y="14" width="8" height="8" rx="1" fill={bg} transform="rotate(45 18 18)"/>
        </svg>
      );
    case "wave":
      return (
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
          <path d="M4 18c3-6 5-6 7 0s4 6 7 0 4-6 7 0 4 6 7 0" stroke={fg} strokeWidth="3" strokeLinecap="round" fill="none"/>
          <path d="M4 24c3-6 5-6 7 0s4 6 7 0 4-6 7 0 4 6 7 0" stroke={fg} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
          <path d="M4 12c3-6 5-6 7 0s4 6 7 0 4-6 7 0 4 6 7 0" stroke={fg} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
        </svg>
      );
    case "pretzel":
      return (
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
          <path d="M18 8c-5 0-8 3-8 7 0 3 2 5 5 5l3-5 3 5c3 0 5-2 5-5 0-4-3-7-8-7z" fill={fg} opacity="0.9"/>
          <path d="M13 20c-1 2-1 4 1 5s4 0 4-2" stroke={fg} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M23 20c1 2 1 4-1 5s-4 0-4-2" stroke={fg} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        </svg>
      );
    case "leaf":
      return (
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
          <path d="M18 30 C18 30 8 22 8 13 C8 8 13 5 18 8 C23 5 28 8 28 13 C28 22 18 30 18 30Z" fill={fg} opacity="0.9"/>
          <line x1="18" y1="30" x2="18" y2="14" stroke={bg} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="18" y1="20" x2="13" y2="16" stroke={bg} strokeWidth="1" strokeLinecap="round"/>
          <line x1="18" y1="20" x2="23" y2="16" stroke={bg} strokeWidth="1" strokeLinecap="round"/>
        </svg>
      );
    case "mug":
      return (
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
          <rect x="8" y="10" width="16" height="18" rx="2" fill={fg} opacity="0.9"/>
          <path d="M24 14 C28 14 30 16 30 19 C30 22 28 24 24 24" stroke={fg} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <rect x="8" y="10" width="16" height="4" rx="2" fill={fg}/>
          <rect x="11" y="18" width="4" height="6" rx="1" fill={bg} opacity="0.4"/>
        </svg>
      );
    default:
      return null;
  }
}

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
  useEffect(() => {
    // Pick a random footer message per page load
    const messages =
      config?.footerMessages?.map((m) => m.text).filter(Boolean) ??
      DEFAULT_FOOTER_MESSAGES;
    const idx = Math.floor(Math.random() * messages.length);
    setFooterMessage(messages[idx] ?? null);
  }, [config]);

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
        <div className="flex animate-marquee will-change-transform" style={{ width: "max-content" }}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" style={{ gap: "6px", padding: "6px 6px 6px 0" }}>
              {MARQUEE_TILES.map((tile, i) => (
                <MarqueeTile key={`${copy}-${i}`} tile={tile} />
              ))}
            </div>
          ))}
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
