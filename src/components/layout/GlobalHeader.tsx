"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { urlFor } from "@/lib/sanity/client";
import type { SeasonalTheme } from "@/types";

interface GlobalHeaderProps {
  activeTheme?: SeasonalTheme | null;
}

// Location slug mapping for context-aware switching
const LOCATION_SLUG_MAP: Record<string, string> = {
  "/appleton/": "/the-falls/",
  "/the-falls/": "/appleton/",
  "/appleton-food-menu/": "/the-falls-food-menu/",
  "/the-falls-food-menu/": "/appleton-food-menu/",
  "/appleton-drinks-menu/": "/the-falls-drinks-menu/",
  "/the-falls-drinks-menu/": "/appleton-drinks-menu/",
};

function getOppositeLocationPath(pathname: string): string {
  if (LOCATION_SLUG_MAP[pathname]) return LOCATION_SLUG_MAP[pathname];
  if (pathname.startsWith("/appleton")) return "/the-falls/";
  if (pathname.startsWith("/the-falls")) return "/appleton/";
  return "/";
}

function getCurrentLocationLabel(pathname: string): string {
  if (pathname.startsWith("/the-falls")) return "The Falls";
  if (pathname.startsWith("/appleton")) return "Appleton";
  return "Appleton";
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

function getPageType(pathname: string): string | null {
  if (pathname.includes("drinks")) return "drinks";
  if (pathname.includes("food")) return "food";
  if (pathname === "/appleton/" || pathname === "/the-falls/") return "location";
  return null;
}

export default function GlobalHeader({ activeTheme }: GlobalHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usedContextMessages = useRef<Set<string>>(new Set());
  const eggIndexRef = useRef(0);

  const oppositeLocationPath = getOppositeLocationPath(pathname);
  const currentLocation = getCurrentLocationLabel(pathname);
  const oppositeLocation =
    currentLocation === "Appleton" ? "The Falls" : "Appleton";

  // Determine order online URL based on active location context
  const orderOnlineUrl =
    pathname.startsWith("/the-falls") ? "#order-falls" : "#order-appleton";

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  }, []);

  const handleLogoClick = useCallback(() => {
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

      const pageType = getPageType(pathname);
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
  }, [pathname, showToast]);

  const navLinks = [
    {
      label: "Food",
      href: pathname.startsWith("/the-falls") ? "/the-falls-food-menu/" : "/appleton-food-menu/",
    },
    {
      label: "Drinks",
      href: pathname.startsWith("/the-falls") ? "/the-falls-drinks-menu/" : "/appleton-drinks-menu/",
    },
    { label: "Events", href: "/events/" },
    {
      label: "Visit",
      href: pathname.startsWith("/the-falls") ? "/the-falls/" : "/appleton/",
    },
  ];

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

        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex-shrink-0 focus-visible:outline-none"
            aria-label="Hop Yard Ale Works home"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <Link href="/">
              <Image
                src={logoSrc}
                alt="Hop Yard Ale Works"
                width={320}
                height={280}
                className="w-36 sm:w-44 h-auto object-contain"
                style={{ mixBlendMode: "multiply" }}
                priority
              />
            </Link>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  pathname === link.href || pathname.startsWith(link.href.replace(/\/$/, ""))
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
            <LocationSwitcher
              currentLabel={currentLocation}
              oppositeLabel={oppositeLocation}
              oppositePath={oppositeLocationPath}
            />
            <Link
              href={orderOnlineUrl}
              className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 min-h-[44px] flex items-center"
              style={{ backgroundColor: "var(--color-seasonal-cta)" }}
            >
              Order Online
            </Link>
          </div>

          {/* Mobile: hamburger */}
          <button
            className="flex items-center justify-center p-2 rounded-md md:hidden min-h-[44px] min-w-[44px]"
            style={{ WebkitTapHighlightColor: "transparent" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navLinks={navLinks}
        currentLocation={currentLocation}
        oppositeLocation={oppositeLocation}
        oppositeLocationPath={oppositeLocationPath}
        orderOnlineUrl={orderOnlineUrl}
        pathname={pathname}
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
    <div className="flex items-center gap-1 text-sm" style={{ color: "var(--color-muted)" }}>
      <span>Viewing:</span>
      <span className="font-medium" style={{ color: "var(--color-ink)" }}>
        {currentLabel}
      </span>
      <span>|</span>
      <Link
        href={oppositePath}
        className="font-medium underline-offset-2 hover:underline transition-colors"
        style={{ color: "var(--color-seasonal-cta)" }}
      >
        {oppositeLabel}
      </Link>
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
  currentLocation,
  oppositeLocation,
  oppositeLocationPath,
  orderOnlineUrl,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  navLinks: { label: string; href: string }[];
  currentLocation: string;
  oppositeLocation: string;
  oppositeLocationPath: string;
  orderOnlineUrl: string;
  pathname: string;
}) {
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
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-sm transform transition-transform duration-300 ease-in-out md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
        style={{ backgroundColor: "var(--color-warm-white)" }}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col overflow-y-auto pb-6 pt-16">
          {/* Close button */}
          <button
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
            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-sm font-medium text-white"
                style={{ backgroundColor: "var(--color-seasonal-cta)" }}
              >
                {currentLocation}
              </span>
              <Link
                href={oppositeLocationPath}
                onClick={onClose}
                className="rounded-full px-3 py-1 text-sm font-medium border transition-colors"
                style={{
                  borderColor: "var(--color-seasonal-cta)",
                  color: "var(--color-seasonal-cta)",
                }}
              >
                {oppositeLocation}
              </Link>
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
                    className={cn(
                      "flex items-center py-3 text-lg font-medium transition-colors min-h-[44px]",
                      pathname === link.href
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
          <div className="px-6 pt-4">
            <Link
              href={orderOnlineUrl}
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-md py-3 text-base font-semibold text-white transition-colors min-h-[44px]"
              style={{ backgroundColor: "var(--color-seasonal-cta)" }}
            >
              Order Online
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function EasterEggToast({ message }: { message: string | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3200);
      return () => clearTimeout(t);
    }
  }, [message]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[100] pointer-events-none flex justify-center px-4">
      <div
        className={cn(
          "px-4 py-2 rounded-full text-sm whitespace-nowrap",
          visible ? "animate-fade-in-out" : "opacity-0"
        )}
        style={{ backgroundColor: "var(--color-ink)", color: "var(--color-warm-white)", opacity: visible ? 0.88 : 0 }}
        role="status"
        aria-live="polite"
      >
        {message}
      </div>
    </div>
  );
}
