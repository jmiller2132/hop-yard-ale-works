import { NextResponse } from "next/server";

// Temporary diagnostic endpoint — shows what the Untappd scraper returns
// from Vercel's environment. Remove once the issue is resolved.
export const dynamic = "force-dynamic"; // never cache

export async function GET() {

  const APPLETON = { breweryId: 35292, menuId: 136697 };
  const url = `https://business.untappd.com/locations/${APPLETON.breweryId}/themes/${APPLETON.menuId}/js`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });

    const raw = await res.text();
    const html = raw
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\//g, "/");

    const blocks = html.split('menu-item clearfix"').slice(1);
    const hywBlocks = blocks.filter((b) =>
      /href="https:\/\/untappd\.com\/b\/hop-yard-ale-works/.test(b)
    );

    const beers = hywBlocks.map((block) => {
      const nameMatch = /<span id="[^"]+">([^<]+)<\/span>/.exec(block);
      const styleMatch = /class="item-category">([^<]+)<\/span>/.exec(block);
      const descDivMatch = /class="item-description[^"]*"[^>]*>([\s\S]*?)<\/div>/.exec(block);
      let desc: string | null = null;
      if (descDivMatch) {
        const pMatch = /<p[^>]*>([\s\S]*?)<\/p>/.exec(descDivMatch[1]);
        if (pMatch) desc = pMatch[1].replace(/<[^>]+>/g, "").trim() || null;
      }
      return {
        name: nameMatch?.[1] ?? "?",
        style: styleMatch?.[1] ?? "?",
        hasDescription: !!desc,
        descriptionPreview: desc ? desc.slice(0, 80) : null,
      };
    });

    return NextResponse.json({
      httpStatus: res.status,
      rawLength: raw.length,
      totalBlocks: blocks.length,
      hywBeerCount: hywBlocks.length,
      beers,
    });
  } catch (err) {
    return NextResponse.json({
      error: String(err),
      httpStatus: null,
      rawLength: 0,
      totalBlocks: 0,
      hywBeerCount: 0,
      beers: [],
    });
  }
}
