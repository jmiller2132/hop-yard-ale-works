"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/cn";
import type { MenuItemSeed } from "@/data/menu-appleton";

const REPICK_LINES = [
  (name: string) => `The ${name} is still right.`,
  (name: string) => `${name}. Final answer.`,
  (name: string) => `We stand by ${name}.`,
  (name: string) => `${name}. Trust us.`,
  (_name: string) => `We could do this all day.`,
  (name: string) => `Okay. ${name}. For real this time.`,
  (_name: string) => `The bar has opinions too, you know.`,
  (name: string) => `${name}. The oven agrees.`,
];

interface PizzaPickerShowProps {
  pool: MenuItemSeed[];
  avoidName: string | null;
  repick: boolean;
  onClose: () => void;
  onConfirm: (item: MenuItemSeed) => void;
}

interface SpinPlan {
  sequence: number[];
  line: string;
}

function itemKey(item: MenuItemSeed) {
  return `${item.section}:${item.displayOrder}:${item.name}`;
}

function delayFor(index: number, total: number) {
  const remaining = total - 1 - index;
  if (remaining > 8) return 64;
  const settle = [0, 680, 520, 400, 300, 220, 160, 110, 80];
  return settle[remaining] ?? 64;
}

function buildIndexSequence(count: number, winnerIndex: number) {
  if (count <= 1) return [0];
  const laps = count <= 5 ? 3 : 2;
  const seq: number[] = [];
  for (let lap = 0; lap < laps; lap += 1) {
    for (let i = 0; i < count; i += 1) seq.push(i);
  }
  for (let i = 0; i <= winnerIndex; i += 1) seq.push(i);
  const runUp = Math.min(seq.length, Math.max(14, Math.min(count + 8, 22)));
  return seq.slice(seq.length - runUp);
}

function buildPlan(pool: MenuItemSeed[], avoidName: string | null, repick: boolean): SpinPlan {
  const candidates = pool.length > 1 ? pool.filter((item) => item.name !== avoidName) : pool;
  const source = candidates.length ? candidates : pool;
  const winner = source[Math.floor(Math.random() * source.length)];
  const winnerIndex = Math.max(0, pool.findIndex((item) => itemKey(item) === itemKey(winner)));
  const line = repick
    ? REPICK_LINES[Math.floor(Math.random() * REPICK_LINES.length)](winner.name)
    : `${winner.name} has chosen you.`;
  return { sequence: buildIndexSequence(pool.length, winnerIndex), line };
}

export default function PizzaPickerShow({
  pool,
  avoidName,
  repick,
  onClose,
  onConfirm,
}: PizzaPickerShowProps) {
  const [plan, setPlan] = useState<SpinPlan>(() => buildPlan(pool, avoidName, repick));
  const [step, setStep] = useState(0);
  const [landed, setLanded] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const activeTileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStep(0);
    setLanded(false);

    if (reduceMotion || plan.sequence.length <= 1) {
      setStep(Math.max(0, plan.sequence.length - 1));
      setLanded(true);
      return;
    }

    let cancelled = false;
    let timeout = 0;

    const show = (index: number) => {
      if (cancelled) return;
      setStep(index);
      if (index >= plan.sequence.length - 1) {
        setLanded(true);
        return;
      }
      timeout = window.setTimeout(() => show(index + 1), delayFor(index, plan.sequence.length));
    };

    timeout = window.setTimeout(() => show(1), delayFor(0, plan.sequence.length) + 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [plan]);

  useEffect(() => {
    if (landed) confirmRef.current?.focus();
    else dialogRef.current?.focus();
  }, [landed, plan]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const activeIndex = plan.sequence[Math.min(step, plan.sequence.length - 1)] ?? 0;
  const current = pool[activeIndex];
  const previous = step > 0 ? pool[plan.sequence[step - 1]] : null;
  const upcoming = step < plan.sequence.length - 1 ? pool[plan.sequence[step + 1]] : null;

  const creations = pool.filter((item) => item.section === "Our Creations");
  const basics = pool.filter((item) => item.section === "The Basics");
  const indexByKey = new Map(pool.map((item, index) => [itemKey(item), index]));

  useEffect(() => {
    const tile = activeTileRef.current;
    if (!tile || !landed) return;
    const scroller = tile.closest("[data-picker-scroll]");
    if (!(scroller instanceof HTMLElement)) return;
    const tileRect = tile.getBoundingClientRect();
    const box = scroller.getBoundingClientRect();
    if (tileRect.top >= box.top && tileRect.bottom <= box.bottom) return;
    const delta = tileRect.top < box.top
      ? tileRect.top - box.top - 8
      : tileRect.bottom - box.bottom + 8;
    scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: "smooth" });
  }, [landed, activeIndex]);

  const spinAgain = () => {
    if (!landed || !current) return;
    setStep(0);
    setLanded(false);
    setPlan(buildPlan(pool, current.name, true));
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 p-3 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pizza-picker-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[min(92vh,820px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-2xl outline-none"
        style={{ backgroundColor: "var(--color-ink)", color: "white" }}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
          <h2
            id="pizza-picker-title"
            className="font-heading text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: "var(--color-green)" }}
          >
            {landed ? "Your pizza" : "Picking a pizza"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="px-5">
          <div className="overflow-hidden rounded-xl px-3 py-3" style={{ backgroundColor: "rgba(255,255,255,0.04)", boxShadow: landed ? "inset 0 0 0 2px var(--color-green), 0 0 28px rgba(106,191,75,0.28)" : "inset 0 0 0 1px rgba(106,191,75,0.45)" }}>
            <p className={cn("h-6 truncate text-center text-sm text-white/40", landed && "invisible")} aria-hidden="true">
              {previous?.name ?? ""}
            </p>
            <p
              key={`${step}-${landed ? "landed" : "spin"}`}
              className={cn(
                "flex h-[2.5em] items-center justify-center overflow-hidden text-center font-heading text-3xl font-bold leading-[1.25] sm:text-4xl",
                landed ? "picker-land-pop" : "picker-name-in"
              )}
              style={{ color: landed ? "var(--color-green)" : "white" }}
            >
              <span className="line-clamp-2 block w-full">{current?.name}</span>
            </p>
            <p className={cn("h-6 truncate text-center text-sm text-white/40", landed && "invisible")} aria-hidden="true">
              {upcoming?.name ?? ""}
            </p>
          </div>

          <p className="sr-only" aria-live="polite">
            {landed && current ? `${current.name}, ${current.price}. ${plan.line}` : "Picking a pizza"}
          </p>

          {landed && current && (
            <div className="mt-3 text-center">
              <p className="font-heading text-lg font-bold" style={{ color: "var(--color-green)" }}>
                {current.price}
              </p>
              {current.description && (
                <p className="mx-auto mt-1.5 line-clamp-2 max-w-md text-sm leading-relaxed text-white/75">
                  {current.description}
                </p>
              )}
              <p className="mt-2 text-sm text-white/90">{plan.line}</p>
              <div className="mt-3 flex flex-col items-center gap-1">
                <button
                  ref={confirmRef}
                  type="button"
                  onClick={() => onConfirm(current)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold"
                  style={{ backgroundColor: "var(--color-green)", color: "var(--color-ink)" }}
                >
                  Show it on the menu
                </button>
                <button
                  type="button"
                  onClick={spinAgain}
                  className="min-h-11 px-3 text-sm text-white/70 underline-offset-2 hover:text-white hover:underline"
                >
                  Spin again
                </button>
              </div>
            </div>
          )}
        </div>

        <div data-picker-scroll className="mt-4 min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          <div className="space-y-4">
            {creations.length > 0 && (
              <PickerBoard
                label="Our Creations"
                items={creations}
                indexByKey={indexByKey}
                activeIndex={activeIndex}
                landed={landed}
                activeTileRef={activeTileRef}
              />
            )}
            {basics.length > 0 && (
              <PickerBoard
                label="The Basics"
                items={basics}
                indexByKey={indexByKey}
                activeIndex={activeIndex}
                landed={landed}
                activeTileRef={activeTileRef}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PickerBoard({
  label,
  items,
  indexByKey,
  activeIndex,
  landed,
  activeTileRef,
}: {
  label: string;
  items: MenuItemSeed[];
  indexByKey: Map<string, number>;
  activeIndex: number;
  landed: boolean;
  activeTileRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {items.map((item) => {
          const index = indexByKey.get(itemKey(item)) ?? -1;
          const active = index === activeIndex;
          return (
            <div
              key={itemKey(item)}
              ref={active ? activeTileRef : undefined}
              className={cn(
                "truncate rounded-lg px-2.5 py-2 text-left text-xs leading-tight",
                active && "font-bold",
                landed && !active && "opacity-30"
              )}
              style={{
                backgroundColor: active ? "var(--color-green)" : "rgba(255,255,255,0.08)",
                color: active ? "var(--color-ink)" : "rgba(255,255,255,0.86)",
                transition: landed ? "opacity 280ms" : "none",
              }}
              aria-hidden="true"
            >
              {item.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
