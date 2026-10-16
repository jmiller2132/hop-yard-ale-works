"use client";

import { useState } from "react";
import Link from "next/link";
import type { TapBeer } from "@/lib/untappd-scrape";

// ─── Types ────────────────────────────────────────────────────────────────────

type StyleKey = "HAZY" | "WCIPA" | "STOUT" | "WHEAT" | "LAGER" | "SOUR" | "AMBER";
type Scores = Partial<Record<StyleKey, number>>;

// ─── Questions ────────────────────────────────────────────────────────────────
// 5 questions, higher point values (up to 5) for clearer separation between styles.

const QUESTIONS = [
  {
    id: "vibe",
    text: "How are you feeling right now?",
    emoji: "🍺",
    options: [
      {
        id: "light",
        label: "Light and easy — nothing too intense",
        scores: { WHEAT: 3, LAGER: 3, AMBER: 1 } as Scores,
      },
      {
        id: "bold",
        label: "Bold and full — I want to really taste it",
        scores: { STOUT: 4, AMBER: 2 } as Scores,
      },
      {
        id: "adventurous",
        label: "Adventurous — bring me something different",
        scores: { SOUR: 4, HAZY: 2 } as Scores,
      },
      {
        id: "hoppy",
        label: "Hoppy — it's always been my thing",
        scores: { HAZY: 3, WCIPA: 3 } as Scores,
      },
    ],
  },
  {
    id: "flavor",
    text: "What flavor actually sounds good right now?",
    emoji: "👅",
    options: [
      {
        id: "citrus",
        label: "Tropical / citrusy / juicy",
        scores: { HAZY: 5, WCIPA: 1, SOUR: 1 } as Scores,
      },
      {
        id: "roasty",
        label: "Roasty / coffee / chocolate",
        scores: { STOUT: 5, AMBER: 2 } as Scores,
      },
      {
        id: "crisp",
        label: "Crisp / clean / doesn't get in the way",
        scores: { LAGER: 5, WHEAT: 2 } as Scores,
      },
      {
        id: "tart",
        label: "Tart / bright / a little funky",
        scores: { SOUR: 5, HAZY: 1 } as Scores,
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
        label: "Keep it away — smooth all the way",
        scores: { WHEAT: 4, LAGER: 3, STOUT: 1 } as Scores,
      },
      {
        id: "little",
        label: "Subtle — in the background",
        scores: { AMBER: 4, HAZY: 2, WHEAT: 1 } as Scores,
      },
      {
        id: "balanced",
        label: "Balanced — present but not punishing",
        scores: { HAZY: 4, AMBER: 2, LAGER: 1 } as Scores,
      },
      {
        id: "high",
        label: "More the better — I want to feel it",
        scores: { WCIPA: 6, HAZY: 2 } as Scores,
      },
    ],
  },
  {
    id: "experience",
    text: "Where are you on the craft beer journey?",
    emoji: "🗺️",
    options: [
      {
        id: "new",
        label: "Relatively new — I want something approachable",
        scores: { LAGER: 3, WHEAT: 3, AMBER: 1 } as Scores,
      },
      {
        id: "comfortable",
        label: "Comfortable — I know a few styles I like",
        scores: { AMBER: 3, HAZY: 2, LAGER: 1 } as Scores,
      },
      {
        id: "ipa",
        label: "I drink mostly IPAs — that's my lane",
        scores: { HAZY: 3, WCIPA: 3 } as Scores,
      },
      {
        id: "seeker",
        label: "I always order the weirdest thing on the board",
        scores: { SOUR: 4, STOUT: 2 } as Scores,
      },
    ],
  },
  {
    id: "occasion",
    text: "What's the situation tonight?",
    emoji: "🌙",
    options: [
      {
        id: "first",
        label: "First beer — want something easy to start with",
        scores: { LAGER: 4, WHEAT: 3 } as Scores,
      },
      {
        id: "settling",
        label: "Settling in for a few — no rush",
        scores: { AMBER: 3, HAZY: 2, SOUR: 1 } as Scores,
      },
      {
        id: "pizza",
        label: "Having it with pizza or food",
        scores: { AMBER: 3, HAZY: 2, LAGER: 1 } as Scores,
      },
      {
        id: "memorable",
        label: "I want the one worth talking about tomorrow",
        scores: { STOUT: 3, SOUR: 3, HAZY: 1 } as Scores,
      },
    ],
  },
] as const;

// ─── Result copy ──────────────────────────────────────────────────────────────

const RESULTS: Record<
  StyleKey,
  {
    title: string;
    emoji: string;
    description: string;          // 2–3 sentences for primary result
    short: string;                // 1 sentence for runner-up cards
    menuNote: string;
  }
> = {
  HAZY: {
    title: "Hazy IPA",
    emoji: "🍊",
    description:
      "Juicy, tropical, low bitterness — the crowd-pleaser that actual hop-heads also love. Soft mouthfeel, big aroma, and the kind of beer that disappears before you expected it to. If someone at the table says they don't like IPAs, hand them one of these.",
    short: "Juicy, tropical, easy on the bitterness.",
    menuNote: "We keep at least one hazy on at all times.",
  },
  WCIPA: {
    title: "West Coast IPA",
    emoji: "🌲",
    description:
      "Crisp, dry, with a real bitter finish that lingers. This is the IPA that started the whole conversation — clean malt backbone, dank hop character, no frills. You know what you want and it's this.",
    short: "Crisp, bitter, dank. The classic.",
    menuNote: "Check the current tap list for our IPA lineup.",
  },
  STOUT: {
    title: "Stout or Porter",
    emoji: "☕",
    description:
      "Dark, roasty, maybe a hint of chocolate or coffee — but not heavy. A well-made stout is way more drinkable than people expect. You're here to taste something, not just drink something.",
    short: "Dark, roasty, chocolate and coffee notes.",
    menuNote: "We usually have a dark beer pouring. See what's on tap.",
  },
  WHEAT: {
    title: "Wheat Ale",
    emoji: "🌾",
    description:
      "Cloudy, soft, easy — sometimes a little citrusy, sometimes a hint of banana or clove. Criminally underrated. The kind of pint that disappears before you realize it and you don't feel bad about it.",
    short: "Soft, easy, slightly hazy and citrusy.",
    menuNote: "We love keeping a wheat or session beer on tap.",
  },
  LAGER: {
    title: "Lager or Pilsner",
    emoji: "🫧",
    description:
      "Clean, cold, crisp. A well-made lager is actually harder to pull off than most craft styles, which is exactly why it's worth ordering when a brewery does it right. You know good beer without needing it to be complicated.",
    short: "Clean, cold, crisp. Harder to make than it looks.",
    menuNote: "Check the tap list for what's cold and pouring.",
  },
  SOUR: {
    title: "Sour or Fruited Ale",
    emoji: "🍋",
    description:
      "Tart, bright, sometimes funky — and always more drinkable than it sounds. You're the person who orders the weird one and loves it every time. The table is going to ask for a sip.",
    short: "Tart, bright, funky. Always more drinkable than it sounds.",
    menuNote: "Check the rotating tap list for current sours.",
  },
  AMBER: {
    title: "Amber or Red Ale",
    emoji: "🍂",
    description:
      "Malty without being heavy, a touch of caramel, balanced hops — the Goldilocks beer. Not too light, not too dark, never a bad call. People who order ambers are quietly always right.",
    short: "Malty, caramel-forward, balanced. Never a bad call.",
    menuNote: "We keep a malt-forward option on rotation.",
  },
};

// ─── Scoring ──────────────────────────────────────────────────────────────────

type RankedResult = { key: StyleKey; score: number };

function rankResults(answers: Scores[]): RankedResult[] {
  const totals: Record<StyleKey, number> = {
    HAZY: 0, WCIPA: 0, STOUT: 0, WHEAT: 0, LAGER: 0, SOUR: 0, AMBER: 0,
  };
  for (const ans of answers) {
    for (const [k, v] of Object.entries(ans) as [StyleKey, number][]) {
      totals[k] = (totals[k] ?? 0) + v;
    }
  }
  return (Object.entries(totals) as [StyleKey, number][])
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0)
    .map(([key, score]) => ({ key: key as StyleKey, score }));
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BeerQuizProps {
  beers?: TapBeer[] | null;
}

export default function BeerQuiz({ beers }: BeerQuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Scores[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [ranked, setRanked] = useState<RankedResult[]>([]);

  const totalSteps = QUESTIONS.length;
  const isResult = step === totalSteps;
  const q = QUESTIONS[step] as (typeof QUESTIONS)[number] | undefined;

  function pick(scores: Scores, id: string) {
    if (chosen) return;
    setChosen(id);
    const next = [...answers, scores];
    setTimeout(() => {
      if (next.length === totalSteps) {
        setRanked(rankResults(next));
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
    setRanked([]);
  }

  // Helpers for result screen
  const primary = ranked[0] ?? null;
  const runners = ranked.slice(1, 3);

  // All live beers matching a given style key
  const beersFor = (key: StyleKey): TapBeer[] =>
    (beers ?? []).filter((b) => b.styleKey === key);

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:py-14">

      {/* Progress dots */}
      {!isResult && (
        <div className="mb-8 flex items-center gap-2">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                backgroundColor:
                  i < step
                    ? "var(--color-green)"
                    : i === step
                      ? "var(--color-ink)"
                      : "rgba(0,0,0,0.12)",
              }}
            />
          ))}
          <p className="ml-2 text-xs" style={{ color: "var(--color-muted)" }}>
            {step + 1} of {totalSteps}
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
                  className="w-full text-left px-5 py-4 rounded font-medium text-sm leading-snug min-h-[52px]"
                  style={{
                    backgroundColor: isSelected ? "var(--color-ink)" : "white",
                    color: isSelected ? "white" : "var(--color-ink)",
                    border: isSelected
                      ? "2px solid var(--color-ink)"
                      : "2px solid rgba(0,0,0,0.10)",
                    transform: isSelected ? "scale(1.01)" : "scale(1)",
                    boxShadow: isSelected ? "0 4px 20px rgba(0,0,0,0.12)" : "none",
                    cursor: chosen ? "default" : "pointer",
                    transition: "all 0.15s ease",
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
      {isResult && primary && (() => {
        const r = RESULTS[primary.key];
        const primaryBeers = beersFor(primary.key);
        const hasLive = primaryBeers.length > 0;

        return (
          <section aria-live="polite">

            {/* ── Primary result ── */}
            <div
              className="rounded-2xl p-7 mb-4"
              style={{ backgroundColor: "var(--color-ink)", color: "white" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.16em] mb-4"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {hasLive ? "On tap right now" : "Your style"}
              </p>

              <p className="text-5xl mb-3" aria-hidden="true">{r.emoji}</p>

              {hasLive ? (
                <>
                  {/* Show ALL matching beers — with their own Untappd description if available */}
                  <div className="divide-y divide-white/10">
                    {primaryBeers.map((beer, i) => (
                      <div key={beer.name} className={i > 0 ? "pt-5 mt-5" : ""}>
                        <h2
                          className="font-display text-4xl sm:text-5xl uppercase leading-[0.9]"
                          style={{ color: "white" }}
                        >
                          {beer.name}
                        </h2>
                        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                          {beer.style}{beer.abv ? ` · ${beer.abv}` : ""}
                        </p>
                        {beer.description && (
                          <p className="text-sm leading-relaxed mt-3" style={{ color: "rgba(255,255,255,0.75)" }}>
                            {beer.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Only show generic style blurb if none of the beers had a description */}
                  {primaryBeers.every((b) => !b.description) && (
                    <p className="text-sm leading-relaxed mt-5" style={{ color: "rgba(255,255,255,0.75)" }}>
                      {r.description}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2
                    className="font-display text-4xl sm:text-5xl uppercase leading-[0.9] mb-2"
                    style={{ color: "white" }}
                  >
                    {r.title}
                  </h2>
                  <p className="text-sm leading-relaxed mt-4" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {r.description}
                  </p>
                </>
              )}
            </div>

            {/* ── Runners-up ── */}
            {runners.length > 0 && (
              <>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.14em] mb-3 mt-6"
                  style={{ color: "var(--color-muted)" }}
                >
                  Also worth trying
                </p>
                <div className={`grid gap-3 ${runners.length > 1 ? "sm:grid-cols-2" : ""}`}>
                  {runners.map(({ key }) => {
                    const rr = RESULTS[key];
                    const runnerBeers = beersFor(key);
                    const matchedBeer = runnerBeers[0] ?? null;
                    return (
                      <div
                        key={key}
                        className="rounded-xl p-5"
                        style={{
                          backgroundColor: "white",
                          border: "1px solid rgba(0,0,0,0.10)",
                        }}
                      >
                        <p className="text-2xl mb-2" aria-hidden="true">{rr.emoji}</p>

                        {/* Style category always shown */}
                        <p className="font-display text-lg uppercase leading-tight" style={{ color: "var(--color-ink)" }}>
                          {rr.title}
                        </p>

                        {/* If a beer is on tap, show it under the style name */}
                        {matchedBeer && (
                          <p className="text-sm font-semibold mt-1" style={{ color: "var(--color-teal)" }}>
                            On tap: {matchedBeer.name}
                            {beersFor(key).length > 1 && ` +${beersFor(key).length - 1} more`}
                          </p>
                        )}

                        <p className="text-xs leading-relaxed mt-2" style={{ color: "var(--color-muted)" }}>
                          {matchedBeer?.description ?? rr.short}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── CTAs ── */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/appleton-drinks-menu/"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold min-h-[48px] hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
              >
                Appleton Tap List
              </Link>
              <Link
                href="/the-falls-drinks-menu/"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold min-h-[48px] hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--color-ink)", color: "white" }}
              >
                Falls Tap List
              </Link>
            </div>

            <button
              onClick={restart}
              className="mt-5 text-sm underline underline-offset-4 hover:opacity-70 transition-opacity"
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
