# Hop Yard Ale Works — Site Analysis (2026-11-22)

**Scope:** full read of `src/`, config, and scripts; live checks against the production Vercel alias
(`hop-yard-ale-works.vercel.app`); a local `npm ci`, `eslint`, `tsc`, `next build`, and `npm audit`.
**Supersedes:** `AUDIT.md` (2026-09-28). 42 commits have landed since. I did not re-verify every old
finding, but several are visibly fixed (see "Fixed since September").

**Not tested:** nothing was rendered in a browser, so there are no visual/mobile checks and no
Lighthouse numbers. Performance figures below come from the build output, live headers, and code.
"Verified" means observed live or in the build; "Code" means read from source only.

---

## Top 10, in order

| # | Issue | Area | Effort |
|---|---|---|---|
| 1 | Drinks menus and the quiz are **not cached at all** (every visit scrapes Untappd + Sanity) | Speed | Small |
| 2 | Home page canonical and `og:url` are `https://hopyardaleworks.com/index/` (wrong) | SEO | Small |
| 3 | `/api/debug-untappd` is public on production and marked "temporary" | Security | Small |
| 4 | Tap Rush leaderboard accepts any score from anyone; no rate limit | Security | Medium |
| 5 | `hopyardaleworks.com` still serves the old WordPress site; the new site is indexable on the vercel.app alias and canonicalizes to a domain it isn't on | Launch / SEO | Medium |
| 6 | Dependency advisories: Next 16.2.6 critical (proxy bypass), 37 total in `npm audit` | Security | Small–Med |
| 7 | Structured data is thin: no FAQPage, no geo, no Menu, no Google Business Profile `sameAs`; sitemap omits 2 pages; no `llms.txt` | SEO / AI-SEO | Small–Med |
| 8 | 262 KB gzip of JS on the home page, mostly decoration (chat bot, scroll effects, easter eggs) on every page | Speed | Medium |
| 9 | Sanity edits take up to 15–60 min to show; the webhook env var is documented but no webhook route exists | Efficiency | Small |
| 10 | Lint fails: 19 errors, 9 warnings | Quality | Small–Med |

---

## 1. Performance and efficiency

**Verified**
- **Uncached dynamic pages (#1).** `next build` marks `/appleton-drinks-menu`, `/the-falls-drinks-menu`
  and `/what-to-drink` as `ƒ` (dynamic) even though each exports `revalidate`. Live responses are
  `Cache-Control: private, no-cache, no-store` with `X-Vercel-Cache: MISS` (~0.7 s). Cause:
  `fetch(..., { cache: "no-store" })` in `src/lib/untappd-scrape.ts:114`, added in the Oct 22 commit
  "bypass Next.js fetch cache". That opts the whole route out of ISR, so `revalidate = 3600` does
  nothing, and every visitor triggers a scrape of Untappd's embed plus Sanity reads. Static pages
  like `/appleton` are `HIT` with `Age` > 0. Fix: use `next: { revalidate: 1800 }` (or
  `unstable_cache`) and only skip caching when the scrape returns empty, so an empty result can't stick.
- **JS weight (#8).** Home page loads 15 script tags: 862 KB raw / 262 KB gzip. HTML is 121 KB.
  37 `"use client"` components. Site-wide in `layout.tsx`: `ChatBot` (bundles the 497-line answer
  engine plus FAQ data), `KonamiCode`, `TabTitleInactivity`, `ScrollProgressBar`, `BackToTop`.
  Home adds parallax, tilt, word-reveal, bubbles, pizza-spin, beer-fill. Lazy-load the chat bot
  (`next/dynamic`, load on first click), drop or consolidate the decorative scroll components, and
  check what the top 63 KB chunk contains.
- **Fonts.** Four families (Zilla Slab, Inter, DM Mono, Wooderson) with five preloaded files on the home
  page. Consider dropping DM Mono or trimming Zilla Slab weights (400/500/600/700).
- **`/pour`** reads a 500 KB HTML file from disk plus a Sanity doc on every request, `no-store`.
  Fine at low traffic; could cache the file in memory and seed the board client-side.

**Code**
- Layout runs 3 Sanity queries (theme, global config, chatbot data) for every page render; they're
  ISR-cached, so acceptable, but `chatbotDataQuery` ships FAQ text to every page's HTML payload.
- Untappd scraping is regex over class names. It already broke once (Oct 15). When it fails it returns
  `[]` silently and the page shows an empty tap list with no alert. Add a "last good" fallback and a
  log/alert. The long-term fix is Untappd for Business's official API.
- `public/` is 11 MB; some sources are large (`pizza.png` 628 KB, `pallet-sign.png` 499 KB). Served via
  `next/image` they're optimized, so low priority. Hero LCP preload/`fetchpriority` not verified.

## 2. Security

**Verified**
- **Debug endpoint (#3):** `/api/debug-untappd/` returns 200 with scrape internals on production. The
  file's own comment says "Remove once the issue is resolved." Delete it.
- **Dependencies (#6):** `npm audit --omit=dev`: 37 advisories (2 critical, 17 high). Critical items:
  Next.js "Middleware / Proxy bypass" (this site has no middleware, so likely not exploitable, but
  upgrade within 16.2.x anyway) and a transitive `tar`. Most of the rest are Sanity Studio tooling
  (`vite`, `launch-editor`, `zod`). Run `npm audit fix`, then update `next`/`sanity`/`next-sanity`.
- **Headers:** `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, `frame-ancestors`,
  and HSTS (via Vercel) are present. No full CSP. A CSP is doable but needs care because of inline JSON-LD
  and the `/pour` inline scripts. Medium effort, modest gain.

**Code**
- **Leaderboard (#4):** `POST /api/tap-rush/leaderboard` is unauthenticated. The score comes from the
  client, so anyone can POST `{score: 9999999}` (the server only checks it's an integer ≤ 9,999,999 and a
  3-letter, blocklisted name). There's no rate limit, and each POST writes to Sanity using a write token.
  Fixes: rate-limit by IP (Vercel KV/Upstash or Vercel Firewall rule), cap plausible score growth, and
  sign a short-lived run token issued at game start. Be honest with yourself that a client-side game
  can't be made cheat-proof; the goal is stopping drive-by abuse and token/quota burn.
- **Contact form:** good basics (server action, length limits, email regex, subject/location allowlists,
  CR/LF stripped from name, honeypot, honest "not configured" state, plain-text email). Missing rate
  limiting or Turnstile/hCaptcha; a bot can send unlimited mail through your Resend quota.
- `/studio` is public but requires Sanity login and sends `noindex`. Fine.
- `.env.example` omits `SANITY_API_WRITE_TOKEN` (used by the leaderboard) and lists `NEXT_PUBLIC_SANITY_*`
  vars the code ignores: `src/lib/sanity/client.ts` hardcodes project ID and dataset.
- No secrets in the repo; `.env*` ignored. JSON-LD is escaped (`<` → `<`). Good.

## 3. SEO

**Verified**
- **Home canonical (#2):** `<link rel="canonical" href="https://hopyardaleworks.com/index/">` and
  `og:url` the same. Every other page I checked is correct (`/appleton/`, `/faq/`, etc.), so it's specific
  to the root. Set `alternates: { canonical: "/" }` (and `openGraph.url: "/"`) in `src/app/page.tsx`.
- **Domain/launch state (#5):** `https://hopyardaleworks.com/` currently returns WordPress.com headers.
  Meanwhile the vercel.app production alias serves `robots: allow`, a sitemap listing `hopyardaleworks.com`
  URLs, and canonicals pointing at the old site. Until cutover, either `noindex` the vercel.app alias or
  accept that its canonicals point to WordPress. After cutover: keep the redirect map in `next.config.ts`,
  submit the sitemap, and watch Search Console for 404s from old WordPress URLs.
- **Sitemap:** omits `/what-to-drink/` and `/photos/`, and has no `lastmod`. (`/privacy-policy` is
  `noindex` on purpose.)
- Titles are single-branded and unique, descriptions present, one `<h1>` per page, `lang="en"`, OG image
  and `summary_large_image` set. Good.
- No `manifest.webmanifest`, no `apple-icon` (404).

## 4. AI-SEO / structured data

- JSON-LD exists only on home (Organization, WebSite), the two location pages (`Brewery`+`Restaurant`,
  hours, `OrderAction`, `hasMenu`), and events (none right now). Hours in schema are correct (Appleton Sun
  11–4).
- **Add:** `FAQPage` on `/faq` (answers are in Sanity, so it's data-driven); `geo` coordinates and a
  proper `image` (taproom photo, not the logo) on locations; `sameAs` with the Google Business Profile
  URLs (there's a TODO in `structured-data.ts:16`); `Menu`/`MenuItem` markup or at least keep menus as
  HTML text (they are); `priceRange`; `areaServed`.
- **`/llms.txt` doesn't exist** (404). Cheap to add: a short markdown file listing locations, hours
  summary, and key URLs. Treat as optional; support varies.
- The tap list is server-rendered on the drinks pages (good for AI crawlers), but it's the same page that's
  uncached (#1), and an empty scrape produces a page with no beers for crawlers too.
- Chat bot answers are client-side only, so none of that content helps AI search. The FAQ page is the
  right place for crawlable answers.

## 5. UI / UX / accessibility

**Verified or Code (no visual testing)**
- Strong brand voice and distinct sections; sticky order bar on menu pages; location-aware nav and quiz;
  Chicago-time open/closed badge computed client-side so it stays correct under ISR caching.
- **No skip-to-content link** anywhere. Add one in `layout.tsx` (Small).
- Global `prefers-reduced-motion` and `:focus-visible` styles exist. Good. Check that the parallax and
  scroll components honor reduced motion individually (the hero does).
- Chat dialog uses `role="dialog"`; I didn't see a focus trap or `aria-modal` in the code I read.
- 24 `next/image` uses vs 2 raw `<img>` (lint warns); 6 decorative images use `alt=""` correctly.
- Gimmick load (Konami code, inactive-tab title, logo-click easter eggs, scroll fills, "you're up late"
  banner) adds personality but also JS, scroll listeners, and a fixed strip that can overlap content on
  small screens. Keep the best two, cut the rest if speed matters more than whimsy.
- The "up late" strip is `fixed bottom-0` and `pointer-events-none`, but stacks with the sticky order bar
  and chat FAB on mobile. Worth a phone check.

## 6. Features and functionality

- Working: Sanity-driven locations, FAQ, events, photos, seasonal theme/banner; Toast ordering links;
  contact form via Resend; events page honestly shows "No events posted right now" (the fake demo events
  from September are gone); quiz, Spin the Tap, Tap Rush game with monthly leaderboard; rule-based chat bot
  with Vercel Analytics logging of unanswered questions (with a redaction helper).
- Gaps: no email signup (still a TODO in the footer); no on-demand revalidation (#9: add
  `/api/revalidate` verifying `SANITY_WEBHOOK_SECRET` and a Sanity webhook); no tap-list failure fallback;
  no phone (by owner choice); privacy policy should mention chat-question logging and the weather lookup
  to Open-Meteo.

## 7. Code quality

- `tsc --noEmit`: clean. `next build`: passes (Turbopack, 21 pages).
- `eslint src`: **19 errors, 9 warnings**: 9× `react-hooks/set-state-in-effect`, 7×
  `react/no-unescaped-entities` (apostrophes in JSX text), 2× `react-hooks/refs`, 1×
  `react-hooks/immutability`, 2× `no-img-element`, 7× unused vars. Mostly mechanical; the set-state-in-effect
  ones (e.g. `SpinTheTap.tsx:57`, `WeatherNudge.tsx:93`) are worth fixing properly since they cause extra renders.
- Hours live in `location-data.ts` and Sanity with a fallback layer; the earlier "hours in 10 places"
  problem looks improved but I didn't re-audit every copy.
- A few large client files (`TapperGame.tsx` 902 lines, `GlobalHeader.tsx` 674, `EventsClient.tsx` 651,
  `BeerQuiz.tsx` 528) are candidates for splitting/lazy-loading.

## Fixed since September (observed)

Single-branded titles; canonicals on all pages but home; `og:image` + large Twitter card; Appleton Sunday
hours corrected in schema; fake events removed; location JSON-LD uses valid types; newsletter fake-success
removed; contact form reports "not configured" honestly; Tap Rush replaced by a server-backed leaderboard.

## Suggested order of work

1. **Now (an hour or two):** #1 cache Untappd fetch, #2 home canonical, #3 delete debug route, skip link.
2. **This week:** #6 upgrade Next and run `npm audit fix`; #4 rate-limit the leaderboard and contact form;
   #9 revalidation webhook; sitemap additions; lint errors.
3. **Before/at domain cutover:** #5 plan (noindex alias or redirect, Search Console, GBP links), #7 schema
   and `llms.txt`.
4. **Then:** #8 JS diet, font trim, CSP, real Lighthouse run in a browser on phone-size viewports.
