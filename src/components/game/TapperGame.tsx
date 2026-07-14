"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────
const LANES        = 4;
const LANE_H       = 78;       // px per lane (display height)
const KEG_X        = 90;       // bartender home / keg x (%, right side)
const DOOR_X       = 6;        // door x (%, left side)
const BART_SPD     = 0.9;      // bartender run speed (% per frame)
const DRIFT_SPD    = 0.45;     // bartender drift back to keg when not pressing left
const CUST_SPAWN   = 8;        // customers appear here (%)
const DANGER_X     = 84;       // customer x that triggers life loss
const DOOR_EXIT_X  = 11;       // pushed back past this → customer exits (% - scored)
const MUG_SPD      = 2.0;      // full mug slide speed (% per frame, leftward)
const EMPTY_SPD    = 1.3;      // empty mug return speed (% per frame, rightward)
const CATCH_MIN    = 72;       // bartender x must be ≥ this to catch a returning mug
const PUSH_BASE    = 32;       // customer pushed back this far (%) on mug hit at level 1
const PUSH_MIN     = 14;       // minimum push at high level
const DRINK_FRAMES = 105;      // frames a customer spends drinking
const BASE_SPAWN   = 165;      // frames between customer spawns at level 1
const SPAWN_DEC    = 10;       // fewer frames per level
const MIN_SPAWN    = 42;
const BASE_CSP     = 0.055;    // base customer walk speed (% per frame)
const CSP_INC      = 0.007;    // extra speed per level
const PTS_PER_LVL  = 10;       // points to advance a level
const MAX_LIVES    = 3;
const TIP_PROB     = 0.0022;   // probability tip spawns each frame
const TIP_SCORE    = 25;
const LB_SIZE      = 10;
const LB_KEY       = "hyw-tapper-v3";
const EMPTY_RETURN_CHANCE = 0.62; // chance customer sends empty mug back after drinking

let UID = 0;

// ─── Types ────────────────────────────────────────────────────────────────────
type CustState = "walk" | "drink" | "leave";
interface Cust    { id: number; lane: number; x: number; state: CustState; timer: number }
interface FullMug { id: number; lane: number; x: number }
interface EmptyMug{ id: number; lane: number; x: number }
interface Tip     { id: number; lane: number; x: number }
interface Bart    { lane: number; x: number }
interface LBEntry { initials: string; score: number }
type Phase = "idle" | "play" | "dead" | "initials" | "board";

// ─── LocalStorage ─────────────────────────────────────────────────────────────
const readLB   = (): LBEntry[] => { try { return JSON.parse(localStorage.getItem(LB_KEY) ?? "[]"); } catch { return []; } };
const writeLB  = (lb: LBEntry[]) => { try { localStorage.setItem(LB_KEY, JSON.stringify(lb)); } catch {} };
const insertLB = (lb: LBEntry[], e: LBEntry) => [...lb, e].sort((a, b) => b.score - a.score).slice(0, LB_SIZE);
const qualifies = (lb: LBEntry[], s: number) => s > 0 && (lb.length < LB_SIZE || s > (lb.at(-1)?.score ?? 0));

// ─── Math helpers ─────────────────────────────────────────────────────────────
const lvlOf    = (s: number) => Math.floor(s / PTS_PER_LVL) + 1;
const custSpd  = (lv: number) => BASE_CSP + (lv - 1) * CSP_INC;
const spawnGap = (lv: number) => Math.max(MIN_SPAWN, BASE_SPAWN - (lv - 1) * SPAWN_DEC);
const pushAmt  = (lv: number) => Math.max(PUSH_MIN, PUSH_BASE - (lv - 1) * 1.8);
const clamp    = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ─── Main component ───────────────────────────────────────────────────────────
export default function TapperGame() {
  // Mutable game refs (do not trigger renders)
  const custsR    = useRef<Cust[]>([]);
  const fullR     = useRef<FullMug[]>([]);
  const emptyR    = useRef<EmptyMug[]>([]);
  const tipsR     = useRef<Tip[]>([]);
  const bartR     = useRef<Bart>({ lane: 0, x: KEG_X });
  const scoreR    = useRef(0);
  const livesR    = useRef(MAX_LIVES);
  const levelR    = useRef(1);
  const spawnCtr  = useRef(0);
  const rafR      = useRef<number | null>(null);
  const activeR   = useRef(false);
  const keysR     = useRef<Set<string>>(new Set());

  // Render state
  const [vC, setVC]   = useState<Cust[]>([]);
  const [vF, setVF]   = useState<FullMug[]>([]);
  const [vE, setVE]   = useState<EmptyMug[]>([]);
  const [vT, setVT]   = useState<Tip[]>([]);
  const [vB, setVB]   = useState<Bart>({ lane: 0, x: KEG_X });
  const [score,   setSc] = useState(0);
  const [lives,   setLv] = useState(MAX_LIVES);
  const [level,   setLl] = useState(1);
  const [phase,   setPh] = useState<Phase>("idle");
  const [initials,setIn] = useState("");
  const [lb,      setLB] = useState<LBEntry[]>([]);
  const [newIdx,  setNI] = useState<number | null>(null);
  const [bonus,   setBo] = useState<string | null>(null);
  const [shake,   setSk] = useState(false);

  useEffect(() => { setLB(readLB()); }, []);

  // ── Game over ───────────────────────────────────────────────────────────────
  const gameOver = useCallback(() => {
    activeR.current = false;
    if (rafR.current) cancelAnimationFrame(rafR.current);
    const fin = scoreR.current;
    const saved = readLB();
    if (qualifies(saved, fin)) { setPh("initials"); setIn(""); }
    else { setLB(saved); setPh("dead"); }
  }, []);

  // ── Lose a life ─────────────────────────────────────────────────────────────
  const loseLife = useCallback(() => {
    livesR.current = Math.max(0, livesR.current - 1);
    setLv(livesR.current);
    setSk(true);
    setTimeout(() => setSk(false), 350);
    if (livesR.current <= 0) gameOver();
  }, [gameOver]);

  // ── Shoot mug ───────────────────────────────────────────────────────────────
  const shoot = useCallback(() => {
    if (!activeR.current) return;
    const lane = bartR.current.lane;
    // Prevent mug spam on same lane
    if (fullR.current.some(m => m.lane === lane && m.x > KEG_X - 14)) return;
    bartR.current = { ...bartR.current, x: KEG_X }; // snap to keg
    fullR.current = [...fullR.current, { id: UID++, lane, x: KEG_X - 6 }];
  }, []);

  // ── Switch lane ─────────────────────────────────────────────────────────────
  const switchLane = useCallback((dir: 1 | -1) => {
    if (!activeR.current) return;
    bartR.current = { lane: (bartR.current.lane + dir + LANES) % LANES, x: KEG_X };
  }, []);

  // ── Main game loop ───────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    if (!activeR.current) return;
    const keys = keysR.current;
    const lv   = levelR.current;

    // Bartender movement
    if (keys.has("ArrowLeft") || keys.has("a")) {
      bartR.current.x = clamp(bartR.current.x - BART_SPD, DOOR_X + 4, KEG_X);
    } else {
      // Drift back to keg when not running left
      bartR.current.x = clamp(bartR.current.x + DRIFT_SPD, DOOR_X + 4, KEG_X);
    }

    // Advance full mugs left
    fullR.current = fullR.current.map(m => ({ ...m, x: m.x - MUG_SPD }));

    // Advance empty mugs right
    emptyR.current = emptyR.current.map(m => ({ ...m, x: m.x + EMPTY_SPD }));

    // Advance customers
    custsR.current = custsR.current.map(c => {
      if (c.state === "walk")  return { ...c, x: c.x + custSpd(lv) };
      if (c.state === "leave") return { ...c, x: c.x - custSpd(lv) * 2.2 };
      if (c.state === "drink") {
        const t = c.timer - 1;
        if (t <= 0) {
          if (Math.random() < EMPTY_RETURN_CHANCE) {
            emptyR.current = [...emptyR.current, { id: UID++, lane: c.lane, x: c.x }];
          }
          return { ...c, state: "walk" as CustState, timer: 0 };
        }
        return { ...c, timer: t };
      }
      return c;
    });

    // ── Full mug ↔ customer collision ────────────────────────────────────────
    const hitMug  = new Set<number>();
    const hitCust = new Set<number>();
    const hitInfo = new Map<number, number>(); // custId → newX after push

    for (const m of fullR.current) {
      for (const c of custsR.current) {
        if (
          (c.state === "walk" || c.state === "drink") &&
          m.lane === c.lane &&
          !hitMug.has(m.id) &&
          !hitCust.has(c.id) &&
          Math.abs(m.x - c.x) < 7.5
        ) {
          hitMug.add(m.id);
          hitCust.add(c.id);
          hitInfo.set(c.id, c.x - pushAmt(lv));
        }
      }
    }

    // Remove hit mugs
    fullR.current = fullR.current.filter(m => !hitMug.has(m.id));

    // Update hit customers
    let gained = 0;
    custsR.current = custsR.current.map(c => {
      if (!hitInfo.has(c.id)) return c;
      const newX = hitInfo.get(c.id)!;
      if (newX <= DOOR_EXIT_X) {
        gained++;
        return { ...c, state: "leave" as CustState, x: DOOR_EXIT_X };
      }
      return { ...c, x: newX, state: "drink" as CustState, timer: DRINK_FRAMES };
    });

    // Remove customers who finished leaving
    custsR.current = custsR.current.filter(c => !(c.state === "leave" && c.x <= DOOR_X - 2));

    if (gained) {
      scoreR.current += gained;
      setSc(scoreR.current);
      const newLv = lvlOf(scoreR.current);
      if (newLv !== levelR.current) { levelR.current = newLv; setLl(newLv); }
    }

    // ── Full mugs off left edge (not caught) → lose life ─────────────────────
    const missed = fullR.current.filter(m => m.x < 0);
    if (missed.length) {
      fullR.current = fullR.current.filter(m => m.x >= 0);
      missed.forEach(() => { loseLife(); });
      if (!activeR.current) return;
    }

    // ── Empty mugs returning to keg end ─────────────────────────────────────
    const bart = bartR.current;
    const arrivedEmpty = emptyR.current.filter(m => m.x >= KEG_X);
    if (arrivedEmpty.length) {
      emptyR.current = emptyR.current.filter(m => m.x < KEG_X);
      for (const m of arrivedEmpty) {
        if (m.lane === bart.lane && bart.x >= CATCH_MIN) {
          // Caught — nothing lost
        } else {
          loseLife();
          if (!activeR.current) return;
        }
      }
    }

    // ── Customers reaching bartender end → lose life ──────────────────────────
    const reached = custsR.current.filter(c => c.state === "walk" && c.x >= DANGER_X);
    if (reached.length) {
      custsR.current = custsR.current.filter(c => !(c.state === "walk" && c.x >= DANGER_X));
      reached.forEach(() => { loseLife(); });
      if (!activeR.current) return;
    }

    // ── Tips ─────────────────────────────────────────────────────────────────
    const collectedTips = tipsR.current.filter(
      t => t.lane === bart.lane && Math.abs(t.x - bart.x) < 9
    );
    if (collectedTips.length) {
      tipsR.current = tipsR.current.filter(t => !collectedTips.includes(t));
      const pts = collectedTips.length * TIP_SCORE;
      scoreR.current += pts;
      setSc(scoreR.current);
      setBo(`+${pts}`);
      setTimeout(() => setBo(null), 900);
    }

    // Spawn new tip
    if (Math.random() < TIP_PROB && tipsR.current.length < 3) {
      tipsR.current = [
        ...tipsR.current,
        { id: UID++, lane: Math.floor(Math.random() * LANES), x: 20 + Math.random() * 55 },
      ];
    }

    // ── Spawn customers ───────────────────────────────────────────────────────
    spawnCtr.current++;
    if (spawnCtr.current >= spawnGap(lv)) {
      spawnCtr.current = 0;
      const occupied = custsR.current.filter(c => c.x < CUST_SPAWN + 14).map(c => c.lane);
      const free = ([0, 1, 2, 3] as const).filter(l => !occupied.includes(l));
      if (free.length) {
        const lane = free[Math.floor(Math.random() * free.length)];
        custsR.current = [
          ...custsR.current,
          { id: UID++, lane, x: CUST_SPAWN, state: "walk", timer: 0 },
        ];
      }
    }

    // Push visual state
    setVC([...custsR.current]);
    setVF([...fullR.current]);
    setVE([...emptyR.current]);
    setVT([...tipsR.current]);
    setVB({ ...bartR.current });

    rafR.current = requestAnimationFrame(loop);
  }, [loseLife]);

  // ── Start ────────────────────────────────────────────────────────────────────
  const start = useCallback(() => {
    custsR.current = []; fullR.current = []; emptyR.current = []; tipsR.current = [];
    bartR.current  = { lane: 0, x: KEG_X };
    scoreR.current = 0; livesR.current = MAX_LIVES; levelR.current = 1; spawnCtr.current = 0;
    activeR.current = true; keysR.current.clear();
    setVC([]); setVF([]); setVE([]); setVT([]);
    setVB({ lane: 0, x: KEG_X }); setSc(0); setLv(MAX_LIVES); setLl(1);
    setPh("play");
    rafR.current = requestAnimationFrame(loop);
  }, [loop]);

  // ── Submit initials ───────────────────────────────────────────────────────────
  const submit = useCallback(() => {
    const ini = initials.toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 3).padEnd(3, "_");
    const entry: LBEntry = { initials: ini, score: scoreR.current };
    const saved   = readLB();
    const updated = insertLB(saved, entry);
    writeLB(updated);
    const idx = updated.findIndex(e => e.initials === entry.initials && e.score === entry.score);
    setLB(updated); setNI(idx >= 0 ? idx : null); setPh("board");
  }, [initials]);

  // ── Keyboard ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "play") return;
    const dn = (e: KeyboardEvent) => {
      keysR.current.add(e.key);
      if (e.key === "ArrowUp"   || e.key === "w") { e.preventDefault(); switchLane(-1); }
      if (e.key === "ArrowDown" || e.key === "s") { e.preventDefault(); switchLane(1);  }
      if (e.key === " " || e.key === "f")          { e.preventDefault(); shoot();        }
    };
    const up = (e: KeyboardEvent) => keysR.current.delete(e.key);
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup",   up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, [phase, shoot, switchLane]);

  useEffect(() => () => {
    activeR.current = false;
    if (rafR.current) cancelAnimationFrame(rafR.current);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-2 py-8 select-none"
      style={{ backgroundColor: "#0d0d1a", color: "white" }}
    >
      {/* Title */}
      <div className="text-center mb-5">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#69f0ae" }}>
          Hidden Tap
        </p>
        <h1
          className="font-heading text-4xl sm:text-5xl font-bold"
          style={{ color: "#fff", textShadow: "0 0 20px rgba(105,240,174,0.4)" }}
        >
          Last Call Tapper
        </h1>
      </div>

      {phase === "idle"     && <IdleScreen    onStart={start} lb={lb} />}
      {phase === "play"     && (
        <PlayScreen
          custs={vC} full={vF} empty={vE} tips={vT} bart={vB}
          score={score} lives={lives} level={level}
          shake={shake} bonus={bonus}
          onShoot={shoot} onLane={switchLane}
          onLeft={() => keysR.current.add("ArrowLeft")}
          onLeftUp={() => keysR.current.delete("ArrowLeft")}
        />
      )}
      {phase === "dead"     && <DeadScreen    score={scoreR.current} onRestart={start} lb={lb} />}
      {phase === "initials" && <InitScreen    score={scoreR.current} initials={initials} onChange={setIn} onSubmit={submit} />}
      {phase === "board"    && <BoardScreen   lb={lb} newIdx={newIdx} onRestart={start} />}

      <Link
        href="/"
        className="mt-8 text-xs underline-offset-4 hover:underline"
        style={{ color: "rgba(255,255,255,0.2)" }}
      >
        Back to the real world
      </Link>
    </div>
  );
}

// ─── Play screen ──────────────────────────────────────────────────────────────
function PlayScreen({
  custs, full, empty, tips, bart,
  score, lives, level, shake, bonus,
  onShoot, onLane, onLeft, onLeftUp,
}: {
  custs: Cust[]; full: FullMug[]; empty: EmptyMug[]; tips: Tip[]; bart: Bart;
  score: number; lives: number; level: number; shake: boolean; bonus: string | null;
  onShoot: () => void; onLane: (d: 1 | -1) => void;
  onLeft: () => void; onLeftUp: () => void;
}) {
  return (
    <div className="w-full max-w-[540px] flex flex-col">
      {/* HUD */}
      <div
        className="flex justify-between items-center px-3 py-2 mb-1 rounded-t-xl font-mono"
        style={{ backgroundColor: "#1a1a2e", border: "1px solid #2a2a4e" }}
      >
        <div>
          <div className="text-xs opacity-50 uppercase tracking-wider">Score</div>
          <div className="text-2xl font-bold tabular-nums leading-none" style={{ color: "#69f0ae" }}>
            {String(score).padStart(6, "0")}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs opacity-50 uppercase tracking-wider">Level</div>
          <div className="text-2xl font-bold leading-none" style={{ color: "#ffca28" }}>{level}</div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-50 uppercase tracking-wider mb-0.5">Lives</div>
          <div className="flex gap-1.5 justify-end">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <span key={i} style={{ fontSize: 18, opacity: i < lives ? 1 : 0.15 }}>🍺</span>
            ))}
          </div>
        </div>
      </div>

      {/* Bonus flash */}
      <div className="relative h-0">
        {bonus && (
          <div
            className="absolute left-1/2 -translate-x-1/2 font-bold text-lg z-10 pointer-events-none animate-bounce"
            style={{ color: "#ffca28", top: 4, textShadow: "0 0 8px rgba(255,202,40,0.8)" }}
          >
            {bonus}
          </div>
        )}
      </div>

      {/* Game field */}
      <div
        className="relative rounded-b-xl overflow-hidden"
        style={{
          border: "1px solid #2a2a4e",
          borderTop: "none",
          transform: shake ? "translateX(-4px)" : "none",
          transition: shake ? "none" : "transform 0.2s ease",
        }}
      >
        {/* Lane backgrounds */}
        {Array.from({ length: LANES }).map((_, lane) => (
          <div
            key={lane}
            style={{
              position: "absolute",
              top: lane * LANE_H,
              left: 0,
              right: 0,
              height: LANE_H,
              borderBottom: lane < LANES - 1 ? "2px solid #0d0d1a" : "none",
            }}
          >
            {/* Bar counter top strip */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 14,
                backgroundColor: lane % 2 === 0 ? "#7b1fa2" : "#6a1b9a",
                borderBottom: "2px solid #4a148c",
              }}
            />
            {/* Bar floor */}
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: lane % 2 === 0 ? "#00695c" : "#00796b",
              }}
            />
            {/* Lane highlight on bartender's lane */}
            {bart.lane === lane && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(105,240,174,0.06)",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
        ))}

        {/* Lane content: render at LANES * LANE_H total height */}
        <div style={{ height: LANES * LANE_H, position: "relative" }}>
          {/* Door indicators (left) */}
          {Array.from({ length: LANES }).map((_, lane) => (
            <DoorSVG key={`door-${lane}`} lane={lane} />
          ))}

          {/* Keg indicators (right) */}
          {Array.from({ length: LANES }).map((_, lane) => (
            <KegSVG key={`keg-${lane}`} lane={lane} active={bart.lane === lane} />
          ))}

          {/* Tips */}
          {tips.map(t => (
            <Coin key={t.id} lane={t.lane} x={t.x} />
          ))}

          {/* Customers */}
          {custs.map(c => (
            <CustomerSprite key={c.id} lane={c.lane} x={c.x} state={c.state} />
          ))}

          {/* Full mugs (sliding left) */}
          {full.map(m => (
            <MugFull key={m.id} lane={m.lane} x={m.x} />
          ))}

          {/* Empty mugs (sliding right) */}
          {empty.map(m => (
            <MugEmpty key={m.id} lane={m.lane} x={m.x} />
          ))}

          {/* Bartender */}
          <BartenderSprite lane={bart.lane} x={bart.x} />
        </div>
      </div>

      {/* Mobile controls */}
      <div className="flex items-center justify-between mt-3 gap-2">
        {/* Lane up/down */}
        <div className="flex gap-2">
          <button
            onTouchStart={e => { e.preventDefault(); onLane(-1); }}
            onClick={() => onLane(-1)}
            className="rounded-lg font-bold text-lg flex items-center justify-center focus-visible:outline-none"
            style={{ width: 52, height: 52, backgroundColor: "#1a1a2e", border: "2px solid #2a2a4e", color: "#69f0ae" }}
            aria-label="Lane up"
          >▲</button>
          <button
            onTouchStart={e => { e.preventDefault(); onLane(1); }}
            onClick={() => onLane(1)}
            className="rounded-lg font-bold text-lg flex items-center justify-center focus-visible:outline-none"
            style={{ width: 52, height: 52, backgroundColor: "#1a1a2e", border: "2px solid #2a2a4e", color: "#69f0ae" }}
            aria-label="Lane down"
          >▼</button>
        </div>

        {/* Run left (hold to collect tips) */}
        <button
          onTouchStart={e => { e.preventDefault(); onLeft(); }}
          onTouchEnd={e => { e.preventDefault(); onLeftUp(); }}
          onMouseDown={onLeft}
          onMouseUp={onLeftUp}
          onMouseLeave={onLeftUp}
          className="rounded-lg font-bold text-lg flex items-center justify-center focus-visible:outline-none"
          style={{ width: 72, height: 52, backgroundColor: "#1a1a2e", border: "2px solid #2a2a4e", color: "#ffca28" }}
          aria-label="Run left"
        >◀ RUN</button>

        {/* TAP / shoot */}
        <button
          onTouchStart={e => { e.preventDefault(); onShoot(); }}
          onClick={onShoot}
          className="rounded-lg font-bold flex items-center justify-center focus-visible:outline-none active:scale-95 transition-transform"
          style={{
            width: 100, height: 52,
            backgroundColor: "#1b5e20",
            border: "2px solid #69f0ae",
            color: "#69f0ae",
            fontSize: 15,
            boxShadow: "0 0 12px rgba(105,240,174,0.25)",
          }}
          aria-label="Tap / pour beer"
        >
          TAP
        </button>
      </div>

      <p className="text-center text-xs mt-2" style={{ color: "rgba(255,255,255,0.2)" }}>
        ↑↓ lanes · ← run · Space tap · collect 💰 tips
      </p>
    </div>
  );
}

// ─── Sprite helpers ───────────────────────────────────────────────────────────
const laneY = (lane: number) => lane * LANE_H + LANE_H / 2 + 8;

function absPos(lane: number, x: number): React.CSSProperties {
  return {
    position: "absolute",
    left: `${x}%`,
    top: laneY(lane),
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  };
}

function CustomerSprite({ lane, x, state }: { lane: number; x: number; state: CustState }) {
  const drinking = state === "drink";
  const leaving  = state === "leave";
  return (
    <div style={absPos(lane, x)}>
      <svg width="24" height="36" viewBox="0 0 24 36" aria-hidden="true">
        {/* Head */}
        <circle cx="12" cy="7" r="6.5"
          fill={drinking ? "#ef9a9a" : leaving ? "#a5d6a7" : "#ffca28"}
        />
        {/* Eyes */}
        <circle cx="9.5"  cy="6.5" r="1" fill="#1a1007" />
        <circle cx="14.5" cy="6.5" r="1" fill="#1a1007" />
        {/* Expression */}
        {drinking
          ? <path d="M9 9.5 Q12 11.5 15 9.5" stroke="#1a1007" strokeWidth="1" strokeLinecap="round" fill="none" />
          : leaving
          ? <path d="M9 9 Q12 11 15 9" stroke="#1a1007" strokeWidth="1" strokeLinecap="round" fill="none" />
          : <path d="M9 10 Q12 8 15 10" stroke="#1a1007" strokeWidth="1" strokeLinecap="round" fill="none" />
        }
        {/* Body */}
        <rect x="5" y="14" width="14" height="13" rx="2"
          fill={drinking ? "#ef5350" : leaving ? "#66bb6a" : "#42a5f5"}
        />
        {/* Legs */}
        <rect x="6"  y="26" width="5" height="9" rx="2"
          fill={drinking ? "#c62828" : leaving ? "#388e3c" : "#1565c0"} />
        <rect x="13" y="26" width="5" height="9" rx="2"
          fill={drinking ? "#c62828" : leaving ? "#388e3c" : "#1565c0"} />
      </svg>
    </div>
  );
}

function BartenderSprite({ lane, x }: { lane: number; x: number }) {
  return (
    <div style={absPos(lane, x)}>
      <svg width="26" height="38" viewBox="0 0 26 38" aria-hidden="true">
        {/* Head */}
        <circle cx="13" cy="7" r="7" fill="#fff9c4" />
        {/* Eyes */}
        <circle cx="10.5" cy="6" r="1.1" fill="#1a1007" />
        <circle cx="15.5" cy="6" r="1.1" fill="#1a1007" />
        {/* Smile */}
        <path d="M10 9.5 Q13 11.5 16 9.5" stroke="#1a1007" strokeWidth="1.1" strokeLinecap="round" fill="none" />
        {/* Apron body */}
        <rect x="4" y="15" width="18" height="14" rx="2" fill="#ef5350" />
        {/* Apron strings */}
        <rect x="8"  y="15" width="3" height="12" rx="1" fill="white" opacity="0.5" />
        <rect x="15" y="15" width="3" height="12" rx="1" fill="white" opacity="0.5" />
        {/* Legs */}
        <rect x="5"  y="28" width="6" height="9" rx="2" fill="#424242" />
        <rect x="15" y="28" width="6" height="9" rx="2" fill="#424242" />
      </svg>
    </div>
  );
}

function MugFull({ lane, x }: { lane: number; x: number }) {
  return (
    <div style={absPos(lane, x)}>
      <svg width="18" height="22" viewBox="0 0 18 22" aria-hidden="true">
        <rect x="1" y="4" width="12" height="15" rx="2" fill="#ffca28" opacity="0.95" />
        <path d="M13 7 Q18 7 18 11.5 Q18 16 13 16" stroke="#ffca28" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="7" cy="4" rx="6" ry="2.5" fill="rgba(255,250,240,0.95)" />
        <rect x="3" y="7" width="1.5" height="8" rx="0.75" fill="rgba(255,255,255,0.3)" />
      </svg>
    </div>
  );
}

function MugEmpty({ lane, x }: { lane: number; x: number }) {
  return (
    <div style={absPos(lane, x)}>
      <svg width="16" height="20" viewBox="0 0 16 20" aria-hidden="true">
        <rect x="1" y="3" width="10" height="14" rx="2" fill="none" stroke="#90a4ae" strokeWidth="1.5" />
        <path d="M11 6 Q16 6 16 10.5 Q16 15 11 15" stroke="#90a4ae" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function Coin({ lane, x }: { lane: number; x: number }) {
  return (
    <div style={absPos(lane, x)}>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="7" fill="#ffd54f" stroke="#f9a825" strokeWidth="1.5" />
        <text x="8" y="12" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#f57f17">$</text>
      </svg>
    </div>
  );
}

function DoorSVG({ lane }: { lane: number }) {
  const top = lane * LANE_H + 12;
  return (
    <svg
      style={{ position: "absolute", left: 0, top, pointerEvents: "none" }}
      width="22"
      height={LANE_H - 12}
      viewBox={`0 0 22 ${LANE_H - 12}`}
      aria-hidden="true"
    >
      <rect x="1" y="2" width="20" height={LANE_H - 18} rx="2"
        fill="#1a0533" stroke="#6a1b9a" strokeWidth="1.5" />
      <circle cx="17" cy={(LANE_H - 18) / 2 + 2} r="2" fill="#ce93d8" />
    </svg>
  );
}

function KegSVG({ lane, active }: { lane: number; active: boolean }) {
  const top = lane * LANE_H + 14;
  return (
    <svg
      style={{ position: "absolute", right: 0, top, pointerEvents: "none" }}
      width="28"
      height={LANE_H - 18}
      viewBox={`0 0 28 ${LANE_H - 18}`}
      aria-hidden="true"
    >
      {/* Keg barrel */}
      <ellipse cx="14" cy="8" rx="12" ry="7" fill={active ? "#2e7d32" : "#1b5e20"} stroke={active ? "#69f0ae" : "#388e3c"} strokeWidth="1.5" />
      <rect x="2" y="8" width="24" height={LANE_H - 34} rx="0"
        fill={active ? "#2e7d32" : "#1b5e20"} stroke={active ? "#69f0ae" : "#388e3c"} strokeWidth="1.5" />
      <ellipse cx="14" cy={LANE_H - 26} rx="12" ry="7"
        fill={active ? "#388e3c" : "#256025"} stroke={active ? "#69f0ae" : "#388e3c"} strokeWidth="1.5" />
      {/* Tap handle */}
      <rect x="11" y="1" width="6" height="10" rx="3" fill={active ? "#69f0ae" : "#4caf50"} />
    </svg>
  );
}

// ─── Other screens ────────────────────────────────────────────────────────────
function IdleScreen({ onStart, lb }: { onStart: () => void; lb: LBEntry[] }) {
  return (
    <div className="flex flex-col items-center max-w-sm w-full">
      <div
        className="rounded-xl p-4 mb-5 text-sm w-full"
        style={{ backgroundColor: "#1a1a2e", border: "1px solid #2a2a4e", color: "rgba(255,255,255,0.65)" }}
      >
        <p className="mb-2">
          Customers enter through <span style={{ color: "#ce93d8" }}>left doors</span> and
          walk toward your <span style={{ color: "#69f0ae" }}>keg on the right</span>.
          Tap to slide a beer — it pushes them back.
        </p>
        <p className="mb-2">
          Customers who finish their drink slide the
          <span style={{ color: "#90a4ae" }}> empty mug back</span> — be on that lane at the keg to catch it or you lose a life.
        </p>
        <p>
          Run left to collect <span style={{ color: "#ffd54f" }}>💰 tips</span>. Let anyone
          reach the keg end and you lose a life.
        </p>
      </div>
      <div className="text-xs mb-5 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
        ↑↓ switch lanes &nbsp;·&nbsp; ← run for tips &nbsp;·&nbsp; Space = TAP
      </div>
      <button
        onClick={onStart}
        className="rounded-lg px-12 py-3 text-base font-bold mb-6 transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#1b5e20", border: "2px solid #69f0ae", color: "#69f0ae", boxShadow: "0 0 16px rgba(105,240,174,0.3)" }}
      >
        INSERT COIN
      </button>
      {lb.length > 0 && <Leaderboard lb={lb} newIdx={null} />}
    </div>
  );
}

function DeadScreen({ score, onRestart, lb }: { score: number; onRestart: () => void; lb: LBEntry[] }) {
  return (
    <div className="flex flex-col items-center max-w-sm w-full">
      <p className="font-heading text-xl font-bold mb-1" style={{ color: "#ef5350" }}>GAME OVER</p>
      <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>They drank you dry.</p>
      <p className="font-mono text-5xl font-bold mb-6" style={{ color: "#69f0ae" }}>
        {String(score).padStart(6, "0")}
      </p>
      <button
        onClick={onRestart}
        className="rounded-lg px-12 py-3 text-base font-bold mb-7 transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#1b5e20", border: "2px solid #69f0ae", color: "#69f0ae" }}
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
    <div className="flex flex-col items-center text-center max-w-xs">
      <p className="font-mono text-lg font-bold mb-1" style={{ color: "#ffca28" }}>
        ★ HIGH SCORE ★
      </p>
      <p className="font-mono text-5xl font-bold mb-5" style={{ color: "#69f0ae" }}>
        {String(score).padStart(6, "0")}
      </p>
      <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>ENTER YOUR INITIALS</p>
      <div className="flex gap-2 mb-5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="font-mono text-3xl font-bold flex items-center justify-center rounded"
            style={{
              width: 52, height: 60,
              backgroundColor: "#1a1a2e",
              border: `2px solid ${i === initials.length && initials.length < 3 ? "#69f0ae" : "#2a2a4e"}`,
              color: initials[i] ? "#fff" : "rgba(255,255,255,0.15)",
              boxShadow: i === initials.length && initials.length < 3 ? "0 0 8px rgba(105,240,174,0.5)" : "none",
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
        autoFocus autoComplete="off" spellCheck={false}
      />
      <button
        onClick={onSubmit}
        disabled={initials.trim().length === 0}
        className="rounded-lg px-10 py-3 font-bold transition-opacity hover:opacity-90 disabled:opacity-30"
        style={{ backgroundColor: "#1b5e20", border: "2px solid #69f0ae", color: "#69f0ae" }}
      >
        REGISTER
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
        className="mt-5 rounded-lg px-12 py-3 font-bold transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#1b5e20", border: "2px solid #69f0ae", color: "#69f0ae" }}
      >
        PLAY AGAIN
      </button>
    </div>
  );
}

function Leaderboard({ lb, newIdx }: { lb: LBEntry[]; newIdx: number | null }) {
  return (
    <div className="w-full overflow-hidden rounded-xl" style={{ border: "1px solid #2a2a4e" }}>
      <div
        className="px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-center"
        style={{ backgroundColor: "#1a1a2e", color: "#ffca28", borderBottom: "1px solid #2a2a4e" }}
      >
        ★ HIGH SCORES ★
      </div>
      {lb.length === 0 && (
        <div className="px-4 py-5 text-center text-sm" style={{ color: "rgba(255,255,255,0.25)", backgroundColor: "#12121f" }}>
          No scores yet.
        </div>
      )}
      {lb.map((e, i) => {
        const isNew = i === newIdx;
        const top3  = i < 3;
        return (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2 font-mono"
            style={{
              backgroundColor: isNew ? "rgba(105,240,174,0.1)" : i % 2 === 0 ? "#12121f" : "#0d0d1a",
              borderTop: "1px solid #1a1a2e",
            }}
          >
            <span className="w-5 text-right text-xs font-bold"
                  style={{ color: top3 ? "#ffca28" : "rgba(255,255,255,0.25)" }}>
              {i + 1}
            </span>
            <span className="flex-1 tracking-[0.3em] text-sm font-bold"
                  style={{ color: isNew ? "#69f0ae" : "white" }}>
              {e.initials}
            </span>
            <span className="tabular-nums text-sm font-bold"
                  style={{ color: isNew ? "#69f0ae" : "rgba(255,255,255,0.6)" }}>
              {String(e.score).padStart(6, "0")}
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
    const t = setInterval(() => setOn(v => !v), 500);
    return () => clearInterval(t);
  }, []);
  return <span style={{ color: "#69f0ae", opacity: on ? 1 : 0 }}>█</span>;
}
