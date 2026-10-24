/**
 * Fetches the live tap list from Untappd's business embed endpoint.
 *
 * The embed JS at business.untappd.com/locations/{id}/themes/{menuId}/js
 * contains the full menu as an escaped HTML string — no API credentials needed.
 * Results are ISR-cached for 30 minutes so the homepage and quiz don't hammer
 * Untappd on every request.
 */

export interface TapBeer {
  name: string;
  style: string;
  styleKey: StyleKey | null;
  untappdUrl: string;
  isHopYardBeer: boolean;
  /** Brewery-written description from the Untappd embed, if present. */
  description: string | null;
  /** ABV string e.g. "7.4% ABV", if present. */
  abv: string | null;
}

export type StyleKey = "HAZY" | "WCIPA" | "STOUT" | "WHEAT" | "LAGER" | "SOUR" | "AMBER";

// ─── Style → StyleKey mapping ──────────────────────────────────────────────────
// Untappd style strings are matched by prefix (case-insensitive).
const STYLE_RULES: [string, StyleKey][] = [
  // Hazy / New England / Milkshake / Session IPAs
  ["IPA - Milkshake", "HAZY"],
  ["IPA - New England", "HAZY"],
  ["IPA - Hazy", "HAZY"],
  ["IPA - Session", "HAZY"],
  ["IPA - New Zealand", "HAZY"],
  ["IPA - American", "HAZY"],
  ["IPA - Imperial / Double New England", "HAZY"],
  ["Session IPA", "HAZY"],
  // West Coast / classic bitter IPA
  ["IPA - West Coast", "WCIPA"],
  ["IPA - Imperial / Double", "WCIPA"],
  ["IPA - Black", "WCIPA"],
  ["Pale Ale - American", "WCIPA"],
  // Dark / roasty
  ["Stout - American", "STOUT"],
  ["Stout - Imperial", "STOUT"],
  ["Stout - Milk / Sweet", "STOUT"],
  ["Stout - Irish Dry", "STOUT"],
  ["Porter - American", "STOUT"],
  ["Porter - Imperial", "STOUT"],
  ["Porter - Robust", "STOUT"],
  // Wheat / soft / easy
  ["Wheat Beer - American", "WHEAT"],
  ["Wheat Beer - Hefeweizen", "WHEAT"],
  ["Wheat Beer - Witbier", "WHEAT"],
  ["Wheat Ale", "WHEAT"],
  ["Blonde", "WHEAT"],
  // Crisp lager
  ["Lager - American", "LAGER"],
  ["Lager - Munich", "LAGER"],
  ["Lager - Amber", "LAGER"],
  ["Pilsner", "LAGER"],
  ["Kolsch", "LAGER"],
  ["Kölsch", "LAGER"],
  // Sour / tart / fruited
  ["Sour - American", "SOUR"],
  ["Sour - Fruited", "SOUR"],
  ["Sour - Berliner Weisse", "SOUR"],
  ["Sour - Traditional Gose", "SOUR"],
  ["Sour - Gose", "SOUR"],
  ["Wild Ale", "SOUR"],
  // Malty / amber / balanced
  ["Amber Ale", "AMBER"],
  ["Red Ale", "AMBER"],
  ["Brown Ale", "AMBER"],
  ["Scottish Ale", "AMBER"],
  ["Märzen", "AMBER"],
  ["Pale Ale - English", "AMBER"],
  // Lager / crisp additions
  ["Pilsner", "LAGER"],
  ["Kölsch", "LAGER"],
  // Extra hazy/fruited
  ["Pale Ale - New England", "HAZY"],
  ["Pale Ale - Hazy", "HAZY"],
];

function mapStyle(style: string): StyleKey | null {
  const lower = style.toLowerCase();
  for (const [prefix, key] of STYLE_RULES) {
    if (lower.startsWith(prefix.toLowerCase())) return key;
  }
  return null;
}

function decodeHtml(str: string): string {
  return str
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

// ─── Main fetch ────────────────────────────────────────────────────────────────

export async function fetchTapList(
  breweryId: number,
  menuId: number
): Promise<TapBeer[]> {
  try {
    const res = await fetch(
      `https://business.untappd.com/locations/${breweryId}/themes/${menuId}/js`,
      {
        // Don't use Next.js data cache — the page-level `revalidate` controls
        // how often the scrape runs. Using the data cache caused stale empty
        // results to persist even after code fixes.
        cache: "no-store",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      }
    );
    if (!res.ok) return [];

    const raw = await res.text();

    // The JS file embeds the HTML as a JavaScript string literal.
    // The string uses \" for quotes, \/ for closing tags, \n for newlines.
    // Un-escape so we can use regular HTML patterns.
    const html = raw
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\//g, "/");

    // Split on menu item boundaries. Each beer is inside a "menu-item clearfix" div.
    // Untappd prepends extra classes (e.g. "item-bg-color") so match on the suffix only.
    const blocks = html.split('menu-item clearfix"').slice(1);
    const beers: TapBeer[] = [];

    for (const block of blocks) {
      // The Untappd URL appears in the first <a> inside the block
      const urlMatch = /href="(https:\/\/untappd\.com\/b\/[^"]+)"/.exec(block);
      if (!urlMatch) continue;
      const untappdUrl = urlMatch[1];

      // Beer name is in a <span id="...">
      const nameMatch = /<span id="[^"]+">([^<]+)<\/span>/.exec(block);
      if (!nameMatch) continue;
      const name = decodeHtml(nameMatch[1].trim());

      // Style is in class="item-category"
      const styleMatch = /class="item-category">([^<]+)<\/span>/.exec(block);
      const style = styleMatch ? decodeHtml(styleMatch[1].trim()) : "";

      // Description is inside class="item-description" > <p>
      let description: string | null = null;
      const descDivMatch = /class="item-description[^"]*"[^>]*>([\s\S]*?)<\/div>/.exec(block);
      if (descDivMatch) {
        const pMatch = /<p[^>]*>([\s\S]*?)<\/p>/.exec(descDivMatch[1]);
        if (pMatch) {
          const raw = pMatch[1].replace(/<[^>]+>/g, "").trim();
          description = raw.length > 0 ? decodeHtml(raw) : null;
        }
      }

      // ABV e.g. "7.4% ABV"
      const abvMatch = /class="item-abv[^"]*">([^<]+)</.exec(block);
      const abv = abvMatch ? abvMatch[1].trim() : null;

      beers.push({
        name,
        style,
        styleKey: mapStyle(style),
        untappdUrl,
        isHopYardBeer: untappdUrl.includes("hop-yard-ale-works"),
        description,
        abv,
      });
    }

    return beers;
  } catch {
    return [];
  }
}

// ─── Merged helper ────────────────────────────────────────────────────────────

// Styles that are clearly not spinnable beers (sodas, pure NA, hard seltzer)
const NON_BEER_STYLES = [
  "soda",
  "non-alcoholic",
  "hard seltzer",
  "kombucha",
  "juice",
  "water",
  "lemonade",
  "tea",
];

function isSpinnableBeer(style: string): boolean {
  const lower = style.toLowerCase();
  return !NON_BEER_STYLES.some((term) => lower.includes(term));
}

/**
 * Fetch one or more locations, merge, and de-duplicate by name.
 *
 * Returns beers from the Untappd business embed (scoped to this brewery's menu).
 * - Sodas and pure NA drinks are excluded so the spinner stays beer-focused.
 * - styleKey may be null for unusual styles (chili beer, etc.) — callers that
 *   need a style match should filter on styleKey themselves.
 *
 * NOTE: `isHopYardBeer` (derived from the Untappd URL slug) was previously used
 * to filter out guest taps, but it silently dropped ALL beers if the brewery's
 * Untappd slug didn't match "hop-yard-ale-works" exactly. Since the business embed
 * endpoint is already scoped to a single brewery's menu, all returned beers are
 * effectively this brewery's beers. We keep `isHopYardBeer` as metadata but no
 * longer require it — guest taps (rare on a business embed) will show alongside
 * HYW originals rather than causing the quiz to fall back to no live data.
 */
export async function fetchAllTapBeers(
  configs: { breweryId: number; menuId: number }[]
): Promise<TapBeer[]> {
  const results = await Promise.all(
    configs.map((c) => fetchTapList(c.breweryId, c.menuId).catch(() => []))
  );
  const all = results.flat();

  // De-duplicate by name (same beer on both taps)
  const seen = new Set<string>();
  const deduped: TapBeer[] = [];
  for (const beer of all) {
    if (!seen.has(beer.name)) {
      seen.add(beer.name);
      deduped.push(beer);
    }
  }

  // Exclude obvious non-beer styles (sodas, NA, seltzers)
  return deduped.filter((b) => isSpinnableBeer(b.style));
}
