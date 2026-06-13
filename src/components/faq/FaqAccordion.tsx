"use client";

import { useState } from "react";
import type { FAQ } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  visit:   "Visiting Us",
  hours:   "Hours",
  food:    "Food",
  drinks:  "Drinks",
  events:  "Events",
  contact: "Getting in Touch",
  general: "General",
};

const CATEGORY_ORDER = ["visit", "hours", "food", "drinks", "events", "contact", "general"];

interface FaqAccordionProps {
  faqs: FAQ[];
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Group by category, preserving order
  const grouped = CATEGORY_ORDER.reduce<Record<string, FAQ[]>>((acc, cat) => {
    const items = faqs.filter((f) => f.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  // Any categories not in CATEGORY_ORDER
  faqs.forEach((f) => {
    if (f.category && !grouped[f.category]) {
      grouped[f.category] = faqs.filter((x) => x.category === f.category);
    }
  });

  const categories = Object.keys(grouped);
  const visibleCategories =
    activeCategory === "all" ? categories : categories.filter((c) => c === activeCategory);

  return (
    <div>
      {/* Category filter pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <FilterPill label="All" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
          {categories.map((cat) => (
            <FilterPill
              key={cat}
              label={CATEGORY_LABELS[cat] ?? cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      )}

      {/* Accordion groups */}
      <div className="space-y-10">
        {visibleCategories.map((cat) => (
          <section key={cat}>
            <h2
              className="font-heading text-lg font-bold mb-3 pb-2"
              style={{ color: "var(--color-ink)", borderBottom: "2px solid var(--color-green)" }}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </h2>
            <div className="space-y-1">
              {grouped[cat].map((faq) => {
                const isOpen = openId === faq._id;
                return (
                  <div
                    key={faq._id}
                    className="rounded-xl overflow-hidden"
                    style={{ border: "1px solid rgba(0,0,0,0.07)" }}
                  >
                    <button
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                      style={{
                        backgroundColor: isOpen ? "var(--color-ink)" : "white",
                        color: isOpen ? "white" : "var(--color-ink)",
                      }}
                      onClick={() => setOpenId(isOpen ? null : faq._id)}
                      aria-expanded={isOpen}
                    >
                      <span className="font-medium text-sm sm:text-base leading-snug">
                        {faq.question}
                      </span>
                      <span
                        className="flex-shrink-0 text-lg leading-none transition-transform duration-200"
                        style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <div
                        className="px-5 py-4 text-sm leading-relaxed whitespace-pre-line"
                        style={{ backgroundColor: "var(--color-warm-white)", color: "var(--color-muted)" }}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors min-h-[34px]"
      style={{
        backgroundColor: active ? "var(--color-ink)" : "rgba(0,0,0,0.05)",
        color: active ? "white" : "var(--color-ink)",
      }}
    >
      {label}
    </button>
  );
}
