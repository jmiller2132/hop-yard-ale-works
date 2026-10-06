import { createClient } from "@sanity/client";
import { randomUUID } from "crypto";

const writeClient = createClient({
  projectId: "huwr3nhe",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

export const BOARD_TYPE = "tapRushBoard";
const BOARD_SIZE = 10;
const MAX_SCORE = 9_999_999;
const TIME_ZONE = "America/Chicago";

// Mirrors the blocked list inside public/tap-rush.html so the server can't be used to bypass it.
const BLOCKED = new Set([
  "ASS", "CUM", "DIK", "DIC", "FAG", "FCK", "FUC", "FUK", "FUQ", "JIZ", "KKK",
  "NIG", "NGR", "SEX", "TIT", "WTF", "POO", "PEE", "GAY", "HOE", "XXX", "KYS",
]);

export type PublicEntry = { name: string; score: number };

type StoredEntry = PublicEntry & { _key: string; submittedAt: string };

type BoardDoc = {
  _id: string;
  _rev: string;
  month: string;
  entries?: StoredEntry[];
};

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidMonth(month: unknown): month is string {
  return typeof month === "string" && MONTH_RE.test(month);
}

export function normalizeName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const n = name.toUpperCase();
  if (!/^[A-Z]{3}$/.test(n) || BLOCKED.has(n)) return null;
  return n;
}

export function normalizeScore(score: unknown): number | null {
  if (typeof score !== "number" || !Number.isInteger(score)) return null;
  if (score <= 0 || score > MAX_SCORE) return null;
  return score;
}

function monthIn(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  return `${year}-${month}`;
}

export function currentMonth(): string {
  return monthIn(new Date(), TIME_ZONE);
}

// The game keys boards by the player's local month, so around midnight on the 1st a player in
// another time zone can legitimately be one month ahead of or behind the brewery.
export function isOpenMonth(month: string): boolean {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return [now - day, now, now + day].some((t) => monthIn(new Date(t), "UTC") === month);
}

function docId(month: string): string {
  return `${BOARD_TYPE}-${month}`;
}

function ranked(entries: StoredEntry[]): StoredEntry[] {
  return [...entries]
    .sort((a, b) => b.score - a.score || a.submittedAt.localeCompare(b.submittedAt))
    .slice(0, BOARD_SIZE);
}

function toPublic(entries: StoredEntry[]): PublicEntry[] {
  return entries.map(({ name, score }) => ({ name, score }));
}

export async function getBoard(month: string): Promise<PublicEntry[]> {
  const doc = await writeClient.getDocument<BoardDoc>(docId(month));
  return toPublic(ranked(doc?.entries ?? []));
}

export async function submitScore(
  month: string,
  name: string,
  score: number
): Promise<PublicEntry[]> {
  const id = docId(month);
  await writeClient.createIfNotExists({ _id: id, _type: BOARD_TYPE, month, entries: [] });

  const entry: StoredEntry = {
    _key: randomUUID().replace(/-/g, "").slice(0, 12),
    name,
    score,
    submittedAt: new Date().toISOString(),
  };

  for (let attempt = 0; attempt < 10; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 50 + Math.random() * 150 * attempt));
    const doc = await writeClient.getDocument<BoardDoc>(id);
    if (!doc) continue;

    const current = doc.entries ?? [];
    const next = ranked([...current, entry]);
    if (!next.includes(entry)) return toPublic(ranked(current));

    try {
      await writeClient.patch(id).ifRevisionId(doc._rev).set({ entries: next }).commit();
      return toPublic(next);
    } catch (err) {
      if ((err as { statusCode?: number }).statusCode === 409) continue;
      throw err;
    }
  }

  throw new Error("Leaderboard is busy, try again");
}
