import {
  getBoard,
  isOpenMonth,
  isValidMonth,
  normalizeName,
  normalizeScore,
  submitScore,
} from "@/lib/tap-rush-leaderboard";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const month = new URL(request.url).searchParams.get("month");
  if (!isValidMonth(month)) {
    return Response.json({ error: "Invalid month" }, { status: 400, headers: NO_STORE });
  }

  try {
    return Response.json(await getBoard(month), { headers: NO_STORE });
  } catch (err) {
    console.error("Tap Rush leaderboard read failed", err);
    return Response.json({ error: "Leaderboard unavailable" }, { status: 503, headers: NO_STORE });
  }
}

export async function POST(request: Request) {
  let body: { month?: unknown; name?: unknown; score?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400, headers: NO_STORE });
  }

  const { month } = body;
  const name = normalizeName(body.name);
  const score = normalizeScore(body.score);
  if (!isValidMonth(month) || !isOpenMonth(month) || !name || score === null) {
    return Response.json({ error: "Invalid entry" }, { status: 400, headers: NO_STORE });
  }

  try {
    return Response.json(await submitScore(month, name, score), { headers: NO_STORE });
  } catch (err) {
    console.error("Tap Rush leaderboard write failed", err);
    return Response.json({ error: "Leaderboard unavailable" }, { status: 503, headers: NO_STORE });
  }
}
