"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
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
        {categories.map((cat) => (
          <section key={cat} hidden={activeCategory !== "all" && activeCategory !== cat}>
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
                    className="rounded overflow-hidden"
                    style={{ border: "1px solid rgba(0,0,0,0.07)" }}
                  >
                    <button
                      type="button"
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                      style={{
                        backgroundColor: isOpen ? "var(--color-ink)" : "white",
                        color: isOpen ? "white" : "var(--color-ink)",
                      }}
                      onClick={() => setOpenId(isOpen ? null : faq._id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faq._id}`}
                    >
                      <span className="font-medium text-sm sm:text-base leading-snug">
                        {faq.question}
                      </span>
                      <span
                        className="flex-shrink-0 text-lg leading-none transition-transform duration-200"
                        style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </button>
                    <div
                      id={`faq-answer-${faq._id}`}
                      hidden={!isOpen}
                      className="px-5 py-4 text-sm leading-relaxed whitespace-pre-line"
                      style={{ backgroundColor: "var(--color-warm-white)", color: "var(--color-muted)" }}
                    >
                      <FaqAnswer text={faq.answer} />
                    </div>
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

const LINK_CLASS = "font-medium underline underline-offset-2";
const LINK_STYLE = { color: "var(--color-green-text)" } as const;

const PHRASE_LINKS: { pattern: RegExp; href: string }[] = [
  { pattern: /Appleton drinks menu/i, href: "/appleton-drinks-menu/" },
  { pattern: /Menomonee Falls drinks menu/i, href: "/the-falls-drinks-menu/" },
  { pattern: /Events page/i, href: "/events/" },
  { pattern: /Contact form/i, href: "/contact/" },
  { pattern: /Instagram/i, href: "https://www.instagram.com/hopyardaleworks/" },
  { pattern: /Facebook/i, href: "https://www.facebook.com/hopyardaleworks/" },
];

function FaqAnswer({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const emailMatch = remaining.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phraseMatches = PHRASE_LINKS.map((p) => {
      const m = remaining.match(p.pattern);
      return m && m.index != null ? { ...p, match: m[0], index: m.index } : null;
    }).filter((x): x is NonNullable<typeof x> => x !== null);

    const candidates: { index: number; length: number; node: ReactNode }[] = [];
    if (emailMatch && emailMatch.index != null) {
      const email = emailMatch[0];
      candidates.push({
        index: emailMatch.index,
        length: email.length,
        node: (
          <a key={key++} href={`mailto:${email}`} className={LINK_CLASS} style={LINK_STYLE}>
            {email}
          </a>
        ),
      });
    }
    for (const p of phraseMatches) {
      const external = p.href.startsWith("http");
      candidates.push({
        index: p.index,
        length: p.match.length,
        node: external ? (
          <a key={key++} href={p.href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS} style={LINK_STYLE}>
            {p.match}
          </a>
        ) : (
          <Link key={key++} href={p.href} className={LINK_CLASS} style={LINK_STYLE}>
            {p.match}
          </Link>
        ),
      });
    }

    if (candidates.length === 0) {
      nodes.push(remaining);
      break;
    }

    candidates.sort((a, b) => a.index - b.index || b.length - a.length);
    const next = candidates[0];
    if (next.index > 0) nodes.push(remaining.slice(0, next.index));
    nodes.push(next.node);
    remaining = remaining.slice(next.index + next.length);
  }

  return <>{nodes}</>;
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
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
