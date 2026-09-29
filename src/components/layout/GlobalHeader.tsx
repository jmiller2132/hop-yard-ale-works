"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { urlFor } from "@/lib/sanity/client";
import {
  LOCATIONS,
  LOCATION_STORAGE_KEY,
  locationFromPath,
  readStoredLocation,
  type LocationSlug,
} from "@/lib/location-data";
import type { SeasonalTheme } from "@/types";

interface GlobalHeaderProps {
  activeTheme?: SeasonalTheme | null;
}

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

function otherLocation(slug: LocationSlug): LocationSlug {
  return slug === "appleton" ? "the-falls" : "appleton";
}

/** Same page type at the other location, e.g. /appleton-food-menu → /the-falls-food-menu/. */
function counterpartPath(path: string, from: LocationSlug): string {
  const to = otherLocation(from);
  const page = (Object.keys(LOCATIONS[from].paths) as (keyof typeof LOCATIONS.appleton.paths)[]).find(
    (key) => normalizePath(LOCATIONS[from].paths[key]) === path
  );
  return LOCATIONS[to].paths[page ?? "home"];
}

// Easter egg context messages by page type
const EASTER_EGG_CONTEXT: Record<string, string> = {
  drinks: "Research, we assume.",
  food: "Important decisions are being made.",
  location: "Planning your next move?",
};

const EASTER_EGG_POOL = [
  "You've earned… absolutely nothing. But respect.",
  "If you keep clicking, the beer gets colder.",
  "Somewhere, a pizza just got crispier.",
  "This is how the dough rises.",
  "You'd fit in here.",
  "This is how regulars start.",
  "We'll remember this.",
  "This counts as cardio.",
  "We didn't think anyone would actually do this.",
  "You're definitely not here for the menu anymore.",
  "This part of the website wasn't supposed to be interesting.",
];

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getPageType(path: string): string | null {
  if (path.includes("drinks")) return "drinks";
  if (path.includes("food")) return "food";
  if (path === "/appleton" || path === "/the-falls") return "location";
  return null;
}

export default function GlobalHeader({ activeTheme }: GlobalHeaderProps) {
  const pathname = usePathname();
  const path = normalizePath(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [menuPathname, setMenuPathname] = useState(pathname);
  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usedContextMessages = useRef<Set<string>>(new Set());
  const eggIndexRef = useRef(0);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const pathLocation = locationFromPath(path);

  // Remember the last location page visited so neutral pages keep that context.
  useEffect(() => {
    if (pathLocation) localStorage.setItem(LOCATION_STORAGE_KEY, pathLocation);
  }, [pathLocation]);
  const storedLocation = useSyncExternalStore(subscribeToStorage, readStoredLocation, () => null);

  const currentLocation: LocationSlug | null = pathLocation ?? storedLocation;

  // Close mobile menu on route change
  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setMenuOpen(false);
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    hamburgerRef.current?.focus();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleLogoClick = () => {
    logoClickCountRef.current += 1;

    if (logoClickTimerRef.current) {
      clearTimeout(logoClickTimerRef.current);
    }

    logoClickTimerRef.current = setTimeout(() => {
      logoClickCountRef.current = 0;
    }, 3000);

    if (logoClickCountRef.current >= 5) {
      logoClickCountRef.current = 0;
      if (logoClickTimerRef.current) clearTimeout(logoClickTimerRef.current);

      const pageType = getPageType(path);
      let message: string;

      if (
        pageType &&
        EASTER_EGG_CONTEXT[pageType] &&
        !usedContextMessages.current.has(pageType)
      ) {
        message = EASTER_EGG_CONTEXT[pageType];
        usedContextMessages.current.add(pageType);
      } else {
        const pool = [...EASTER_EGG_POOL];
        message = pool[eggIndexRef.current % pool.length];
        eggIndexRef.current += 1;
      }

      showToast(message);
    }
  };

  const navLocation = LOCATIONS[currentLocation ?? "appleton"];
  const navLinks = [
    { label: "Food", href: navLocation.paths.food },
    { label: "Drinks", href: navLocation.paths.drinks },
    { label: "Events", href: "/events/" },
    { label: "Visit", href: navLocation.paths.home },
  ];

  const switcher = currentLocation
    ? {
        current: LOCATIONS[currentLocation].navLabel,
        other: LOCATIONS[otherLocation(currentLocation)].navLabel,
        otherHref: pathLocation
          ? counterpartPath(path, pathLocation)
          : LOCATIONS[otherLocation(currentLocation)].paths.home,
      }
    : null;

  // Map theme palette → local seasonal logo
  const SEASONAL_LOGOS: Partial<Record<string, string>> = {
    halloween:    "/logos/halloween.png",
    christmas:    "/logos/christmas.png",
    fourthOfJuly: "/logos/fourthOfJuly.png",
  };

  const logoSrc =
    (activeTheme?.accentPalette && SEASONAL_LOGOS[activeTheme.accentPalette]) ??
    (activeTheme?.logoOverride
      ? urlFor(activeTheme.logoOverride).width(360).url()
      : "/logo.png");

  const isActive = (href: string) =>
    path === normalizePath(href) || path.startsWith(normalizePath(href) + "/");

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full border-b border-black/5"
        style={{ backgroundColor: "var(--color-warm-white)" }}
      >
        {/* Seasonal banner */}
        {activeTheme?.bannerMessage && (
          <div
            className="py-2 px-4 text-center text-sm font-medium text-white"
            style={{ backgroundColor: "var(--color-seasonal-cta)" }}
          >
            {activeTheme.bannerMessage}
          </div>
        )}

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex-shrink-0"
            aria-label="Hop Yard Ale Works home"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <Image
              src={logoSrc}
              alt="Hop Yard Ale Works"
              width={740}
              height={372}
              sizes="280px"
              className="w-auto object-contain"
              style={{ mixBlendMode: "multiply", maxHeight: "56px", maxWidth: "280px" }}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  isActive(link.href)
                    ? "text-[var(--color-seasonal-cta)]"
                    : "text-[var(--color-ink)] hover:text-[var(--color-seasonal-cta)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right side: location switcher + Order Online */}
          <div className="hidden items-center gap-4 md:flex">
            {switcher ? (
              <LocationSwitcher
                currentLabel={switcher.current}
                oppositeLabel={switcher.other}
                oppositePath={switcher.otherHref}
              />
            ) : (
              <LocationPicker />
            )}
            <OrderButton location={currentLocation} />
          </div>

          {/* Mobile: location badge (only on location-specific pages) */}
          {pathLocation && (
            <span
              className="md:hidden inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white mr-1"
              style={{ backgroundColor: "var(--color-seasonal-cta)" }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              {LOCATIONS[pathLocation].navLabel}
            </span>
          )}

          {/* Mobile: hamburger */}
          <button
            ref={hamburgerRef}
            className="flex items-center justify-center p-2 rounded-md md:hidden min-h-[44px] min-w-[44px]"
            style={{ WebkitTapHighlightColor: "transparent" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        navLinks={navLinks}
        switcher={switcher}
        currentLocation={currentLocation}
        isActive={isActive}
      />

      {/* Easter egg toast */}
      <EasterEggToast message={toastMessage} />
    </>
  );
}

function LocationSwitcher({
  currentLabel,
  oppositeLabel,
  oppositePath,
}: {
  currentLabel: string;
  oppositeLabel: string;
  oppositePath: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white"
        style={{ backgroundColor: "var(--color-seasonal-cta)" }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        {currentLabel}
      </span>
      <Link
        href={oppositePath}
        className="text-xs font-medium transition-opacity hover:opacity-70"
        style={{ color: "var(--color-muted)" }}
      >
        Switch to {oppositeLabel} →
      </Link>
    </div>
  );
}

function LocationPicker() {
  return (
    <div className="flex items-center gap-3 text-xs font-medium" style={{ color: "var(--color-muted)" }}>
      {(Object.keys(LOCATIONS) as LocationSlug[]).map((slug) => (
        <Link
          key={slug}
          href={LOCATIONS[slug].paths.home}
          className="transition-opacity hover:opacity-70"
        >
          {LOCATIONS[slug].shortName}
        </Link>
      ))}
    </div>
  );
}

/** Direct Toast link when the location is known; otherwise a two-option menu. */
function OrderButton({ location }: { location: LocationSlug | null }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const buttonClass =
    "rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 min-h-[44px] flex items-center gap-1.5";

  if (location) {
    return (
      <a
        href={LOCATIONS[location].orderOnlineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        style={{ backgroundColor: "var(--color-seasonal-cta)" }}
      >
        Order Online
      </a>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={buttonClass}
        style={{ backgroundColor: "var(--color-seasonal-cta)" }}
      >
        Order Online
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul
          className="absolute right-0 mt-2 w-56 rounded-md bg-white py-1 shadow-lg"
          style={{ border: "1px solid rgba(0,0,0,0.08)" }}
        >
          {(Object.keys(LOCATIONS) as LocationSlug[]).map((slug) => (
            <li key={slug}>
              <a
                href={LOCATIONS[slug].orderOnlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium hover:bg-black/5"
                style={{ color: "var(--color-ink)" }}
              >
                {LOCATIONS[slug].shortName}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      style={{ color: "var(--color-ink)" }}
    >
      {open ? (
        <>
          <line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function MobileMenu({
  open,
  onClose,
  navLinks,
  switcher,
  currentLocation,
  isActive,
}: {
  open: boolean;
  onClose: () => void;
  navLinks: { label: string; href: string }[];
  switcher: { current: string; other: string; otherHref: string } | null;
  currentLocation: LocationSlug | null;
  isActive: (href: string) => boolean;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const orderLocations: LocationSlug[] = currentLocation
    ? [currentLocation]
    : (Object.keys(LOCATIONS) as LocationSlug[]);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-sm transform overscroll-contain transition-transform duration-300 ease-in-out md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
        style={{ backgroundColor: "var(--color-warm-white)" }}
      >
        <div className="flex h-full flex-col overflow-y-auto pb-6 pt-16">
          {/* Close button */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-4 right-4 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Location switcher — top of drawer */}
          <div className="border-b px-6 pb-4" style={{ borderColor: "var(--color-muted)" + "33" }}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
              Location
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {switcher ? (
                <>
                  <span
                    className="rounded-full px-3 py-2 text-sm font-medium text-white"
                    style={{ backgroundColor: "var(--color-seasonal-cta)" }}
                  >
                    {switcher.current}
                  </span>
                  <Link
                    href={switcher.otherHref}
                    onClick={onClose}
                    className="rounded-full px-3 py-2 text-sm font-medium border transition-colors"
                    style={{
                      borderColor: "var(--color-seasonal-cta)",
                      color: "var(--color-seasonal-cta)",
                    }}
                  >
                    {switcher.other}
                  </Link>
                </>
              ) : (
                (Object.keys(LOCATIONS) as LocationSlug[]).map((slug) => (
                  <Link
                    key={slug}
                    href={LOCATIONS[slug].paths.home}
                    onClick={onClose}
                    className="rounded-full px-3 py-2 text-sm font-medium border transition-colors"
                    style={{
                      borderColor: "var(--color-seasonal-cta)",
                      color: "var(--color-seasonal-cta)",
                    }}
                  >
                    {LOCATIONS[slug].shortName}
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-6 pt-6" aria-label="Mobile navigation">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "flex items-center py-3 text-lg font-medium transition-colors min-h-[44px]",
                      isActive(link.href)
                        ? "text-[var(--color-seasonal-cta)]"
                        : "text-[var(--color-ink)]"
                    )}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Order Online CTA */}
          <div className="space-y-2 px-6 pt-4">
            {orderLocations.map((slug) => (
              <a
                key={slug}
                href={LOCATIONS[slug].orderOnlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-md py-3 text-base font-semibold text-white transition-colors min-h-[44px]"
                style={{ backgroundColor: "var(--color-seasonal-cta)" }}
              >
                {currentLocation ? "Order Online" : `Order — ${LOCATIONS[slug].shortName}`}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function EasterEggToast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-32 md:bottom-24 left-0 right-0 z-[100] pointer-events-none flex justify-center px-4">
      <div
        className="px-4 py-2 rounded-full text-sm text-center max-w-[calc(100vw-2rem)] animate-fade-in-out"
        style={{ backgroundColor: "var(--color-ink)", color: "var(--color-warm-white)", opacity: 0.88 }}
        role="status"
        aria-live="polite"
      >
        {message}
      </div>
    </div>
  );
}
