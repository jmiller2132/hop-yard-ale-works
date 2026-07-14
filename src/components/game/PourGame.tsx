"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";

// ─── Config ───────────────────────────────────────────────────────────────────
// Foam = 27% of beer fill level. A perfect pour stops beer at ~74.8% so
// foam rises to bring total to ~95% (just at the rim).
const FOAM_FACTOR  = 0.27;
const RIM_TARGET   = 95;   // ideal total (beer + foam) in % of glass
const FOAM_RISE_MS = 1500; // ms for foam animation to complete
const RESULT_WAIT  = 900;  // ms to show result before advancing

// Green zone = fill range where total lands within 12% of rim (GOOD or better)
const ZONE_MIN = Math.round((RIM_TARGET - 12) / (1 + FOAM_FACTOR)); // ~65
const ZONE_MAX = Math.round((RIM_TARGET + 8)  / (1 + FOAM_FACTOR)); // ~81

const LEVELS = [
  { spd: 0.18, name: "ROOKIE" },
  { spd: 0.26, name: "CASUAL" },
  { spd: 0.35, name: "REGULAR" },
  { spd: 0.44, name: "BARFLY" },
  { spd: 0.54, name: "CRAFTSMAN" },
  { spd: 0.65, name: "BARTENDER" },
  { spd: 0.78, name: "LEGEND" },
] as const;

const MAX_LIVES    = 3;
const ROUNDS_PER_LVL = 3;
const LB_KEY       = "hyw-pour-v2";
const LB_SIZE      = 10;

// ─── SVG glass geometry ───────────────────────────────────────────────────────
const GW = 150, GH = 300;
const GT = 8, GB = GH - 8;
const INNER_H = GB - GT;           // 284 usable px
const TL = 14, TR = GW - 14;      // top rim x
const BL = 38, BR = GW - 38;      // bottom x
const CLIP_D = `M ${TL} ${GT} L ${TR} ${GT} L ${BR} ${GB} L ${BL} ${GB} Z`;

// fill% → SVG y (0% = bottom, 100% = top of glass)
const pctY = (p: number) => GT + INNER_H * (1 - p / 100);

// ─── Types ────────────────────────────────────────────────────────────────────
type Grade = "PERFECT!" | "GREAT" | "GOOD" | "MISS";
type Phase = "idle" | "ready" | "pouring" | "foam" | "result" | "dead" | "initials" | "board";
interface LBEntry { initials: string; score: number }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const readLB    = (): LBEntry[] => { try { return JSON.parse(localStorage.getItem(LB_KEY) ?? "[]"); } catch { return []; } };
const writeLB   = (lb: LBEntry[]) => { try { localStorage.setItem(LB_KEY, JSON.stringify(lb)); } catch {} };
const insertLB  = (lb: LBEntry[], e: LBEntry) => [...lb, e].sort((a, b) => b.score - a.score).slice(0, LB_SIZE);
const qualifies = (lb: LBEntry[], s: number) => s > 0 && (lb.length < LB_SIZE || s > (lb.at(-1)?.score ?? 0));

const GRADE_COLOR: Record<Grade, string> = {
  "PERFECT!": "#69f0ae",
  "GREAT":    "#ffca28",
  "GOOD":     "#ff9800",
  "MISS":     "#ef5350",
};

function scorePour(fill: number): { pts: number; grade: Grade } {
  const total = fill * (1 + FOAM_FACTOR);
  const d = Math.abs(total - RIM_TARGET);
  if (d <= 2)  return { pts: 100, grade: "PERFECT!" };
  if (d <= 5)  return { pts: 75,  grade: "GREAT" };
  if (d <= 12) return { pts: 40,  grade: "GOOD" };
  return { pts: 0, grade: "MISS" };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PourGame() {
  // Refs for all volatile state — prevents stale closures in callbacks
  const fillR    = useRef(0);
  const livesR   = useRef(MAX_LIVES);
  const scoreR   = useRef(0);
  const levelR   = useRef(0);
  const roundR   = useRef(0);
  const pouringR = useRef(false);
  const rafR     = useRef<number | null>(null);
  const foamIvR  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Render state
  const [fill,     setFill]  = useState(0);
  const [foam,     setFoam]  = useState(0);   // foam height in % of glass
  const [lives,    setLives] = useState(MAX_LIVES);
  const [score,    setScore] = useState(0);
  const [lvIdx,    setLvIdx] = useState(0);
  const [curGrade, setCG]    = useState<Grade | null>(null);
  const [curPts,   setCP]    = useState(0);
  const [phase,    setPh]    = useState<Phase>("idle");
  const [initials, setIn]    = useState("");
  const [lb,       setLB]    = useState<LBEntry[]>([]);
  const [newIdx,   setNI]    = useState<number | null>(null);

  useEffect(() => { setLB(readLB()); }, []);

  const lv = LEVELS[Math.min(lvIdx, LEVELS.length - 1)];

  // ── After foam settles: score and advance ──────────────────────────────────
  const evaluate = useCallback((fill: number) => {
    const { pts, grade } = scorePour(fill);
    setCG(grade);
    setCP(pts);
    setPh("result");

    if (pts === 0) {
      livesR.current = Math.max(0, livesR.current - 1);
      setLives(livesR.current);
    } else {
      scoreR.current += pts;
      setScore(scoreR.current);
      roundR.current++;
      if (roundR.current >= ROUNDS_PER_LVL) {
        roundR.current = 0;
        levelR.current = Math.min(levelR.current + 1, LEVELS.length - 1);
        setLvIdx(levelR.current);
      }
    }

    setTimeout(() => {
      if (livesR.current <= 0) {
        const saved = readLB();
        if (qualifies(saved, scoreR.current)) { setPh("initials"); setIn(""); }
        else { setLB(saved); setPh("dead"); }
        return;
      }
      fillR.current = 0;
      setFill(0); setFoam(0); setCG(null);
      setPh("ready");
    }, RESULT_WAIT);
  }, []);

  // ── Animate foam rising after release ──────────────────────────────────────
  const riseFoam = useCallback((fill: number) => {
    if (foamIvR.current) clearInterval(foamIvR.current);
    setPh("foam");

    const foamTarget = fill * FOAM_FACTOR;
    const STEPS = 45;
    const stepAmt = foamTarget / STEPS;
    let current = 0;

    foamIvR.current = setInterval(() => {
      current = Math.min(foamTarget, current + stepAmt);
      setFoam(current);
      if (current >= foamTarget) {
        clearInterval(foamIvR.current!);
        foamIvR.current = null;
        setTimeout(() => evaluate(fill), 400);
      }
    }, FOAM_RISE_MS / STEPS);
  }, [evaluate]);

  // ── Stop pour → trigger foam animation ────────────────────────────────────
  const stopPour = useCallback(() => {
    if (!pouringR.current) return;
    pouringR.current = false;
    if (rafR.current) { cancelAnimationFrame(rafR.current); rafR.current = null; }
    riseFoam(fillR.current);
  }, [riseFoam]);

  // ── Pour loop (RAF) ────────────────────────────────────────────────────────
  const loopRef = useRef<() => void>(() => {});
  useEffect(() => {
    loopRef.current = () => {
      if (!pouringR.current) return;
      const spd = LEVELS[Math.min(levelR.current, LEVELS.length - 1)].spd;
      fillR.current = Math.min(100, fillR.current + spd);
      setFill(fillR.current);
      if (fillR.current >= 100) {
        stopPour();
      } else {
        rafR.current = requestAnimationFrame(loopRef.current);
      }
    };
  }, [stopPour]);

  // ── Start pour ─────────────────────────────────────────────────────────────
  const startPour = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    if (pouringR.current) return;
    if (phase !== "ready" && phase !== "idle") return;

    if (phase === "idle") {
      // Fresh game
      fillR.current = 0; livesR.current = MAX_LIVES;
      scoreR.current = 0; levelR.current = 0; roundR.current = 0;
      setFill(0); setFoam(0); setLives(MAX_LIVES);
      setScore(0); setLvIdx(0); setCG(null);
    }

    pouringR.current = true;
    setFoam(0);
    setPh("pouring");
    rafR.current = requestAnimationFrame(loopRef.current);
  }, [phase]);

  // ── Global pointer-up stops pour (prevents false stops from button leave) ──
  useEffect(() => {
    if (phase !== "pouring") return;
    const stop = () => stopPour();
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [phase, stopPour]);

  const restart = useCallback(() => {
    if (foamIvR.current) clearInterval(foamIvR.current);
    fillR.current = 0;
    setFill(0); setFoam(0); setCG(null);
    setPh("idle");
  }, []);

  const submitInitials = useCallback(() => {
    const ini = initials.toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 3).padEnd(3, "_");
    const entry: LBEntry = { initials: ini, score: scoreR.current };
    const saved   = readLB();
    const updated = insertLB(saved, entry);
    writeLB(updated);
    const idx = updated.findIndex(e => e.initials === ini && e.score === entry.score);
    setLB(updated); setNI(idx >= 0 ? idx : null); setPh("board");
  }, [initials]);

  useEffect(() => () => {
    pouringR.current = false;
    if (rafR.current) cancelAnimationFrame(rafR.current);
    if (foamIvR.current) clearInterval(foamIvR.current);
  }, []);

  const showGlass    = ["idle", "ready", "pouring", "foam", "result"].includes(phase);
  const showPourArea = phase === "idle" || phase === "ready";
  const isPouring    = phase === "pouring";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start select-none"
      style={{ backgroundColor: "#1a0d05", color: "white", paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Title */}
      <div className="text-center pt-5 pb-3 px-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#c87820" }}>
          Hidden Tap
        </p>
        <h1 className="font-heading text-4xl font-bold mt-0.5" style={{ color: "#f5e6c8" }}>
          Perfect Pour
        </h1>
      </div>

      {/* HUD */}
      {!["idle", "board", "dead", "initials"].includes(phase) && (
        <div
          className="flex justify-between items-center w-full max-w-xs px-4 py-2 mb-2 rounded-xl"
          style={{ backgroundColor: "#2a1808", border: "1px solid #3a2510" }}
        >
          <div>
            <div className="text-xs uppercase tracking-wider" style={{ color: "rgba(245,230,200,0.35)" }}>Score</div>
            <div className="font-mono text-xl font-bold tabular-nums leading-tight" style={{ color: "#e8a020" }}>
              {String(score).padStart(5, "0")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider" style={{ color: "rgba(245,230,200,0.35)" }}>Level</div>
            <div className="text-sm font-bold leading-tight" style={{ color: "#f5e6c8" }}>{lv.name}</div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider" style={{ color: "rgba(245,230,200,0.35)" }}>Lives</div>
            <div className="flex gap-1 justify-end mt-0.5">
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <span key={i} style={{ fontSize: 14, opacity: i < lives ? 1 : 0.12 }}>🍺</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grade display */}
      <div style={{ minHeight: 36 }} className="flex items-center justify-center">
        {curGrade && (
          <div
            className="font-bold text-2xl tracking-widest text-center"
            style={{ color: GRADE_COLOR[curGrade], textShadow: `0 0 24px ${GRADE_COLOR[curGrade]}50` }}
          >
            {curGrade}
            {curPts > 0 && (
              <span className="text-sm ml-2" style={{ color: "rgba(255,255,255,0.4)" }}>+{curPts}</span>
            )}
          </div>
        )}
      </div>

      {/* Glass */}
      {showGlass && (
        <PintGlass
          fill={fill}
          foam={foam}
          pouring={isPouring}
          showZone={showPourArea || isPouring}
        />
      )}

      {/* Hint text */}
      {showGlass && (
        <p className="text-xs mt-3 text-center px-4" style={{ color: "rgba(245,230,200,0.3)", minHeight: 18 }}>
          {(showPourArea) && "Release in the green zone — foam will rise to the brim"}
          {isPouring     && "Release now to stop the pour"}
          {phase === "foam" && "Watching the head settle…"}
        </p>
      )}

      {/* Pour control — full area, onPointerDown to start, global pointerup to stop */}
      {(showPourArea || isPouring) && (
        <div
          className="w-full max-w-xs mt-4 rounded-2xl flex flex-col items-center justify-center"
          style={{
            height: 88,
            backgroundColor: isPouring ? "#3a2010" : "#2a1808",
            border: `2px solid ${isPouring ? "#e8a020" : "#4a2e10"}`,
            boxShadow: isPouring ? "0 0 20px rgba(232,160,32,0.18)" : "none",
            transition: "border-color 0.1s, background-color 0.1s, box-shadow 0.1s",
            touchAction: "none",
            cursor: isPouring ? "default" : "pointer",
            userSelect: "none",
          }}
          onPointerDown={showPourArea ? startPour : undefined}
        >
          <p
            className="font-bold text-lg pointer-events-none"
            style={{ color: isPouring ? "#e8a020" : "#c87820" }}
          >
            {isPouring ? "RELEASE TO STOP" : phase === "idle" ? "HOLD TO START" : "HOLD TO POUR"}
          </p>
          {!isPouring && (
            <p className="text-xs mt-1 pointer-events-none" style={{ color: "rgba(245,230,200,0.2)" }}>
              Hold your finger down, release at the zone
            </p>
          )}
        </div>
      )}

      {/* Other screens */}
      {phase === "dead" && (
        <DeadScreen score={score} lb={lb} onRestart={restart} />
      )}
      {phase === "initials" && (
        <InitScreen
          score={score}
          initials={initials}
          onChange={setIn}
          onSubmit={submitInitials}
        />
      )}
      {phase === "board" && (
        <BoardScreen lb={lb} newIdx={newIdx} onRestart={restart} />
      )}

      {phase === "idle" && lb.length > 0 && (
        <div className="w-full max-w-xs px-4 mt-5">
          <Leaderboard lb={lb} newIdx={null} />
        </div>
      )}

      <Link
        href="/"
        className="mt-6 mb-8 text-xs hover:underline underline-offset-4"
        style={{ color: "rgba(255,255,255,0.12)" }}
      >
        Back to the real world
      </Link>
    </div>
  );
}

// ─── Pint Glass SVG ───────────────────────────────────────────────────────────
function PintGlass({
  fill, foam, pouring, showZone,
}: {
  fill: number; foam: number; pouring: boolean; showZone: boolean;
}) {
  const fillY    = pctY(fill);
  const foamPx   = (foam / 100) * INNER_H;       // foam in SVG px
  const foamTopY = fillY - foamPx;                // top of foam (rises upward)
  const rimY     = pctY(RIM_TARGET);              // target fill line
  const zTopY    = pctY(ZONE_MAX);
  const zBotY    = pctY(ZONE_MIN);

  return (
    <div className="relative flex justify-center" style={{ touchAction: "none" }}>
      {/* Pour stream — above the glass rim */}
      <div
        style={{
          position: "absolute",
          top: -32,
          left: "50%",
          transform: "translateX(-50%)",
          width: 8,
          height: 36,   // reaches down to the SVG rim
          opacity: pouring ? 1 : 0,
          transition: "opacity 0.12s",
          background: "linear-gradient(to bottom, transparent 0%, rgba(232,160,32,0.7) 50%, rgba(220,140,20,0.9) 100%)",
          borderRadius: "2px 2px 0 0",
        }}
      />

      <svg
        width={GW}
        height={GH}
        viewBox={`0 0 ${GW} ${GH}`}
        style={{ display: "block", touchAction: "none" }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="pg3">
            <path d={CLIP_D} />
          </clipPath>
          <linearGradient id="beer3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#8a5010" />
            <stop offset="25%"  stopColor="#c87820" />
            <stop offset="55%"  stopColor="#e8a030" />
            <stop offset="80%"  stopColor="#d09030" />
            <stop offset="100%" stopColor="#8a5010" />
          </linearGradient>
          <linearGradient id="shine3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.20)" />
            <stop offset="22%"  stopColor="rgba(255,255,255,0.07)" />
            <stop offset="78%"  stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.20)" />
          </linearGradient>
          {/* Stream gradient: bright center, dark edges — looks like falling liquid */}
          <linearGradient id="stream3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(160,90,10,0.5)" />
            <stop offset="35%"  stopColor="rgba(232,160,32,0.85)" />
            <stop offset="55%"  stopColor="rgba(255,185,55,0.95)" />
            <stop offset="100%" stopColor="rgba(160,90,10,0.5)" />
          </linearGradient>
        </defs>

        {/* Green zone band (shown while ready/pouring) */}
        {showZone && (
          <rect
            x={0} y={zTopY}
            width={GW} height={Math.max(0, zBotY - zTopY)}
            fill="rgba(74,170,100,0.18)"
            clipPath="url(#pg3)"
          />
        )}

        {/* Beer fill */}
        {fill > 0 && (
          <rect
            x={0} y={fillY}
            width={GW} height={Math.max(0, GB - fillY)}
            fill="url(#beer3)"
            clipPath="url(#pg3)"
          />
        )}

        {/* Pour stream inside glass — rim to current beer surface */}
        {pouring && (
          <>
            <rect
              x={GW / 2 - 4}
              y={GT}
              width={8}
              height={Math.max(0, fillY - GT)}
              fill="url(#stream3)"
              clipPath="url(#pg3)"
            />
            {/* Splash where stream hits beer surface */}
            {fill > 1 && (
              <ellipse
                cx={GW / 2}
                cy={fillY}
                rx={14}
                ry={3.5}
                fill="rgba(240,165,35,0.38)"
                clipPath="url(#pg3)"
              />
            )}
          </>
        )}

        {/* Foam — rises from beer surface upward */}
        {foam > 0 && fill > 0 && foamPx > 0.5 && (
          <>
            {/* Main foam body */}
            <rect
              x={0}
              y={Math.max(GT, foamTopY)}
              width={GW}
              height={Math.min(foamPx, fillY - Math.max(GT, foamTopY))}
              fill="rgba(255,252,240,0.94)"
              clipPath="url(#pg3)"
            />
            {/* Bubble layer on top of foam */}
            {([0.15, 0.32, 0.50, 0.68, 0.84] as const).map((t, i) => (
              <ellipse
                key={i}
                cx={GW * t}
                cy={Math.max(GT + 4, foamTopY + 4 + (i % 2) * 3)}
                rx={2 + (i % 3) * 1.2}
                ry={1.8}
                fill="rgba(255,255,255,0.55)"
                clipPath="url(#pg3)"
              />
            ))}
          </>
        )}

        {/* Glass shine overlay */}
        <rect x={0} y={0} width={GW} height={GH} fill="url(#shine3)" clipPath="url(#pg3)" />

        {/* Target rim line (dashed, always visible) */}
        <line
          x1={TL + 6} y1={rimY} x2={TR - 6} y2={rimY}
          stroke="rgba(74,170,100,0.45)"
          strokeWidth="1.5"
          strokeDasharray="5 3"
          clipPath="url(#pg3)"
        />

        {/* Glass wall outline */}
        <path d={CLIP_D} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

        {/* Glass rim highlight */}
        <line
          x1={TL} y1={GT} x2={TR} y2={GT}
          stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" strokeLinecap="round"
        />

        {/* Zone bracket ticks (left side) */}
        {showZone && (
          <>
            <line x1={2} y1={zTopY} x2={TL - 2} y2={zTopY} stroke="#4aaa64" strokeWidth="1.5" />
            <line x1={2} y1={zBotY} x2={TL - 2} y2={zBotY} stroke="#4aaa64" strokeWidth="1.5" />
            <line x1={3} y1={zTopY} x2={3} y2={zBotY} stroke="#4aaa64" strokeWidth="1" strokeDasharray="2 2" />
          </>
        )}
      </svg>
    </div>
  );
}

// ─── Supporting screens ───────────────────────────────────────────────────────
function DeadScreen({ score, lb, onRestart }: { score: number; lb: LBEntry[]; onRestart: () => void }) {
  return (
    <div className="flex flex-col items-center w-full max-w-xs px-4 pt-2">
      <p className="font-bold text-xl mb-1" style={{ color: "#ef5350" }}>GAME OVER</p>
      <p className="text-sm mb-3" style={{ color: "rgba(245,230,200,0.35)" }}>
        You spilled more than you served.
      </p>
      <p className="font-mono text-5xl font-bold mb-6" style={{ color: "#e8a020" }}>
        {String(score).padStart(5, "0")}
      </p>
      <button
        onClick={onRestart}
        className="rounded-xl px-10 py-3 font-bold mb-6 transition-opacity hover:opacity-85"
        style={{ backgroundColor: "#2a1808", border: "2px solid #c87820", color: "#c87820" }}
      >
        TRY AGAIN
      </button>
      {lb.length > 0 && <Leaderboard lb={lb} newIdx={null} />}
    </div>
  );
}

function InitScreen({
  score, initials, onChange, onSubmit,
}: {
  score: number; initials: string; onChange: (v: string) => void; onSubmit: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center px-4 pt-2">
      <p className="font-bold text-lg mb-1" style={{ color: "#e8a020" }}>★ HIGH SCORE ★</p>
      <p className="font-mono text-5xl font-bold mb-5" style={{ color: "#e8a020" }}>
        {String(score).padStart(5, "0")}
      </p>
      <p className="text-sm mb-4" style={{ color: "rgba(245,230,200,0.45)" }}>ENTER YOUR INITIALS</p>
      <div className="flex gap-3 mb-5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="font-mono text-3xl font-bold flex items-center justify-center rounded-lg"
            style={{
              width: 56, height: 64,
              backgroundColor: "#2a1808",
              border: `2px solid ${i === initials.length && initials.length < 3 ? "#c87820" : "#3a2510"}`,
              color: initials[i] ? "#f5e6c8" : "rgba(245,230,200,0.15)",
              boxShadow: i === initials.length && initials.length < 3 ? "0 0 10px rgba(200,120,32,0.35)" : "none",
            }}
          >
            {initials[i] ?? (i === initials.length ? <BlinkCursor /> : "_")}
          </div>
        ))}
      </div>
      <input
        type="text"
        maxLength={3}
        value={initials}
        onChange={e => onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 3))}
        onKeyDown={e => { if (e.key === "Enter" && initials.trim().length > 0) onSubmit(); }}
        className="sr-only"
        autoFocus
        autoComplete="off"
        spellCheck={false}
      />
      <button
        onClick={onSubmit}
        disabled={initials.trim().length === 0}
        className="rounded-xl px-10 py-3 font-bold transition-opacity hover:opacity-85 disabled:opacity-30"
        style={{ backgroundColor: "#2a1808", border: "2px solid #c87820", color: "#c87820" }}
      >
        REGISTER
      </button>
    </div>
  );
}

function BoardScreen({ lb, newIdx, onRestart }: { lb: LBEntry[]; newIdx: number | null; onRestart: () => void }) {
  return (
    <div className="flex flex-col items-center w-full max-w-xs px-4 pt-2">
      <Leaderboard lb={lb} newIdx={newIdx} />
      <button
        onClick={onRestart}
        className="mt-5 rounded-xl px-10 py-3 font-bold transition-opacity hover:opacity-85"
        style={{ backgroundColor: "#2a1808", border: "2px solid #c87820", color: "#c87820" }}
      >
        PLAY AGAIN
      </button>
    </div>
  );
}

function Leaderboard({ lb, newIdx }: { lb: LBEntry[]; newIdx: number | null }) {
  return (
    <div className="w-full rounded-xl overflow-hidden" style={{ border: "1px solid #3a2510" }}>
      <div
        className="px-4 py-2 text-center font-mono text-xs font-bold uppercase tracking-[0.2em]"
        style={{ backgroundColor: "#2a1808", color: "#c87820", borderBottom: "1px solid #3a2510" }}
      >
        ★ BEST POURS ★
      </div>
      {lb.length === 0 ? (
        <div className="px-4 py-5 text-center text-sm" style={{ color: "rgba(245,230,200,0.2)", backgroundColor: "#1e1005" }}>
          No scores yet.
        </div>
      ) : (
        lb.map((e, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2 font-mono"
            style={{
              backgroundColor: i === newIdx
                ? "rgba(200,120,32,0.12)"
                : i % 2 === 0 ? "#1e1005" : "#1a0d05",
              borderTop: "1px solid #2a1808",
            }}
          >
            <span className="w-5 text-right text-xs font-bold"
                  style={{ color: i < 3 ? "#c87820" : "rgba(245,230,200,0.2)" }}>
              {i + 1}
            </span>
            <span className="flex-1 tracking-[0.3em] text-sm font-bold"
                  style={{ color: i === newIdx ? "#e8a020" : "#f5e6c8" }}>
              {e.initials}
            </span>
            <span className="tabular-nums text-sm font-bold"
                  style={{ color: i === newIdx ? "#e8a020" : "rgba(245,230,200,0.55)" }}>
              {String(e.score).padStart(5, "0")}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

function BlinkCursor() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn(v => !v), 500);
    return () => clearInterval(t);
  }, []);
  return <span style={{ color: "#c87820", opacity: on ? 1 : 0 }}>█</span>;
}
