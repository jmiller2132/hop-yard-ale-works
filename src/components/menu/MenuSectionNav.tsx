"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

interface Section {
  id: string;
  label: string;
}

interface MenuSectionNavProps {
  sections: Section[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function MenuSectionNav({ sections, activeId, onSelect }: MenuSectionNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (activeRef.current && navRef.current) {
      const nav = navRef.current;
      const btn = activeRef.current;
      const navLeft = nav.scrollLeft;
      const navWidth = nav.offsetWidth;
      const btnLeft = btn.offsetLeft;
      const btnWidth = btn.offsetWidth;

      if (btnLeft < navLeft || btnLeft + btnWidth > navLeft + navWidth) {
        nav.scrollTo({ left: btnLeft - 16, behavior: "smooth" });
      }
    }
  }, [activeId]);

  return (
    <nav
      aria-label="Menu sections"
      className="sticky top-16 z-40 border-b"
      style={{
        backgroundColor: "var(--color-warm-white)",
        borderColor: "rgba(0,0,0,0.08)",
      }}
    >
      <div
        ref={navRef}
        className="flex overflow-x-auto scrollbar-none mx-auto max-w-7xl px-4 sm:px-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {sections.map((section) => {
          const isActive = activeId === section.id;
          return (
            <button
              key={section.id}
              ref={isActive ? activeRef : null}
              onClick={() => onSelect(section.id)}
              className={cn(
                "flex-shrink-0 px-4 py-3.5 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px min-h-[44px]",
                isActive
                  ? "border-[var(--color-seasonal-cta)] text-[var(--color-ink)]"
                  : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              )}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {section.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
