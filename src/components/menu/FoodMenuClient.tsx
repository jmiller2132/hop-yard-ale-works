"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import MenuItemCard from "./MenuItemCard";
import MenuSectionNav from "./MenuSectionNav";
import type { MenuItemSeed } from "@/data/menu-appleton";

const SECTIONS = [
  { id: "specialty-pizzas", label: "Specialty Pizzas" },
  { id: "dessert", label: "Dessert" },
  { id: "build-your-own", label: "Build Your Own" },
];

const SECTION_NAME_MAP: Record<string, string> = {
  "specialty-pizzas": "Specialty Pizzas",
  dessert: "Dessert",
  "build-your-own": "Build Your Own",
};

const FILTERS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "glutenFree", label: "Gluten Free" },
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
  const [activeSection, setActiveSection] = useState("specialty-pizzas");
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

  // Scroll to section on tab click
  const handleSectionSelect = useCallback((id: string) => {
    setActiveSection(id);
    const el = sectionRefs.current[id];
    if (el) {
      scrollingRef.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        scrollingRef.current = false;
      }, 800);
    }
  }, []);

  // Update active section on scroll via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !scrollingRef.current) {
            setActiveSection(id);
          }
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (activeFilters.length === 0) return true;
    return activeFilters.every((f) => item.tags.includes(f));
  });

  const pizzaItems = filteredItems.filter((i) => i.section === "Specialty Pizzas");
  const dessertItems = filteredItems.filter((i) => i.section === "Dessert");
  const byoItems = filteredItems.filter((i) => i.section === "Build Your Own");

  // Pizza randomizer
  const handlePickForMe = useCallback(() => {
    const eligible = pizzaItems.filter((i) => i.section === "Specialty Pizzas");
    if (eligible.length === 0) return;

    if (randomizerUsed && lastPickedName) {
      showToast(`Stick with it.`);
      return;
    }

    const pick = eligible[Math.floor(Math.random() * eligible.length)];
    const itemId = `pizza-${pick.displayOrder}`;
    setHighlightedId(itemId);
    setRandomizerUsed(true);
    setLastPickedName(pick.name);
    showToast(`${pick.name} has chosen you.`);

    const el = document.getElementById(itemId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setTimeout(() => setHighlightedId(null), 3000);
  }, [pizzaItems, randomizerUsed, lastPickedName, showToast]);

  return (
    <>
      {/* Section nav */}
      <MenuSectionNav
        sections={SECTIONS}
        activeId={activeSection}
        onSelect={handleSectionSelect}
      />

      {/* Dietary filter bar */}
      <div
        className="border-b px-4 py-2.5 sm:px-6"
        style={{ backgroundColor: "var(--color-warm-white)", borderColor: "rgba(0,0,0,0.06)" }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-2 flex-wrap">
          <span className="text-xs font-medium mr-1" style={{ color: "var(--color-muted)" }}>
            Filter:
          </span>
          {FILTERS.map((f) => {
            const active = activeFilters.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() => toggleFilter(f.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 min-h-[32px]",
                  active
                    ? "border-transparent text-white"
                    : "border-current hover:opacity-80"
                )}
                style={{
                  backgroundColor: active ? "var(--color-teal)" : "transparent",
                  color: active ? "white" : "var(--color-muted)",
                  WebkitTapHighlightColor: "transparent",
                }}
                aria-pressed={active}
              >
                {f.label}
              </button>
            );
          })}
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="text-xs underline underline-offset-2 ml-1 min-h-[32px]"
              style={{ color: "var(--color-muted)" }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Menu content */}
      <div className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 md:pb-12">

        {/* Specialty Pizzas */}
        <section
          ref={(el) => { sectionRefs.current["specialty-pizzas"] = el; }}
          id="specialty-pizzas"
          className="pt-10"
        >
          <h2
            className="font-heading text-2xl font-bold mb-1"
            style={{ color: "var(--color-teal)" }}
          >
            Specialty Pizzas
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
            Wood-fired. Fresh ingredients. The perfect pairing for a cold pint.
          </p>

          {pizzaItems.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--color-muted)" }}>
              No items match your filters.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pizzaItems.map((item) => (
                <MenuItemCard
                  key={item.displayOrder}
                  item={item}
                  id={`pizza-${item.displayOrder}`}
                  highlighted={highlightedId === `pizza-${item.displayOrder}`}
                />
              ))}
            </div>
          )}

          {/* Pizza randomizer — buried, subtle */}
          {pizzaItems.length > 0 && activeFilters.length === 0 && (
            <p className="mt-6 text-center">
              <button
                onClick={handlePickForMe}
                className="text-xs underline-offset-2 hover:underline transition-colors"
                style={{ color: "var(--color-muted)" }}
              >
                {randomizerUsed ? "I still can't decide" : "Just pick one for me"}
              </button>
            </p>
          )}
        </section>

        {/* Dessert */}
        {dessertItems.length > 0 && (
          <section
            ref={(el) => { sectionRefs.current["dessert"] = el; }}
            id="dessert"
            className="pt-12"
          >
            <h2
              className="font-heading text-2xl font-bold mb-6"
              style={{ color: "var(--color-teal)" }}
            >
              Dessert
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dessertItems.map((item) => (
                <MenuItemCard key={item.displayOrder} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Build Your Own */}
        <section
          ref={(el) => { sectionRefs.current["build-your-own"] = el; }}
          id="build-your-own"
          className="pt-12"
        >
          <h2
            className="font-heading text-2xl font-bold mb-2"
            style={{ color: "var(--color-teal)" }}
          >
            Build Your Own
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
            Start with the base, then make it yours.
          </p>

          {byoItems.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {byoItems.map((item) => (
                <MenuItemCard key={item.displayOrder} item={item} />
              ))}
            </div>
          )}

          {/* BYO toppings table */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ByoGroup
              title="Meats — $2 each"
              items={["Pepperoni", "Sausage", "Smoked Ham", "Herb Chicken"]}
            />
            <ByoGroup
              title="Veggies — $1 each"
              items={[
                "Black Olive", "Basil", "Fresh Mushroom", "Roasted Garlic",
                "Jalapeño", "Onion", "Pineapple", "Pepperoncini",
                "Red Pepper", "Roma Tomato",
              ]}
            />
            <ByoGroup
              title="Extra Cheeses — $2 each"
              items={["Extra Mozzarella", "Parmesan", "Smoked Gouda", "Feta"]}
            />
            <ByoGroup
              title="Extra Sauces — $0.50 each"
              items={[
                "Extra Red Sauce", "Balsamic Glaze", "Hot Honey",
                "Oil", "Ranch", "White Sauce",
              ]}
              note="Sauces can be on the side or on the pizza."
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ByoUpgrade label="Cauliflower Crust" price="$3" note="Not certified vegan — contains dairy" />
            <ByoUpgrade label="Vegan Cheese" price="$2" note="Oat milk based" />
          </div>
        </section>

        {/* "You read the whole thing" — quiet end-of-menu line */}
        <p
          className="mt-16 text-center text-sm italic"
          style={{ color: "var(--color-muted)" }}
        >
          You made it. That deserves a drink.
        </p>

        {/* NextStep block */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 pb-4">
          <Link
            href={drinksHref}
            className="flex flex-col rounded-xl p-6 transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-teal)", color: "white" }}
          >
            <span className="font-heading text-lg font-bold">Pair it with a drink</span>
            <span className="mt-1 text-sm opacity-80">See what's pouring right now →</span>
          </Link>
          <Link
            href={orderUrl}
            className="flex flex-col rounded-xl p-6 transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
          >
            <span className="font-heading text-lg font-bold">Order Online</span>
            <span className="mt-1 text-sm opacity-80">Pick up or delivery via Toast →</span>
          </Link>
        </div>
      </div>

      {/* Quiet toast */}
      {toastMsg && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none px-4 py-2 text-sm text-center"
          style={{ color: "var(--color-muted)" }}
          role="status"
          aria-live="polite"
        >
          {toastMsg}
        </div>
      )}
    </>
  );
}

function ByoGroup({
  title,
  items,
  note,
}: {
  title: string;
  items: string[];
  note?: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.07)" }}
    >
      <h3
        className="font-heading text-sm font-semibold mb-3"
        style={{ color: "var(--color-teal)" }}
      >
        {title}
      </h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-sm" style={{ color: "var(--color-ink)" }}>
            {item}
          </li>
        ))}
      </ul>
      {note && (
        <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
          {note}
        </p>
      )}
    </div>
  );
}

function ByoUpgrade({
  label,
  price,
  note,
}: {
  label: string;
  price: string;
  note: string;
}) {
  return (
    <div
      className="flex items-start justify-between rounded-lg px-4 py-3"
      style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.07)" }}
    >
      <div>
        <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
          {label}
        </span>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
          {note}
        </p>
      </div>
      <span className="font-heading text-sm font-bold ml-3 flex-shrink-0" style={{ color: "var(--color-teal)" }}>
        {price}
      </span>
    </div>
  );
}
