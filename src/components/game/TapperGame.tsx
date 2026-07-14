"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

// ── Constants ──────────────────────────────────────────────────────────────
const LANES       = 3;
const LANE_H      = 76;          // px per lane (display)
const TAP_PCT     = 11;          // tap button centre x (% of game width)
const CUST_START  = 96;          // customer spawn x (%)
const REACH_X     = 18;          // customer "reached bar" threshold (%)
const MUG_SPEED   = 1.15;        // % per frame
const COLL_DIST   = 6.5;         // % — collision radius
const BASE_SPEED  = 0.078;       // customer % per frame at level 1
const SPEED_INC   = 0.010;       // extra % per level
const BASE_SPAWN  = 170;         // frames between spawns at level 1
const SPAWN_DEC   = 11;          // fewer frames per level
const MIN_SPAWN   = 52;
const PTS_PER_LVL = 8;
const MAX_LIVES   = 3;
const LB_SIZE     = 10;
const LB_KEY      = "hyw-tapper-lb-v1";

let UID = 0;

// ── Types ──────────────────────────────────────────────────────────────────
interface Cust    { id: number; lane: number; x: number; speed: number }
interface Mug     { id: number; lane: number; x: number }
interface LBEntry { initials: string; score: number }
type Phase = "idle" | "play" | "dead" | "initials" | "board";

// ── LocalStorage ───────────────────────────────────────────────────────────
const readLB  = (): LBEntry[] => { try { return JSON.parse(localStorage.getItem(LB_KEY) ?? "[]"); } catch { return []; } };
const writeLB = (lb: LBEntry[]) => { try { localStorage.setItem(LB_KEY, JSON.stringify(lb)); } catch {} };
const insertLB = (lb: LBEntry[], e: LBEntry): LBEntry[] =>
  [...lb, e].sort((a, b) => b.score - a.score).slice(0, LB_SIZE);
const qualifies = (lb: LBEntry[], s: number) =>
  s > 0 && (lb.length < LB_SIZE || s > (lb.at(-1)?.score ?? 0));

// ── Derived ────────────────────────────────────────────────────────────────
const lvlOf    = (s: number) => Math.floor(s / PTS_PER_LVL) + 1;
const custSpd  = (lv: number) => BASE_SPEED + (lv - 1) * SPEED_INC;
const spawnGap = (lv: number) => Math.max(MIN_SPAWN, BASE_SPAWN - (lv - 1) * SPAWN_DEC);

// ── Main ───────────────────────────────────────────────────────────────────
export default function TapperGame() {
  // Game refs (frame-rate mutable, don't trigger renders)
  const custsR  = useRef<Cust[]>([]);
  const mugsR   = useRef<Mug[]>([]);
  const scoreR  = useRef(0);
  const livesR  = useRef(MAX_LIVES);
  const levelR  = useRef(1);
  const spawnR  = useRef(0);
  const rafR    = useRef<number | null>(null);
  const activeR = useRef(false);

  // Render state
  const [vCusts,   setVC]  = useState<Cust[]>([]);
  const [vMugs,    setVM]  = useState<Mug[]>([]);
  const [score,    setSc]  = useState(0);
  const [lives,    setLv]  = useState(MAX_LIVES);
  const [level,    setLl]  = useState(1);
  const [phase,    setPh]  = useState<Phase>("idle");
  const [initials, setIn]  = useState("");
  const [lb,       setLB]  = useState<LBEntry[]>([]);
  const [newIdx,   setNI]  = useState<number | null>(null);
  const [flashLane, setFL] = useState<number | null>(null);
  const [shake,    setSh]  = useState(false);

  useEffect(() => { setLB(readLB()); }, []);

  // Shoot a mug down the given lane
  const shoot = useCallback((lane: number) => {
    if (!activeR.current) return;
    // Only one mug per lane near the tap at a time
    if (mugsR.current.some(m => m.lane === lane && m.x < TAP_PCT + 15)) return;
    mugsR.current = [...mugsR.current, { id: UID++, lane, x: TAP_PCT + 9 }];
  }, []);

  // Main game loop
  const loop = useCallback(() => {
    if (!activeR.current) return;

    // Advance positions
    mugsR.current  = mugsR.current.map(m => ({ ...m, x: m.x + MUG_SPEED }));
    custsR.current = custsR.current.map(c => ({ ...c, x: c.x - c.speed }));

    // Collision detection
    const hitM = new Set<number>();
    const hitC = new Set<number>();
    const scored: number[] = [];

    for (const m of mugsR.current) {
      for (const c of custsR.current) {
        if (
          m.lane === c.lane &&
          !hitM.has(m.id) &&
          !hitC.has(c.id) &&
          Math.abs(m.x - c.x) < COLL_DIST
        ) {
          hitM.add(m.id);
          hitC.add(c.id);
          scored.push(m.lane);
          scoreR.current++;
          setSc(scoreR.current);
          const lv = lvlOf(scoreR.current);
          if (lv !== levelR.current) { levelR.current = lv; setLl(lv); }
        }
      }
    }

    if (scored.length) {
      setFL(scored[0]);
      setTimeout(() => setFL(null), 180);
    }

    // Remove collided + off-screen mugs; remove served customers
    mugsR.current  = mugsR.current.filter(m => !hitM.has(m.id) && m.x < 103);
    custsR.current = custsR.current.filter(c => !hitC.has(c.id));

    // Customers who reached the bar
    const breached = custsR.current.filter(c => c.x <= REACH_X);
    if (breached.length) {
      custsR.current = custsR.current.filter(c => c.x > REACH_X);
      livesR.current = Math.max(0, livesR.current - breached.length);
      setLv(livesR.current);
      setSh(true);
      setTimeout(() => setSh(false), 300);

      if (livesR.current <= 0) {
        activeR.current = false;
        if (rafR.current) cancelAnimationFrame(rafR.current);
        const fin = scoreR.current;
        const saved = readLB();
        if (qualifies(saved, fin)) {
          setPh("initials");
          setIn("");
        } else {
          setLB(saved);
          setPh("dead");
        }
        return;
      }
    }

    // Spawn customers
    spawnR.current++;
    if (spawnR.current >= spawnGap(levelR.current)) {
      spawnR.current = 0;
      const occ = custsR.current.filter(c => c.x > CUST_START - 13).map(c => c.lane);
      const free = ([0, 1, 2] as const).filter(l => !occ.includes(l));
      if (free.length) {
        const lane = free[Math.floor(Math.random() * free.length)];
        custsR.current = [
          ...custsR.current,
          { id: UID++, lane, x: CUST_START, speed: custSpd(levelR.current) },
        ];
      }
    }

    setVC([...custsR.current]);
    setVM([...mugsR.current]);
    rafR.current = requestAnimationFrame(loop);
  }, []);

  const start = useCallback(() => {
    custsR.current = [];
    mugsR.current  = [];
    scoreR.current = 0;
    livesR.current = MAX_LIVES;
    levelR.current = 1;
    spawnR.current = 0;
    activeR.current = true;
    setVC([]); setVM([]); setSc(0); setLv(MAX_LIVES); setLl(1);
    setPh("play");
    rafR.current = requestAnimationFrame(loop);
  }, [loop]);

  const submitInitials = useCallback(() => {
    const ini = initials
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, "")
      .slice(0, 3)
      .padEnd(3, "_");
    const entry: LBEntry = { initials: ini, score: scoreR.current };
    const saved  = readLB();
    const updated = insertLB(saved, entry);
    writeLB(updated);
    const idx = updated.findIndex(e => e.initials === entry.initials && e.score === entry.score);
    setLB(updated);
    setNI(idx >= 0 ? idx : null);
    setPh("board");
  }, [initials]);

  // Keyboard controls during play
  useEffect(() => {
    if (phase !== "play") return;
    const h = (e: KeyboardEvent) => {
      if (["1", "a", "A"].includes(e.key)) shoot(0);
      if (["2", "s", "S"].includes(e.key)) shoot(1);
      if (["3", "d", "D"].includes(e.key)) shoot(2);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [phase, shoot]);

  // Cleanup on unmount
  useEffect(() => () => {
    activeR.current = false;
    if (rafR.current) cancelAnimationFrame(rafR.current);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 select-none"
      style={{ backgroundColor: "var(--color-ink)", color: "white" }}
    >
      <div className="text-center mb-6">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: "var(--color-green)" }}
        >
          Hidden Tap
        </p>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold">Last Call Tapper</h1>
      </div>

      {phase === "idle"     && <IdleScreen    onStart={start} lb={lb} />}
      {phase === "play"     && (
        <PlayScreen
          custs={vCusts} mugs={vMugs}
          score={score} lives={lives} level={level}
          flashLane={flashLane} shake={shake}
          onShoot={shoot}
        />
      )}
      {phase === "dead"     && <DeadScreen    score={scoreR.current} onRestart={start} lb={lb} />}
      {phase === "initials" && (
        <InitScreen
          score={scoreR.current}
          initials={initials}
          onChange={setIn}
          onSubmit={submitInitials}
        />
      )}
      {phase === "board"    && <BoardScreen   lb={lb} newIdx={newIdx} onRestart={start} />}

      <Link
        href="/"
        className="mt-10 text-xs underline-offset-4 hover:underline"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        Back to the real world
      </Link>
    </div>
  );
}

// ── Screens ────────────────────────────────────────────────────────────────

function IdleScreen({ onStart, lb }: { onStart: () => void; lb: LBEntry[] }) {
  return (
    <div className="flex flex-col items-center max-w-sm w-full">
      <p className="text-white/55 text-sm mb-2 leading-relaxed text-center">
        Thirsty customers incoming. Tap a lane to slide a beer before they reach the bar.
      </p>
      <p className="text-xs mb-6 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
        Click lane buttons · or press{" "}
        {["1", "2", "3"].map(k => (
          <kbd
            key={k}
            className="inline-block mx-0.5 px-1 rounded font-mono"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
          >
            {k}
          </kbd>
        ))}
      </p>
      <button
        onClick={onStart}
        className="rounded-md px-10 py-3 text-base font-bold mb-8 transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--color-green)", color: "white" }}
      >
        Start Game
      </button>
      {lb.length > 0 && <Leaderboard lb={lb} newIdx={null} />}
    </div>
  );
}

function PlayScreen({
  custs, mugs, score, lives, level, flashLane, shake, onShoot,
}: {
  custs: Cust[]; mugs: Mug[]; score: number; lives: number; level: number;
  flashLane: number | null; shake: boolean; onShoot: (l: number) => void;
}) {
  return (
    <div className="w-full max-w-[500px]">
      {/* HUD */}
      <div className="flex justify-between items-center mb-3 font-heading px-1">
        <div>
          <div className="text-xs uppercase tracking-wider opacity-40">Score</div>
          <div className="text-3xl font-bold tabular-nums leading-tight">{score}</div>
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider opacity-40">Level</div>
          <div className="text-3xl font-bold leading-tight">{level}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider opacity-40 mb-0.5">Lives</div>
          <div className="flex gap-1.5 justify-end">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <span key={i} style={{ opacity: i < lives ? 1 : 0.15, fontSize: 19 }}>🍺</span>
            ))}
          </div>
        </div>
      </div>

      {/* Game field */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          height: LANES * LANE_H,
          border: "1px solid rgba(255,255,255,0.1)",
          backgroundColor: "rgba(255,255,255,0.04)",
          transform: shake ? "translateX(-3px)" : "none",
          transition: shake ? "none" : "transform 0.15s ease",
        }}
      >
        {/* Lanes */}
        {Array.from({ length: LANES }).map((_, lane) => (
          <div
            key={lane}
            className="absolute left-0 right-0"
            style={{
              top: lane * LANE_H,
              height: LANE_H,
              borderBottom: lane < LANES - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
              backgroundColor: flashLane === lane ? "rgba(106,191,75,0.09)" : "transparent",
              transition: "background-color 0.15s",
            }}
          >
            {/* Tap button */}
            <button
              onClick={() => onShoot(lane)}
              onTouchStart={(e) => { e.preventDefault(); onShoot(lane); }}
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-transform active:scale-90 focus-visible:outline-none"
              style={{
                left: 8,
                width: 44,
                height: 56,
                backgroundColor: "rgba(106,191,75,0.10)",
                border: "1.5px solid rgba(106,191,75,0.32)",
              }}
              aria-label={`Pour lane ${lane + 1}`}
            >
              <TapSVG />
              <span
                className="font-heading font-bold"
                style={{ color: "var(--color-green)", fontSize: 10, lineHeight: 1 }}
              >
                {lane + 1}
              </span>
            </button>

            {/* Counter / bar line */}
            <div
              className="absolute"
              style={{ left: 60, right: 0, top: "50%", height: 1, backgroundColor: "rgba(255,255,255,0.055)" }}
            />
          </div>
        ))}

        {/* Customers */}
        {custs.map(c => (
          <div
            key={c.id}
            className="absolute pointer-events-none"
            style={{
              left: `${c.x}%`,
              top: c.lane * LANE_H + LANE_H / 2,
              transform: "translate(-50%, -50%)",
            }}
          >
            <CustomerSVG />
          </div>
        ))}

        {/* Mugs */}
        {mugs.map(m => (
          <div
            key={m.id}
            className="absolute pointer-events-none"
            style={{
              left: `${m.x}%`,
              top: m.lane * LANE_H + LANE_H / 2,
              transform: "translate(-50%, -50%)",
            }}
          >
            <MugSVG />
          </div>
        ))}
      </div>

      <p className="text-center text-xs mt-2" style={{ color: "rgba(255,255,255,0.22)" }}>
        Tap buttons · or press 1 · 2 · 3
      </p>
    </div>
  );
}

function DeadScreen({ score, onRestart, lb }: { score: number; onRestart: () => void; lb: LBEntry[] }) {
  return (
    <div className="flex flex-col items-center max-w-sm w-full">
      <p className="font-heading text-2xl font-bold mb-1" style={{ color: "#e07b39" }}>
        Last call.
      </p>
      <p className="text-white/45 text-sm mb-3">They drank you dry.</p>
      <p className="font-heading text-6xl font-bold mb-6 tabular-nums">{score}</p>
      <button
        onClick={onRestart}
        className="rounded-md px-10 py-3 text-base font-bold mb-8 transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--color-green)", color: "white" }}
      >
        Try Again
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
    <div className="flex flex-col items-center text-center max-w-xs">
      <p className="font-heading text-xl font-bold mb-1" style={{ color: "var(--color-green)" }}>
        New High Score!
      </p>
      <p className="font-heading text-6xl font-bold mb-5 tabular-nums">{score}</p>
      <p className="text-white/55 text-sm mb-4">Enter your initials</p>

      {/* Arcade-style 3-char slots */}
      <div className="flex gap-2 mb-6">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="font-heading text-3xl font-bold flex items-center justify-center rounded-lg"
            style={{
              width: 52,
              height: 60,
              backgroundColor: "rgba(255,255,255,0.07)",
              border: `2px solid ${i === initials.length && initials.length < 3 ? "var(--color-green)" : "rgba(255,255,255,0.15)"}`,
              color: initials[i] ? "white" : "rgba(255,255,255,0.2)",
              letterSpacing: 0,
            }}
          >
            {initials[i] ?? (i === initials.length ? <BlinkCursor /> : "_")}
          </div>
        ))}
      </div>

      {/* Hidden real input */}
      <input
        type="text"
        maxLength={3}
        value={initials}
        onChange={e =>
          onChange(
            e.target.value
              .toUpperCase()
              .replace(/[^A-Z0-9 ]/g, "")
              .slice(0, 3)
          )
        }
        onKeyDown={e => { if (e.key === "Enter" && initials.trim().length > 0) onSubmit(); }}
        className="sr-only"
        autoFocus
        autoComplete="off"
        spellCheck={false}
      />
      <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
        Type your initials — letters, numbers, or space
      </p>

      <button
        onClick={onSubmit}
        disabled={initials.trim().length === 0}
        className="rounded-md px-10 py-3 text-base font-bold transition-opacity hover:opacity-90 disabled:opacity-30"
        style={{ backgroundColor: "var(--color-green)", color: "white" }}
      >
        Submit
      </button>
    </div>
  );
}

function BoardScreen({ lb, newIdx, onRestart }: { lb: LBEntry[]; newIdx: number | null; onRestart: () => void }) {
  return (
    <div className="flex flex-col items-center max-w-xs w-full">
      <Leaderboard lb={lb} newIdx={newIdx} />
      <button
        onClick={onRestart}
        className="mt-6 rounded-md px-10 py-3 text-base font-bold transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--color-green)", color: "white" }}
      >
        Play Again
      </button>
    </div>
  );
}

// ── Shared components ──────────────────────────────────────────────────────

function Leaderboard({ lb, newIdx }: { lb: LBEntry[]; newIdx: number | null }) {
  return (
    <div className="w-full rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
      <div
        className="px-4 py-2.5 font-heading font-bold text-xs uppercase tracking-[0.15em]"
        style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--color-green)" }}
      >
        High Scores
      </div>
      {lb.length === 0 && (
        <div className="px-4 py-5 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          No scores yet — be the first.
        </div>
      )}
      {lb.map((e, i) => {
        const isNew = i === newIdx;
        const isTop = i < 3;
        return (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2.5 font-heading"
            style={{
              backgroundColor: isNew ? "rgba(106,191,75,0.13)" : i % 2 === 0 ? "rgba(255,255,255,0.025)" : "transparent",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span
              className="text-xs w-5 text-right tabular-nums font-bold"
              style={{ color: isTop ? "var(--color-green)" : "rgba(255,255,255,0.28)" }}
            >
              {i + 1}
            </span>
            <span
              className="flex-1 font-bold tracking-[0.25em] text-sm"
              style={{ color: isNew ? "var(--color-green)" : "white" }}
            >
              {e.initials}
            </span>
            <span
              className="tabular-nums text-sm font-bold"
              style={{ color: isNew ? "var(--color-green)" : "rgba(255,255,255,0.65)" }}
            >
              {e.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BlinkCursor() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn(v => !v), 530);
    return () => clearInterval(t);
  }, []);
  return <span style={{ color: "var(--color-green)", opacity: on ? 1 : 0 }}>|</span>;
}

// ── SVG assets ─────────────────────────────────────────────────────────────

function TapSVG() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden="true">
      {/* Tap handle */}
      <rect x="6" y="0" width="4" height="9" rx="2" fill="rgba(106,191,75,0.75)" />
      {/* Collar */}
      <rect x="4" y="8" width="8" height="2.5" rx="1" fill="rgba(106,191,75,0.55)" />
      {/* Faucet body */}
      <rect x="2" y="10" width="12" height="10" rx="2"
            fill="rgba(106,191,75,0.22)" stroke="rgba(106,191,75,0.45)" strokeWidth="1" />
    </svg>
  );
}

function CustomerSVG() {
  return (
    <svg width="26" height="38" viewBox="0 0 26 38" fill="none" aria-hidden="true">
      {/* Head */}
      <circle cx="13" cy="8" r="7.5" fill="#D4A017" />
      {/* Eyes */}
      <circle cx="10.5" cy="7" r="1.1" fill="#1a1007" />
      <circle cx="15.5" cy="7" r="1.1" fill="#1a1007" />
      {/* Frown */}
      <path d="M10.5 11 Q13 9.2 15.5 11" stroke="#1a1007" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      {/* Body */}
      <rect x="6" y="16" width="14" height="14" rx="3" fill="#b8860b" />
      {/* Arms hint */}
      <rect x="2"  y="17" width="4" height="8" rx="2" fill="#a0740a" />
      <rect x="20" y="17" width="4" height="8" rx="2" fill="#a0740a" />
      {/* Legs */}
      <rect x="7"  y="29" width="4" height="8" rx="2" fill="#8a6009" />
      <rect x="15" y="29" width="4" height="8" rx="2" fill="#8a6009" />
    </svg>
  );
}

function MugSVG() {
  return (
    <svg width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden="true">
      {/* Body */}
      <rect x="1" y="4" width="13" height="17" rx="2" fill="#D4A017" opacity="0.92" />
      {/* Handle */}
      <path d="M14 7 Q20 7 20 12.5 Q20 18 14 18" stroke="#D4A017" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* Foam */}
      <ellipse cx="7.5" cy="4" rx="6.5" ry="2.8" fill="rgba(255,250,240,0.95)" />
      {/* Shine */}
      <rect x="3" y="8" width="2" height="9" rx="1" fill="rgba(255,255,255,0.22)" />
    </svg>
  );
}
