"use client";

import { useState } from "react";
import Link from "next/link";
import type { TapBeer } from "@/lib/untappd-scrape";

// ─── Data ─────────────────────────────────────────────────────────────────────

type StyleKey = "HAZY" | "WCIPA" | "STOUT" | "WHEAT" | "LAGER" | "SOUR" | "AMBER";
type Scores = Partial<Record<StyleKey, number>>;

const QUESTIONS = [
  {
    id: "vibe",
    text: "How are you feeling right now?",
    emoji: "🍺",
    options: [
      {
        id: "easy",
        label: "Light and easy — nothing too heavy",
        scores: { WHEAT: 2, LAGER: 2, AMBER: 1 } as Scores,
      },
      {
        id: "bold",
        label: "Bold and intense — I want to taste it",
        scores: { STOUT: 3, AMBER: 1 } as Scores,
      },
      {
        id: "adventurous",
        label: "Adventurous — surprise me",
        scores: { SOUR: 3, HAZY: 1 } as Scores,
      },
      {
        id: "hoppy",
        label: "Hoppy — that's always been my thing",
        scores: { HAZY: 2, WCIPA: 2 } as Scores,
      },
    ],
  },
  {
    id: "flavor",
    text: "Pick the flavor that sounds good right now.",
    emoji: "👅",
    options: [
      {
        id: "citrus",
        label: "Citrusy / tropical / juicy",
        scores: { HAZY: 3, WCIPA: 1 } as Scores,
      },
      {
        id: "roasty",
        label: "Roasty / coffee / chocolate",
        scores: { STOUT: 3, AMBER: 1 } as Scores,
      },
      {
        id: "crisp",
        label: "Crisp / clean / refreshing",
        scores: { LAGER: 3, WHEAT: 1 } as Scores,
      },
      {
        id: "tart",
        label: "Tart / fruity / a little funky",
        scores: { SOUR: 3 } as Scores,
      },
    ],
  },
  {
    id: "bitter",
    text: "How do you feel about bitterness?",
    emoji: "🌿",
    options: [
      {
        id: "none",
        label: "Not my thing — keep it smooth",
        scores: { WHEAT: 2, LAGER: 2, STOUT: 1 } as Scores,
      },
      {
        id: "little",
        label: "A little goes a long way",
        scores: { AMBER: 2, HAZY: 1 } as Scores,
      },
      {
        id: "medium",
        label: "Balanced — I like it in check",
        scores: { HAZY: 2, AMBER: 1, LAGER: 1 } as Scores,
      },
      {
        id: "high",
        label: "Bring it on. The more the better.",
        scores: { WCIPA: 3, HAZY: 1 } as Scores,
      },
    ],
  },
  {
    id: "food",
    text: "What are you eating with it?",
    emoji: "🍕",
    options: [
      {
        id: "pizza",
        label: "Wood-fired pizza — it's the obvious move",
        scores: { HAZY: 1, AMBER: 1, LAGER: 1 } as Scores,
      },
      {
        id: "nothing",
        label: "Nothing — just the beer",
        scores: { LAGER: 2, SOUR: 1 } as Scores,
      },
      {
        id: "light",
        label: "Something light or a salad",
        scores: { WHEAT: 2, LAGER: 1, SOUR: 1 } as Scores,
      },
      {
        id: "hearty",
        label: "Something rich and hearty",
        scores: { STOUT: 2, AMBER: 1 } as Scores,
      },
    ],
  },
] as const;

const RESULTS: Record<
  StyleKey,
  {
    title: string;
    emoji: string;
    description: string;
    menuNote: string;
  }
> = {
  HAZY: {
    title: "Hazy IPA",
    emoji: "🍊",
    description:
      "Juicy, tropical, soft. Hazy IPAs are the crowd-pleaser that actual hop-heads also love. Low bitterness, big aroma — the kind of beer that goes down too easy.",
    menuNote: "We keep at least one hazy on at all times. Check the tap list.",
  },
  WCIPA: {
    title: "West Coast IPA",
    emoji: "🌲",
    description:
      "Crisp, dry, with a real bitter finish. This is the IPA that started the whole conversation. Clean malt backbone, dank hop character. No frills.",
    menuNote: "Check the current tap list for our IPA lineup.",
  },
  STOUT: {
    title: "Stout or Porter",
    emoji: "☕",
    description:
      "Dark, roasty, maybe a hint of chocolate or coffee — but not heavy. A well-made stout is incredibly drinkable. You're not here to mess around.",
    menuNote: "We usually have a dark beer pouring. See what's on tap.",
  },
  WHEAT: {
    title: "Wheat Ale",
    emoji: "🌾",
    description:
      "Cloudy, soft, a little citrusy — easy to drink and criminally underrated. The kind of pint that disappears before you realize it. No complaints.",
    menuNote: "See what's pouring — we love keeping a wheat or session beer on.",
  },
  LAGER: {
    title: "Lager or Pilsner",
    emoji: "🫧",
    description:
      "Clean, cold, crisp. A well-made lager is harder to pull off than people think, which is exactly why we enjoy the challenge. You know good beer without needing it to be complicated.",
    menuNote: "Check the tap list for what's cold and pouring.",
  },
  SOUR: {
    title: "Sour or Fruited Ale",
    emoji: "🍋",
    description:
      "Tart, bright, sometimes a little funky. You're the person who orders the weird one on the menu and loves it every time. People at your table are always asking for a sip.",
    menuNote: "Check the rotating tap list for current sours and fruited beers.",
  },
  AMBER: {
    title: "Amber or Red Ale",
    emoji: "🍂",
    description:
      "Malty without being heavy. A little caramel, a touch of hops, well-balanced all the way through. People who order these are always right.",
    menuNote: "We keep a malt-forward option on rotation — see what's pouring.",
  },
};

// ─── Scoring ──────────────────────────────────────────────────────────────────

function calculateResult(answers: Scores[]): StyleKey {
  const totals: Record<StyleKey, number> = {
    HAZY: 0, WCIPA: 0, STOUT: 0, WHEAT: 0, LAGER: 0, SOUR: 0, AMBER: 0,
  };
  for (const ans of answers) {
    for (const [k, v] of Object.entries(ans) as [StyleKey, number][]) {
      totals[k] = (totals[k] ?? 0) + v;
    }
  }
  return (Object.entries(totals) as [StyleKey, number][]).reduce((best, cur) =>
    cur[1] > totals[best] ? cur[0] : best,
    "HAZY" as StyleKey
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BeerQuizProps {
  /** Live tap beers from Untappd. When present, result shows a specific beer. */
  beers?: TapBeer[] | null;
}

export default function BeerQuiz({ beers }: BeerQuizProps) {
  const [step, setStep] = useState(0); // 0…QUESTIONS.length = answering; length = result
  const [answers, setAnswers] = useState<Scores[]>([]);
  const [chosen, setChosen] = useState<string | null>(null); // currently highlighted option
  const [result, setResult] = useState<StyleKey | null>(null);

  const totalSteps = QUESTIONS.length;
  const isResult = step === totalSteps;
  const q = QUESTIONS[step] as (typeof QUESTIONS)[number] | undefined;

  function pick(scores: Scores, id: string) {
    if (chosen) return; // prevent double-tap
    setChosen(id);
    const next = [...answers, scores];
    setTimeout(() => {
      if (next.length === totalSteps) {
        setResult(calculateResult(next));
        setStep(totalSteps);
      } else {
        setAnswers(next);
        setStep((s) => s + 1);
        setChosen(null);
      }
    }, 280);
  }

  function restart() {
    setStep(0);
    setAnswers([]);
    setChosen(null);
    setResult(null);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:py-14">
      {/* Progress bar */}
      {!isResult && (
        <div className="mb-8">
          <div
            className="h-1 w-full rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
            role="progressbar"
            aria-valuenow={step}
            aria-valuemax={totalSteps}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(step / totalSteps) * 100}%`,
                backgroundColor: "var(--color-green)",
              }}
            />
          </div>
          <p className="mt-2 text-right text-xs" style={{ color: "var(--color-muted)" }}>
            {step} of {totalSteps}
          </p>
        </div>
      )}

      {/* Question */}
      {!isResult && q && (
        <section key={step} aria-live="polite">
          <p className="mb-3 text-4xl" aria-hidden="true">{q.emoji}</p>
          <h2
            className="font-display text-3xl sm:text-4xl uppercase leading-tight mb-8"
            style={{ color: "var(--color-ink)" }}
          >
            {q.text}
          </h2>

          <div className="space-y-3">
            {q.options.map((opt) => {
              const isSelected = chosen === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => pick(opt.scores, opt.id)}
                  disabled={!!chosen}
                  className="w-full text-left px-5 py-4 rounded-xl font-medium text-sm leading-snug transition-all duration-150 min-h-[52px]"
                  style={{
                    backgroundColor: isSelected
                      ? "var(--color-green)"
                      : "white",
                    color: isSelected ? "white" : "var(--color-ink)",
                    border: isSelected
                      ? "2px solid var(--color-green)"
                      : "2px solid rgba(0,0,0,0.10)",
                    transform: isSelected ? "scale(1.01)" : "scale(1)",
                    boxShadow: isSelected
                      ? "0 4px 16px rgba(47,107,50,0.18)"
                      : "none",
                    cursor: chosen ? "default" : "pointer",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Result */}
      {isResult && result && (() => {
        const matchedBeer = beers?.find((b) => b.styleKey === result) ?? null;
        const r = RESULTS[result];
        return (
          <section aria-live="polite" className="text-center">
            <p className="text-6xl mb-4" aria-hidden="true">{r.emoji}</p>

            {matchedBeer ? (
              <>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "var(--color-muted)" }}
                >
                  On tap right now
                </p>
                <h2
                  className="font-display text-5xl sm:text-6xl uppercase leading-[0.9] mb-2"
                  style={{ color: "var(--color-ink)" }}
                >
                  {matchedBeer.name}
                </h2>
                <p
                  className="text-sm mb-5"
                  style={{ color: "var(--color-muted)" }}
                >
                  {matchedBeer.style}
                </p>
                <p
                  className="text-base leading-relaxed mb-4 mx-auto max-w-sm"
                  style={{ color: "var(--color-ink)", opacity: 0.8 }}
                >
                  {r.description}
                </p>
              </>
            ) : (
              <>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "var(--color-muted)" }}
                >
                  Your style
                </p>
                <h2
                  className="font-display text-5xl sm:text-6xl uppercase leading-[0.9] mb-6"
                  style={{ color: "var(--color-ink)" }}
                >
                  {r.title}
                </h2>
                <p
                  className="text-base leading-relaxed mb-4 mx-auto max-w-sm"
                  style={{ color: "var(--color-ink)", opacity: 0.8 }}
                >
                  {r.description}
                </p>
              </>
            )}

            <p className="text-sm italic mb-8" style={{ color: "var(--color-muted)" }}>
              {matchedBeer ? "Check the full tap list for what else is pouring." : r.menuNote}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/appleton-drinks-menu/"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold min-h-[48px] hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
              >
                See Appleton Tap List
              </Link>
              <Link
                href="/the-falls-drinks-menu/"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold min-h-[48px] hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--color-ink)", color: "white" }}
              >
                See Falls Tap List
              </Link>
            </div>

            <button
              onClick={restart}
              className="mt-6 text-sm underline underline-offset-4 hover:opacity-70 transition-opacity"
              style={{ color: "var(--color-muted)" }}
            >
              Try again
            </button>
          </section>
        );
      })()}
    </div>
  );
}
