import { readFileSync } from "fs";
import { join } from "path";
import { currentMonth, getBoard, type PublicEntry } from "@/lib/tap-rush-leaderboard";

export const dynamic = "force-dynamic";

const BACK_LINK_STYLE = `<style>
  #ig-back{
    position:fixed;top:0;left:0;z-index:9999;
    display:inline-block;padding:12px 16px;line-height:1;
    font-family:var(--arcade, 'Courier New', monospace);font-size:.65rem;font-weight:700;
    letter-spacing:.05em;text-transform:uppercase;text-decoration:none;
    color:rgba(255,255,255,0.35);transition:color .15s;
  }
  #ig-back:hover{color:var(--lime, #9be070);}
  @media (hover:none) and (pointer:coarse){
    #ig-back{padding:14px 20px;font-size:.75rem;color:rgba(255,255,255,0.5);}
  }
</style>`;

const BACK_LINK = `<a id="ig-back" href="/">&larr; Back to site</a>`;

// The game decides whether a score made the top 10 using the board saved in the browser, so
// seed that with the shared board before the game script runs.
function leaderboardScript(month: string, board: PublicEntry[] | null): string {
  const lines = [`window.TAP_RUSH_LEADERBOARD_URL = "/api/tap-rush/leaderboard/";`];
  if (board) {
    const seed = board.map((e, i) => ({ n: e.name, s: e.score, t: i }));
    const literal = JSON.stringify(JSON.stringify(seed)).replace(/</g, "\\u003c");
    lines.push(
      `try { localStorage.setItem("hopYardTapRush.board.${month}", ${literal}); } catch (e) {}`
    );
  }
  return `<script>\n${lines.join("\n")}\n</script>`;
}

export async function GET() {
  const month = currentMonth();
  const board = await getBoard(month).catch((err) => {
    console.error("Tap Rush leaderboard seed failed", err);
    return null;
  });

  const html = readFileSync(join(process.cwd(), "public", "tap-rush.html"), "utf8")
    .replace("</head>", `${BACK_LINK_STYLE}\n${leaderboardScript(month, board)}\n</head>`)
    .replace("<body>", `<body>\n${BACK_LINK}`);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      // Keep it off search engines
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
