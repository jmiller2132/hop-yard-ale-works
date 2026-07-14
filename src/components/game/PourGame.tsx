"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";

// ─── Config ───────────────────────────────────────────────────────────────────
const LEVELS = [
  { min: 54, max: 78, spd: 0.20, name: "ROOKIE" },
  { min: 56, max: 76, spd: 0.27, name: "CASUAL" },
  { min: 58, max: 74, spd: 0.35, name: "REGULAR" },
  { min: 60, max: 72, spd: 0.43, name: "BARFLY" },
  { min: 62, max: 70, spd: 0.52, name: "CRAFTSMAN" },
  { min: 64, max: 68, spd: 0.62, name: "BARTENDER" },
  { min: 65, max: 67, spd: 0.74, name: "LEGEND" },
] as const;

const MAX_LIVES      = 3;
const ROUNDS_PER_LVL = 3;
const RESULT_MS      = 1800;
const LB_KEY         = "hyw-pour-v1";
const LB_SIZE        = 10;

// Glass SVG geometry
const GW = 150;
const GH = 300;
const GT = 8;                      // top y (rim)
const GB = GH - 8;                 // bottom y
const INNER_H = GB - GT;          // 284 usable px
const TL = 14, TR = GW - 14;      // top-left / top-right x
const BL = 38, BR = GW - 38;      // bottom-left / bottom-right x
const CLIP_D = `M ${TL} ${GT} L ${TR} ${GT} L ${BR} ${GB} L ${BL} ${GB} Z`;

type Grade = "PERFECT!" | "GREAT" | "GOOD" | "MISS";
type Phase = "idle" | "ready" | "pouring" | "result" | "dead" | "initials" | "board";
interface LBEntry { initials: string; score: number }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const readLB    = (): LBEntry[] => { try { return JSON.parse(localStorage.getItem(LB_KEY) ?? "[]"); } catch { return []; } };
const writeLB   = (lb: LBEntry[]) => { try { localStorage.setItem(LB_KEY, JSON.stringify(lb)); } catch {} };
const insertLB  = (lb: LBEntry[], e: LBEntry) => [...lb, e].sort((a, b) => b.score - a.score).slice(0, LB_SIZE);
const qualifies = (lb: LBEntry[], s: number) => s > 0 && (lb.length < LB_SIZE || s > (lb.at(-1)?.score ?? 0));

/** Convert fill% to SVG y-coordinate (0% = bottom, 100% = top) */
const pctY = (p: number) => GT + INNER_H * (1 - p / 100);

function scorePour(fill: number, min: number, max: number): { pts: number; grade: Grade } {
  const mid  = (min + max) / 2;
  const half = (max - min) / 2;
  const d    = Math.abs(fill - mid);
  if (d <= half * 0.20) return { pts: 100, grade: "PERFECT!" };
  if (d <= half * 0.55) return { pts: 75,  grade: "GREAT" };
  if (d <= half)        return { pts: 40,  grade: "GOOD" };
  return { pts: 0, grade: "MISS" };
}

const GRADE_COLOR: Record<Grade, string> = {
  "PERFECT!": "#69f0ae",
  "GREAT":    "#ffca28",
  "GOOD":     "#ff9800",
  "MISS":     "#ef5350",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function PourGame() {
  // Mutable game state — all in refs to prevent stale closures
  const fillR    = useRef(0);
  const livesR   = useRef(MAX_LIVES);
  const scoreR   = useRef(0);
  const levelR   = useRef(0);
  const roundR   = useRef(0);
  const pouringR = useRef(false);
  const rafR     = useRef<number | null>(null);

  // Render state
  const [fill,     setFill]  = useState(0);
  const [foam,     setFoam]  = useState(0);    // foam height in px (0→18)
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

  const lv = LEVELS[Math.min(levelR.current, LEVELS.length - 1)];

  // ── Stop pour & evaluate ───────────────────────────────────────────────────
  const stopPour = useCallback(() => {
    if (!pouringR.current) return;
    pouringR.current = false;
    if (rafR.current) { cancelAnimationFrame(rafR.current); rafR.current = null; }

    const fill = fillR.current;
    const lv   = LEVELS[Math.min(levelR.current, LEVELS.length - 1)];
    const { pts, grade } = scorePour(fill, lv.min, lv.max);

    // Foam settle animation
    setFoam(6);
    setTimeout(() => setFoam(18), 200);

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
      setFill(0);
      setFoam(0);
      setCG(null);
      setPh("ready");
    }, RESULT_MS);
  }, []); // safe: reads only from refs

  // ── Pour loop (RAF) ────────────────────────────────────────────────────────
  const loopRef = useRef<() => void>(() => {});
  useEffect(() => {
    loopRef.current = () => {
      if (!pouringR.current) return;
      const lv = LEVELS[Math.min(levelR.current, LEVELS.length - 1)];
      fillR.current = Math.min(100, fillR.current + lv.spd);
      setFill(fillR.current);
      if (fillR.current >= 100) {
        stopPour();
      } else {
        rafR.current = requestAnimationFrame(loopRef.current);
      }
    };
  }, [stopPour]);

  // ── Start pour ─────────────────────────────────────────────────────────────
  const startPour = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (pouringR.current) return;
    if (phase !== "ready" && phase !== "idle") return;

    if (phase === "idle") {
      // Initialize game
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

  const handleRelease = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    stopPour();
  }, [stopPour]);

  // ── Submit initials ────────────────────────────────────────────────────────
  const submit = useCallback(() => {
    const ini = initials.toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 3).padEnd(3, "_");
    const entry: LBEntry = { initials: ini, score: scoreR.current };
    const saved   = readLB();
    const updated = insertLB(saved, entry);
    writeLB(updated);
    const idx = updated.findIndex(e => e.initials === ini && e.score === entry.score);
    setLB(updated); setNI(idx >= 0 ? idx : null); setPh("board");
  }, [initials]);

  const restart = useCallback(() => {
    fillR.current = 0;
    setFill(0); setFoam(0); setCG(null);
    setPh("idle");
  }, []);

  useEffect(() => () => {
    pouringR.current = false;
    if (rafR.current) cancelAnimationFrame(rafR.current);
  }, []);

  const showGlass = phase === "idle" || phase === "ready" || phase === "pouring" || phase === "result";
  const showPourArea = phase === "idle" || phase === "ready" || phase === "pouring";

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
      {phase !== "idle" && phase !== "board" && phase !== "dead" && phase !== "initials" && (
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
            <div className="text-sm font-bold leading-tight" style={{ color: "#f5e6c8" }}>
              {LEVELS[Math.min(lvIdx, LEVELS.length - 1)].name}
            </div>
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

      {/* Grade flash */}
      {curGrade && (
        <div
          className="font-bold text-2xl tracking-widest text-center mb-1"
          style={{
            color: GRADE_COLOR[curGrade],
            textShadow: `0 0 24px ${GRADE_COLOR[curGrade]}60`,
            minHeight: 36,
          }}
        >
          {curGrade}
          {curPts > 0 && (
            <span className="text-sm ml-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              +{curPts}
            </span>
          )}
        </div>
      )}
      {!curGrade && showGlass && <div style={{ minHeight: 36 }} />}

      {/* Glass */}
      {showGlass && (
        <PintGlass
          fill={fill}
          foam={foam}
          zoneMin={lv.min}
          zoneMax={lv.max}
          pouring={phase === "pouring"}
        />
      )}

      {/* Pour control area */}
      {showPourArea && (
        <div
          className="w-full max-w-xs mt-5 mx-4 rounded-2xl flex flex-col items-center justify-center cursor-pointer"
          style={{
            height: 90,
            backgroundColor: phase === "pouring" ? "#3a2010" : "#2a1808",
            border: `2px solid ${phase === "pouring" ? "#e8a020" : "#4a2e10"}`,
            boxShadow: phase === "pouring" ? "0 0 24px rgba(232,160,32,0.2)" : "none",
            transition: "border-color 0.15s, background-color 0.15s, box-shadow 0.15s",
            touchAction: "none",
          }}
          onMouseDown={startPour}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          onTouchStart={startPour}
          onTouchEnd={handleRelease}
          onTouchCancel={handleRelease}
        >
          {phase === "pouring" ? (
            <p className="font-bold text-xl" style={{ color: "#e8a020" }}>
              RELEASE TO STOP
            </p>
          ) : (
            <>
              <p className="font-bold text-lg" style={{ color: "#c87820" }}>
                {phase === "idle" ? "HOLD TO START" : "HOLD TO POUR"}
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(245,230,200,0.25)" }}>
                Release at the right level
              </p>
            </>
          )}
        </div>
      )}

      {/* Result waiting */}
      {phase === "result" && !curGrade && (
        <div className="mt-5 text-sm" style={{ color: "rgba(245,230,200,0.3)" }}>
          Next pour…
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
          onSubmit={submit}
        />
      )}
      {phase === "board" && (
        <BoardScreen lb={lb} newIdx={newIdx} onRestart={restart} />
      )}

      {/* Idle leaderboard */}
      {phase === "idle" && lb.length > 0 && (
        <div className="w-full max-w-xs px-4 mt-6">
          <Leaderboard lb={lb} newIdx={null} />
        </div>
      )}

      <Link
        href="/"
        className="mt-6 mb-8 text-xs underline-offset-4 hover:underline"
        style={{ color: "rgba(255,255,255,0.12)" }}
      >
        Back to the real world
      </Link>
    </div>
  );
}

// ─── Pint Glass ───────────────────────────────────────────────────────────────
function PintGlass({
  fill, foam, zoneMin, zoneMax, pouring,
}: {
  fill: number; foam: number; zoneMin: number; zoneMax: number; pouring: boolean;
}) {
  const fillY     = pctY(fill);          // top of liquid
  const foamY     = fillY - foam;        // top of foam (above liquid)
  const zoneTopY  = pctY(zoneMax);       // top of green zone
  const zoneBotY  = pctY(zoneMin);       // bottom of green zone

  // Subtle wave ripple on beer surface when pouring
  const rippleAmp = pouring ? 2 : 0;

  return (
    <div className="relative flex flex-col items-center" style={{ touchAction: "none" }}>
      {/* Pour stream from above */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: -28,
          width: 8,
          height: 32,
          opacity: pouring ? 1 : 0,
          transition: "opacity 0.1s",
          background: "linear-gradient(to bottom, transparent, #e8a020, #c87820)",
          borderRadius: 4,
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
          <clipPath id="pglass">
            <path d={CLIP_D} />
          </clipPath>
          <linearGradient id="beer-g" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#a06010" />
            <stop offset="30%"  stopColor="#c87820" />
            <stop offset="55%"  stopColor="#e8a020" />
            <stop offset="75%"  stopColor="#d09030" />
            <stop offset="100%" stopColor="#9a5e10" />
          </linearGradient>
          <linearGradient id="glass-shine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
            <stop offset="18%"  stopColor="rgba(255,255,255,0.07)" />
            <stop offset="82%"  stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.18)" />
          </linearGradient>
        </defs>

        {/* Perfect zone band */}
        <rect
          x={0} y={zoneTopY}
          width={GW} height={Math.max(0, zoneBotY - zoneTopY)}
          fill="rgba(74,170,100,0.22)"
          clipPath="url(#pglass)"
        />

        {/* Beer fill */}
        {fill > 0 && (
          <rect
            x={0} y={fillY}
            width={GW} height={Math.max(0, GB - fillY)}
            fill="url(#beer-g)"
            clipPath="url(#pglass)"
          />
        )}

        {/* Beer surface ripple */}
        {fill > 0 && fill < 100 && (
          <path
            d={`M 0 ${fillY + rippleAmp}
                Q ${GW * 0.25} ${fillY - rippleAmp}
                  ${GW * 0.5}  ${fillY + rippleAmp}
                Q ${GW * 0.75} ${fillY - rippleAmp}
                  ${GW}        ${fillY + rippleAmp}
                L ${GW} ${fillY} L 0 ${fillY} Z`}
            fill="#d09030"
            opacity={pouring ? 0.6 : 0}
            clipPath="url(#pglass)"
          />
        )}

        {/* Foam */}
        {foam > 0 && fill > 0 && (
          <>
            <rect
              x={0} y={Math.max(GT, foamY)}
              width={GW} height={Math.min(foam, fillY - GT)}
              fill="rgba(255,252,240,0.93)"
              clipPath="url(#pglass)"
            />
            {/* Foam bubbles */}
            {([0.18, 0.35, 0.55, 0.72, 0.88] as const).map((t, i) => (
              <ellipse
                key={i}
                cx={GW * t}
                cy={Math.max(GT + 5, foamY + 4 + (i % 2) * 3)}
                rx={2.5 + (i % 3)}
                ry={2}
                fill="rgba(255,255,255,0.55)"
                clipPath="url(#pglass)"
              />
            ))}
          </>
        )}

        {/* Glass shine overlay */}
        <rect x={0} y={0} width={GW} height={GH} fill="url(#glass-shine)" clipPath="url(#pglass)" />

        {/* Glass wall outline */}
        <path d={CLIP_D} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />

        {/* Rim highlight */}
        <line
          x1={TL} y1={GT} x2={TR} y2={GT}
          stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" strokeLinecap="round"
        />

        {/* Zone tick marks (left of glass) */}
        <line x1={2} y1={zoneTopY} x2={TL - 3} y2={zoneTopY} stroke="#4aaa64" strokeWidth="1.5" />
        <line x1={2} y1={zoneBotY} x2={TL - 3} y2={zoneBotY} stroke="#4aaa64" strokeWidth="1.5" />
        <text x={3} y={zoneTopY - 3} fontSize={7} fill="#4aaa64" fontFamily="monospace">MAX</text>
        <text x={3} y={zoneBotY + 9} fontSize={7} fill="#4aaa64" fontFamily="monospace">MIN</text>

        {/* Zone bracket on right */}
        <line x1={TR + 3} y1={zoneTopY} x2={GW - 2} y2={zoneTopY} stroke="#4aaa64" strokeWidth="1.5" />
        <line x1={TR + 3} y1={zoneBotY} x2={GW - 2} y2={zoneBotY} stroke="#4aaa64" strokeWidth="1.5" />
        <line x1={GW - 3} y1={zoneTopY} x2={GW - 3} y2={zoneBotY} stroke="#4aaa64" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    </div>
  );
}

// ─── Screens ──────────────────────────────────────────────────────────────────
function DeadScreen({
  score, lb, onRestart,
}: {
  score: number; lb: LBEntry[]; onRestart: () => void;
}) {
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
        className="rounded-xl px-10 py-3 font-bold mb-7 transition-opacity hover:opacity-85"
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
              boxShadow: i === initials.length && initials.length < 3 ? "0 0 10px rgba(200,120,32,0.4)" : "none",
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
        onChange={e =>
          onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 3))
        }
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

function BoardScreen({
  lb, newIdx, onRestart,
}: {
  lb: LBEntry[]; newIdx: number | null; onRestart: () => void;
}) {
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
        lb.map((e, i) => {
          const isNew = i === newIdx;
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2 font-mono"
              style={{
                backgroundColor: isNew
                  ? "rgba(200,120,32,0.12)"
                  : i % 2 === 0 ? "#1e1005" : "#1a0d05",
                borderTop: "1px solid #2a1808",
              }}
            >
              <span
                className="w-5 text-right text-xs font-bold"
                style={{ color: i < 3 ? "#c87820" : "rgba(245,230,200,0.2)" }}
              >
                {i + 1}
              </span>
              <span
                className="flex-1 tracking-[0.3em] text-sm font-bold"
                style={{ color: isNew ? "#e8a020" : "#f5e6c8" }}
              >
                {e.initials}
              </span>
              <span
                className="tabular-nums text-sm font-bold"
                style={{ color: isNew ? "#e8a020" : "rgba(245,230,200,0.55)" }}
              >
                {String(e.score).padStart(5, "0")}
              </span>
            </div>
          );
        })
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
