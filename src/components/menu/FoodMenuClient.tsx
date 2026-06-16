"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import MenuItemCard from "./MenuItemCard";
import MenuSectionNav from "./MenuSectionNav";
import type { MenuItemSeed } from "@/data/menu-appleton";

const SECTIONS = [
  { id: "the-basics",    label: "The Basics" },
  { id: "our-creations", label: "Our Creations" },
  { id: "build-your-own", label: "Build Your Own" },
];

const FILTERS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan",      label: "Vegan" },
  { id: "glutenFree", label: "Gluten Free" },
];

const REPICK_TOASTS = [
  (name: string) => `The ${name} is still right.`,
  (name: string) => `${name}. Final answer.`,
  (name: string) => `We stand by ${name}.`,
  (name: string) => `${name}. Trust us.`,
  (_name: string) => `We could do this all day.`,
  (name: string) => `Okay. ${name}. For real this time.`,
  (_name: string) => `The bar has opinions too, you know.`,
  (name: string) => `${name}. The oven agrees.`,
];

// BYO topping data with dietary flags
const BYO_MEATS = [
  { name: "Pepperoni",    vegan: false, gf: true  },
  { name: "Sausage",      vegan: false, gf: true  },
  { name: "Smoked Ham",   vegan: false, gf: true  },
  { name: "Herb Chicken", vegan: false, gf: true  },
];
const BYO_CHEESES = [
  { name: "Extra Mozzarella", vegan: false, gf: true },
  { name: "Parmesan",         vegan: false, gf: true },
  { name: "Smoked Gouda",     vegan: false, gf: true },
  { name: "Feta",             vegan: false, gf: true },
];
const BYO_VEGGIES = [
  { name: "Black Olive",    vegan: true, gf: true },
  { name: "Basil",          vegan: true, gf: true },
  { name: "Fresh Mushroom", vegan: true, gf: true },
  { name: "Roasted Garlic", vegan: true, gf: true },
  { name: "Jalapeño",       vegan: true, gf: true },
  { name: "Onion",          vegan: true, gf: true },
  { name: "Pineapple",      vegan: true, gf: true },
  { name: "Pepperoncini",   vegan: true, gf: true },
  { name: "Red Pepper",     vegan: true, gf: true },
  { name: "Roma Tomato",    vegan: true, gf: true },
  { name: "Green Olive",    vegan: true, gf: true },
];
const BYO_SAUCES = [
  { name: "Extra Red Sauce",  vegan: true,  gf: true },
  { name: "Balsamic Glaze",   vegan: true,  gf: true },
  { name: "Hot Honey",        vegan: false, gf: true },
  { name: "Oil",              vegan: true,  gf: true },
  { name: "Ranch",            vegan: false, gf: true },
  { name: "White Sauce",      vegan: false, gf: true },
];

interface FoodMenuClientProps {
  items: MenuItemSeed[];
  orderUrl: string;
  locationName: string;
  drinksHref: string;
}

export default function FoodMenuClient({
  items,
  orderUrl,
  locationName,
  drinksHref,
}: FoodMenuClientProps) {
  const [activeSection, setActiveSection] = useState("the-basics");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [randomizerUsed, setRandomizerUsed] = useState(false);
  const [lastPickedName, setLastPickedName] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const scrollingRef = useRef(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  const handleSectionSelect = useCallback((id: string) => {
    setActiveSection(id);
    const el = sectionRefs.current[id];
    if (el) {
      scrollingRef.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => { scrollingRef.current = false; }, 800);
    }
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !scrollingRef.current) setActiveSection(id);
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  const isVegan = activeFilters.includes("vegan");
  const isGF = activeFilters.includes("glutenFree");
  const hasFilter = activeFilters.length > 0;

  const filteredItems = items.filter((item) => {
    if (!hasFilter) return true;
    return activeFilters.every((f) => item.tags.includes(f));
  });

  const basicsItems   = filteredItems.filter((i) => i.section === "The Basics");
  const creationsItems = filteredItems.filter((i) => i.section === "Our Creations");
  const snackItems    = filteredItems.filter((i) => i.section === "Snacks");
  const dessertItems  = filteredItems.filter((i) => i.section === "Dessert");
  const byoItems      = filteredItems.filter((i) => i.section === "Build Your Own");
  const allPizzaItems = [...basicsItems, ...creationsItems];

  // Pizza randomizer — draws from all filtered pizza items
  const handlePickForMe = useCallback(() => {
    const pool = allPizzaItems.length > 1
      ? allPizzaItems.filter((i) => i.name !== lastPickedName)
      : allPizzaItems;
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const section = pick.section === "The Basics" ? "basics" : "creations";
    const itemId = `pizza-${section}-${pick.displayOrder}`;
    setHighlightedId(itemId);
    setRandomizerUsed(true);
    setLastPickedName(pick.name);
    const toast = randomizerUsed
      ? REPICK_TOASTS[Math.floor(Math.random() * REPICK_TOASTS.length)](pick.name)
      : `${pick.name} has chosen you.`;
    showToast(toast);
    document.getElementById(itemId)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlightedId(null), 3000);
  }, [allPizzaItems, randomizerUsed, lastPickedName, showToast]);

  const byoScrollId = "build-your-own";
  const scrollToByo = () => {
    handleSectionSelect(byoScrollId);
  };

  return (
    <>
      {/* Section nav */}
      <MenuSectionNav sections={SECTIONS} activeId={activeSection} onSelect={handleSectionSelect} />

      {/* Dietary filter bar */}
      <div className="border-b px-4 py-2.5 sm:px-6" style={{ backgroundColor: "var(--color-warm-white)", borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="mx-auto flex max-w-7xl items-center gap-2 flex-wrap">
          <span className="text-xs font-medium mr-1" style={{ color: "var(--color-muted)" }}>Filter:</span>
          {FILTERS.map((f) => {
            const active = activeFilters.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() => toggleFilter(f.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 min-h-[32px]",
                  active ? "border-transparent text-white" : "border-current hover:opacity-80"
                )}
                style={{
                  backgroundColor: active ? "var(--color-green)" : "transparent",
                  color: active ? "white" : "var(--color-muted)",
                  WebkitTapHighlightColor: "transparent",
                }}
                aria-pressed={active}
              >
                {f.label}
              </button>
            );
          })}
          {hasFilter && (
            <button onClick={() => setActiveFilters([])} className="text-xs underline underline-offset-2 ml-1 min-h-[32px]" style={{ color: "var(--color-muted)" }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Menu content */}
      <div className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 md:pb-12">

        {/* ── The Basics ─────────────────────────────────────────────────────── */}
        <section ref={(el) => { sectionRefs.current["the-basics"] = el; }} id="the-basics" className="pt-10">
          <h2 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--color-ink)" }}>
            The Basics
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
            Steadfast menu items. Always here, always good.
          </p>

          {basicsItems.length === 0 ? (
            <EmptyPizzaState filterLabels={activeFilters} onByo={scrollToByo} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {basicsItems.map((item) => (
                <MenuItemCard
                  key={item.displayOrder}
                  item={item}
                  id={`pizza-basics-${item.displayOrder}`}
                  highlighted={highlightedId === `pizza-basics-${item.displayOrder}`}
                />
              ))}
            </div>
          )}

          {/* Snacks */}
          {snackItems.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-muted)" }}>
                Snacks
              </h3>
              <div className="flex flex-wrap gap-3">
                {snackItems.map((item) => (
                  <div key={item.displayOrder} className="rounded-lg px-4 py-2 text-sm flex items-center gap-3" style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.07)" }}>
                    <span style={{ color: "var(--color-ink)" }}>{item.name}</span>
                    <span className="font-semibold" style={{ color: "var(--color-green)" }}>{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Our Creations ──────────────────────────────────────────────────── */}
        <section ref={(el) => { sectionRefs.current["our-creations"] = el; }} id="our-creations" className="pt-14">
          <div className="flex flex-wrap items-baseline gap-3 mb-1">
            <h2 className="font-heading text-2xl font-bold" style={{ color: "var(--color-ink)" }}>
              Our Creations
            </h2>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: "var(--color-green)", color: "white" }}>
              Vol. 28
            </span>
          </div>
          <p className="text-sm mb-1" style={{ color: "var(--color-muted)" }}>
            Specialty pies that rotate every couple of months.
          </p>
          <p className="text-xs mb-6" style={{ color: "var(--color-muted)", opacity: 0.7 }}>
            Menu subject to change. Ask your server what&apos;s current.
          </p>

          {creationsItems.length === 0 ? (
            <EmptyPizzaState filterLabels={activeFilters} onByo={scrollToByo} creations />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {creationsItems.map((item) => (
                <MenuItemCard
                  key={item.displayOrder}
                  item={item}
                  id={`pizza-creations-${item.displayOrder}`}
                  highlighted={highlightedId === `pizza-creations-${item.displayOrder}`}
                />
              ))}
            </div>
          )}

          {/* Pizza randomizer */}
          {allPizzaItems.length > 0 && (
            <p className="mt-6 text-center">
              <button
                onClick={handlePickForMe}
                className="text-xs underline-offset-2 hover:underline transition-colors"
                style={{ color: "var(--color-muted)" }}
              >
                {randomizerUsed ? "Still can't decide" : "Just pick one for me"}
              </button>
            </p>
          )}
        </section>

        {/* ── Build Your Own ─────────────────────────────────────────────────── */}
        <section ref={(el) => { sectionRefs.current["build-your-own"] = el; }} id="build-your-own" className="pt-14">
          <h2 className="font-heading text-2xl font-bold mb-2" style={{ color: "var(--color-ink)" }}>
            Build Your Own
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
            Start with the base ($12), then make it yours.
          </p>

          {/* Dietary notice for BYO */}
          {isVegan && (
            <div className="mb-5 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: "rgba(106,191,75,0.08)", border: "1px solid rgba(106,191,75,0.25)", color: "var(--color-ink)" }}>
              <strong>Filtering for Vegan</strong> — meats, dairy cheeses, ranch, and white sauce are not vegan.
              Items below are marked accordingly. The <strong>Vegan Cheese upgrade</strong> is a great swap.
            </div>
          )}
          {isGF && (
            <div className="mb-5 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: "rgba(106,191,75,0.08)", border: "1px solid rgba(106,191,75,0.25)", color: "var(--color-ink)" }}>
              <strong>Filtering for Gluten Free</strong> — house dough contains gluten.
              The <strong>Cauliflower Crust upgrade (+$3)</strong> is available as a gluten-free alternative.
            </div>
          )}

          {byoItems.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {byoItems.map((item) => (
                <MenuItemCard key={item.displayOrder} item={item} />
              ))}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ByoGroup title="Meats — $2 each" items={BYO_MEATS} filterVegan={isVegan} filterGF={isGF} type="meat" />
            <ByoGroup title="Veggies — $1 each" items={BYO_VEGGIES} filterVegan={isVegan} filterGF={isGF} type="veggie" />
            <ByoGroup title="Extra Cheeses — $2 each" items={BYO_CHEESES} filterVegan={isVegan} filterGF={isGF} type="cheese" />
            <ByoGroup title="Sauces — $0.50 each" items={BYO_SAUCES} filterVegan={isVegan} filterGF={isGF} type="sauce" note="Can be on the side or on the pizza." />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ByoUpgrade label="Cauliflower Crust" price="+$3" note="Not certified vegan — contains dairy" highlight={isGF} />
            <ByoUpgrade label="Vegan Cheese" price="+$2" note="Oat milk based" highlight={isVegan} />
          </div>
        </section>

        {/* ── Dessert ──────────────────────────────────────────────────────────── */}
        {dessertItems.length > 0 && (
          <section className="pt-14">
            <h2 className="font-heading text-2xl font-bold mb-6" style={{ color: "var(--color-ink)" }}>
              Dessert
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dessertItems.map((item) => (
                <MenuItemCard key={item.displayOrder} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Quiet end-of-menu line */}
        <p className="mt-16 text-center text-sm italic" style={{ color: "var(--color-muted)" }}>
          You made it. That deserves a drink.
        </p>

        {/* NextStep block */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 pb-4">
          <Link href={drinksHref} className="flex flex-col rounded-xl p-6 transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--color-ink)", color: "white" }}>
            <span className="font-heading text-lg font-bold">Pair it with a drink</span>
            <span className="mt-1 text-sm opacity-80">See what&apos;s pouring right now →</span>
          </Link>
          <Link href={orderUrl} className="flex flex-col rounded-xl p-6 transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}>
            <span className="font-heading text-lg font-bold">Order Online</span>
            <span className="mt-1 text-sm opacity-80">Pick up or delivery via Toast →</span>
          </Link>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-24 left-0 right-0 z-[100] pointer-events-none flex justify-center px-4">
          <div className="px-4 py-2 rounded-full text-sm whitespace-nowrap animate-fade-in-out" style={{ backgroundColor: "var(--color-ink)", color: "var(--color-warm-white)", opacity: 0.88 }} role="status" aria-live="polite">
            {toastMsg}
          </div>
        </div>
      )}
    </>
  );
}

// ── Empty state when filter removes all pizzas ──────────────────────────────

function EmptyPizzaState({
  filterLabels,
  onByo,
  creations = false,
}: {
  filterLabels: string[];
  onByo: () => void;
  creations?: boolean;
}) {
  const filterNames = filterLabels.map((f) =>
    f === "glutenFree" ? "Gluten Free" : f === "vegan" ? "Vegan" : "Vegetarian"
  ).join(" + ");

  return (
    <div className="rounded-xl px-6 py-8 text-center" style={{ backgroundColor: "rgba(0,0,0,0.03)", border: "1px dashed rgba(0,0,0,0.12)" }}>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
        No {creations ? "creations" : "basics"} match <strong>{filterNames}</strong>.
      </p>
      <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
        Build Your Own is fully customizable — load up on veggies and vegan-friendly toppings.
      </p>
      <button onClick={onByo} className="text-sm font-semibold underline underline-offset-2" style={{ color: "var(--color-green)" }}>
        Go to Build Your Own →
      </button>
    </div>
  );
}

// ── BYO topping group with dietary dimming ──────────────────────────────────

type ToppingItem = { name: string; vegan: boolean; gf: boolean };

function ByoGroup({
  title,
  items,
  filterVegan,
  filterGF,
  type,
  note,
}: {
  title: string;
  items: ToppingItem[];
  filterVegan: boolean;
  filterGF: boolean;
  type: "meat" | "veggie" | "cheese" | "sauce";
  note?: string;
}) {
  const filteredOut = (item: ToppingItem) => {
    if (filterVegan && !item.vegan) return true;
    if (filterGF && !item.gf) return true;
    return false;
  };

  const anyFiltered = items.some(filteredOut);
  const filterLabel = filterVegan ? "Vegan" : filterGF ? "GF" : "";

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.07)" }}>
      <h3 className="font-heading text-sm font-semibold mb-3" style={{ color: "var(--color-ink)" }}>
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item) => {
          const dimmed = filteredOut(item);
          return (
            <li key={item.name} className={cn("text-sm flex items-center gap-1.5 transition-opacity", dimmed ? "opacity-30" : "")} style={{ color: "var(--color-ink)" }}>
              {dimmed && <span className="text-xs line-through">{item.name}</span>}
              {!dimmed && <span>{item.name}</span>}
            </li>
          );
        })}
      </ul>
      {anyFiltered && filterLabel && (
        <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
          Strikethrough items removed for <em>{filterLabel}</em>.
        </p>
      )}
      {note && !anyFiltered && (
        <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>{note}</p>
      )}
      {note && anyFiltered && (
        <p className="mt-1 text-xs" style={{ color: "var(--color-muted)" }}>{note}</p>
      )}
    </div>
  );
}

// ── BYO upgrade row ─────────────────────────────────────────────────────────

function ByoUpgrade({ label, price, note, highlight }: { label: string; price: string; note: string; highlight?: boolean }) {
  return (
    <div
      className="flex items-start justify-between rounded-lg px-4 py-3 transition-all"
      style={{
        backgroundColor: highlight ? "rgba(106,191,75,0.08)" : "white",
        border: `1px solid ${highlight ? "rgba(106,191,75,0.4)" : "rgba(0,0,0,0.07)"}`,
      }}
    >
      <div>
        <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>{label}</span>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{note}</p>
      </div>
      <span className="font-heading text-sm font-bold ml-3 flex-shrink-0" style={{ color: "var(--color-green)" }}>{price}</span>
    </div>
  );
}
