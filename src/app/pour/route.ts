import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const html = readFileSync(
    join(process.cwd(), "public", "tap-rush.html"),
    "utf8"
  );
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Keep it off search engines
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
