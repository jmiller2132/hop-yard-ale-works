# Hop Yard Ale Works — Website Audit

**Audited:** 2026-09-28 · **Code:** this repo at `HEAD` (`3e8f570`) · **Live:** https://hop-yard-ale-works.vercel.app/ (production alias)
**Method:** read every file under `src/`, `sanity/`, `scripts/`, `public/`, `next.config.ts`; fetched 17 live URLs with `curl` and inspected raw HTML, response headers, `robots.txt`, `sitemap.xml`, and the RSC payload (which shows what the live Sanity dataset contains). I did **not** modify any project file except writing this report. Items marked **(verified live)** were observed on the deployed site; **(code)** means read from source only; **(needs verification)** means I could not confirm it (see §6).

> **Not tested:** no browser was available, so nothing was rendered or measured at 320/375/390/768 px; the mobile findings are derived from the code (classes, sizes, fixed/sticky offsets) plus live HTML. PageSpeed Insights returned HTTP 429, so there are no Lighthouse numbers.

---

## Owner-confirmed facts (added 2026-09-28, after the first draft)

| Topic | Owner answer | Effect on this audit |
|---|---|---|
| **Hours** | Appleton: Mon–Tue closed · Wed–Sat 11 AM–10 PM · **Sun 11 AM–4 PM** · kitchen closes 1 hr before close Wed–Sat, **kitchen closes at 4 on Sunday**. Menomonee Falls: Mon closed · Tue–Thu 4–10 PM · Fri–Sat 11 AM–10 PM · **Sun 11 AM–4 PM "through Labor Day"** (Labor Day 2026 was Sept 7, so **Falls is currently closed Sundays**) · kitchen closes 1 hr before close. | **Every** Appleton Sunday listing on the site (12–6 PM) is wrong, and the Falls Sunday listing is wrong *right now* everywhere except the footer/FAQ. See DEP-6, LOC-1, GEO-4. |
| **Events** | The events in Sanity/seed are **fake demo data**. | The live `/events` page, its Event JSON-LD and the `.ics` downloads are publishing fake events. Upgraded to Critical — UX-7. |
| **Food menu** | Falls and Appleton food menus are identical. | Reusing one dataset is correct. UX-10 downgraded to a copy/duplicate-content note. |
| **Phone / GBP** | No phone. There is a Google Business Profile. | No `telephone` in schema is right. The GBP should be wired into the site (map, reviews link, `sameAs`) and its hours must match the corrected hours. LOC-2/LOC-8. |
| **Quotes** | Owner doesn't know if the attributions are real. | Treat as unverified → remove or replace (CONT-5). |

---

## 0. What the site is (my understanding)

- **Stack:** Next.js **16.2.6, App Router** (`src/app/**`), React 19, Tailwind v4, deployed on Vercel. Metadata is handled with the App Router `metadata` export (static per page; only a root `metadataBase`/title template in `src/app/layout.tsx`). No `generateMetadata`, no file-based OG images, no `alternates`.
- **Content sources (three, unreconciled):** (1) **Sanity** (`huwr3nhe/production`) for locations, events, FAQ, photos, seasonal theme, employee picks; (2) **hard-coded TS** for menus (`src/data/menu-*.ts`), fallback location data (`src/lib/location-data.ts`), the quote banner, the chatbot; (3) **third parties**: Untappd embed (tap list), Toast (ordering, external), Google Forms (`/apply`), Open-Meteo (weather line), Resend (contact email).
- **Rendering:** pages are ISR-prerendered (`revalidate` 900–3600 s) so the raw HTML contains real content. Open/closed badge, "today" highlight, weather line, footer message, quote, chatbot, and Untappd tap list are client-side.
- **Pages that exist:** `/`, `/appleton`, `/the-falls`, `/{appleton,the-falls}-{food,drinks}-menu`, `/events`, `/about`, `/contact`, `/apply`, plus pages you didn't list: `/faq`, `/photos`, `/privacy-policy`, `/pour` (iframe of `public/tap-rush.html`), `/studio` (embedded Sanity Studio).
- **No phone number exists anywhere** (`phone: null` in CMS and static data; contact page and FAQ say "we don't have phones"). Your brief lists tap-to-call as a mobile priority; that only applies if a phone is added or exists on the Google Business Profile.

---

## 1. Executive summary — fix these five first

| # | Fix | Why it matters | Findings |
|---|---|---|---|
| 1 | **Header "Order Online" is a dead link on every page, and the location switcher is broken** | The #1 conversion button does nothing (`href="#order-appleton"` — no such anchor exists). The switcher on `/` links to `/`, and on menu pages it jumps to the *other location's home page* instead of the equivalent menu. Both share one root cause family: path handling assumes trailing slashes that production doesn't serve. | UX-1, UX-2, SEO-1 |
| 2 | **Correct the hours now, then make them single-source (with a seasonal mechanism)** | Per the owner: **Appleton is open Sun 11 AM–4 PM but the site says 12–6 PM everywhere**, so Sunday visitors can arrive after closing. **Falls Sunday hours ended Labor Day (Sept 7)** but the CMS, home page, Falls page, schema, contact page and chatbot still advertise Sun 11–4 (only the footer and FAQ say closed). Hours live in 10 places, and nothing models "through Labor Day". Also, the "kitchen closes 1 hour before close" note is wrong for Appleton Sundays (kitchen closes at 4). | DEP-6, LOC-1, GEO-4 |
| 3 | **Stop silently discarding customer input** | The newsletter form shows "You're on the list" but stores nothing (`// TODO: wire to Mailchimp`). The contact form shows "Message received" even when email isn't configured (it only `console.log`s). Contact email HTML is built from unescaped user input. No privacy-policy link anywhere. | UX-5, UX-6, SEC-2, DEP-5 |
| 4 | **Indexing/sharing foundations: canonicals, titles, OG image, one base URL** | No page has a canonical (verified on all 17 URLs); 14 titles double the brand ("… | Hop Yard Ale Works | Hop Yard Ale Works"); no `og:image`, Twitter card is `summary`; the sitemap lists trailing-slash URLs that 308-redirect; the domain is hard-coded in 8 places with `www` vs apex mismatched. | SEO-1…4, DEP-1, DEP-2 |
| 5 | **Local SEO + AI-answerability: fix the schema and put real answers in crawlable HTML** | Location JSON-LD uses `@type: "BreweryOrWinery"` (I can't find that in schema.org — needs verification), and omits geo, phone, menu, sameAs, image, order action. Location pages are ~300 words with no map, parking, or accessibility info. FAQ answers only exist in the DOM after a click, and the actual tap list is JavaScript-only, so neither Google nor an AI assistant can answer "what beers do they brew?" | LOC-1…3, GEO-1, CONT-1…2 |

Also urgent: the owner confirmed the events data is **fake demo content**, but the live `/events` page is publishing it (Oct 3 / Oct 11 / Oct 25 shown as real, with Event JSON-LD and "Add to calendar" downloads). Delete it from Sanity before launch (UX-7).

---

## 2. What's working well

- **Server-rendered, content-rich HTML.** H1, addresses, hours, menu items, and wine/cider/NA lists are in the raw HTML (verified live). Menus are HTML text, not PDFs or images — a real advantage over most taproom sites.
- **Consistent NAP.** Name/address/ZIP match across footer, location pages, contact page, schema, and chatbot (verified live). Per-location Toast URLs are correct and distinct.
- **Good structural touches:** `<address>` elements, `<main>`, labelled `<nav>`s, `aria-pressed` on filters, global `prefers-reduced-motion` and `:focus-visible` rules (`globals.css`), 44 px minimums on most primary buttons, `rel="noopener noreferrer"` on all external links I read.
- **Thoughtful conversion bits:** sticky mobile "Order Online — {location}" bar on the four menu pages (`StickyOrderBar.tsx`), dietary filters with BYO guidance (`FoodMenuClient.tsx`), Chicago-timezone open/closed badge, `.ics` "Add to calendar" on events, hero cards with Visit + Order per location.
- **Redirect hygiene:** a solid permanent-redirect map for old WordPress slugs (`next.config.ts`); custom 404 with correct status and `noindex` (verified); `/studio` sends `X-Robots-Tag: noindex` (verified); `/pour` and privacy are `noindex`.
- **Fonts self-hosted** via `next/font`; Untappd embed is lazy-loaded on intersection; no secrets in the repo (`.env*` ignored).
- **Brand voice** is distinctive and consistent (404 "This page went 86.", "No phone? Correct.") — keep it; the recommendations below add clarity around it, not in place of it.

---

## 3. Findings

**Priority:** Critical / High / Medium / Low. **Effort:** Small (<1 hr) · Medium (half day) · Large (multi-day).

### 3.0 Status of the six items you asked me to verify first

| # | Your item | Verdict |
|---|---|---|
| 1 | "Switch to The Falls →" links to `/` | **Confirmed** (verified live: `<a href="/">Switch to The Falls →</a>` on `/`). Cause is deeper than one line — see **UX-2**. |
| 2 | Falls Sunday hours inconsistent | **Confirmed, and the real answer is "closed since Labor Day".** Footer (`GlobalFooter.tsx`) and the live FAQ say "Sun–Mon Closed" (currently correct); everything else still says Sun 11–4 (Sanity, home, Falls page, schema, contact, chatbot, meta description). Separately, **Appleton Sunday is wrong everywhere** (site: 12–6 PM; owner: 11 AM–4 PM). Ten definitions — see **DEP-6**. |
| 3 | Twitter card `summary`, no og:image | **Confirmed on all 17 URLs.** No canonical anywhere; titles doubled — see **SEO-1…3**. |
| 4 | Header "Order Online" → `#order-appleton` | **Confirmed and worse:** the anchor target doesn't exist anywhere, so it's a no-op on every page; Falls pages get `#order-falls` (also nonexistent). — **UX-1**. |
| 5 | Dozens of decorative footer/background icons | **Already resolved in code** — commit `0fa90b2` "Footer: remove marquee icon strip"; live home has 0 references to `/icons/` and just 1 `<img>` (the logo). What remains is 12 orphaned PNGs in `public/icons/` (+ unused `public/partners/*`, two seasonal logos) — **PERF-7**. |
| 6 | `/pour` easter egg | **Harmless, mostly OK.** `/pour` is `noindex,nofollow` and not in the sitemap (verified). Game makes no network calls (leaderboard URL is empty → `localStorage` only). Issues: the underlying **`/tap-rush.html` is directly indexable** (200, no `X-Robots-Tag`, no robots rule — verified), the footer link is an `opacity-20` emoji anchor with a near-invisible focus target, and the game has no reduced-motion handling — **SEO-5, A11Y-8**. |

---

### 3.1 UI / Visual Design

#### UI-1 · No real photography; heroes are flat black — High · Effort: Large (content) / Small (code)
- **Where:** `src/app/page.tsx` hero (`bg-black/30` overlay over a solid `--color-ink` background), `appleton/page.tsx` & `the-falls/page.tsx` heroes, menu/event/about heroes. The only photo on the site is `public/oliver-amy.jpg`. `Location.heroImage` and `SeasonalTheme.heroImages` are fetched (`queries.ts`) but never rendered; the "From the Taproom" grid only renders when Sanity has photos and currently doesn't (verified: absent from live home).
- **Problem:** A craft taproom lives on beer, pizza, and room atmosphere. Right now the first screen reads as a dark template with emoji icons (🍺🍕🤝). There are overlay divs waiting for an image that never arrives.
- **Fix:** Shoot/collect 3–5 photos per location (exterior, bar/taps, pizza from the oven, people). Wire `location.heroImage` into the location heroes with `next/image` (`fill`, `priority`, `sizes="100vw"`), keep the dark overlay for text contrast. On the home hero use one strong image or a split-image pair (one per location) — that also solves location choice visually. Populate Sanity `taproomPhoto` so the existing grid appears.

#### UI-2 · Brand green fails contrast as a fill and as text — High · Small
- **Where:** `--color-green #6ABF4B` in `globals.css`, used as `--color-seasonal-cta` (default) → **header "Order Online" button**, every location hero "Order Online"/"Get directions", `HoursTable` "today" row, Fan Favorite / Live Music badges, active food filter chips, contact links, `QuoteBanner` quote text (green on warm-white).
- **Problem (computed):** white on `#6ABF4B` = **2.29:1**; `#6ABF4B` text on `#F5F2EE` = **2.05:1**; muted gray `#6B7280` on `#F5F2EE` = **4.33:1** (used at `text-xs` for hours); active event chip `#4a9e2f` with white = **3.37:1**. WCAG AA needs 4.5:1 for normal text (3:1 for large/UI). The green is fine *on the ink background* (7.1:1).
- **Fix:** Keep `#6ABF4B` for accents on dark surfaces. Add a darker token for filled buttons and green text on light: e.g. `--color-green-strong: #2F7A1F` (white on it = 5.35:1), point `--color-seasonal-cta` default at it. Bump `--color-muted` to ~`#5B6470`. Seasonal palettes (`oktoberfest` 5.02:1) already pass.

#### UI-3 · Emoji as iconography and inconsistent icon language — Medium · Small
- **Where:** `page.tsx` `AboutPillar` (🍺🍕🤝), `appleton|the-falls/page.tsx` quick links (🍕🍺📅), `contact/page.tsx` location headings, footer `🍺` link, `ChatBot.tsx` copy.
- **Problem:** Emoji render differently per OS and read as casual rather than craft. Contact headings aren't `aria-hidden`, so screen readers announce "beer mug Appleton".
- **Fix:** Replace with a small set of consistent SVG line icons (you already inline SVGs elsewhere) or, better, photos. `aria-hidden` any that remain.

#### UI-4 · Sticky offsets don't match the header height — Medium · Small · *needs visual verification*
- **Where:** `GlobalHeader.tsx` header is `h-20` (80 px); `MenuSectionNav.tsx` and `LocationContextBar.tsx` are both `sticky top-16` (64 px). `LocationContextBar` is `z-30`, `MenuSectionNav` is `z-40`.
- **Problem:** By arithmetic, the menu sub-nav sits ~16 px *under* the header, and when both stick, the section nav fully covers the Food/Drinks + "Back to location" + "other location" bar. Users lose the in-menu location switch after the first scroll.
- **Fix:** Expose header height as a CSS variable (`--header-h`) and use `top-[var(--header-h)]`; make `LocationContextBar` non-sticky (it duplicates the header switcher) or stack the two with the second at `top-[calc(var(--header-h)+44px)]`. Also add `scroll-mt-*` to menu section anchors (MOB-7).

#### UI-5 · About page "marquee" is dead CSS — Medium · Small
- **Where:** `about/page.tsx` (`<div className="flex animate-marquee …">` rendering `[...partners, ...partners]`).
- **Problem:** `animate-marquee` isn't defined in `globals.css` and Tailwind v4 has no such utility (verified: 0 matches in the live CSS). The partner list renders static and duplicated (each name appears twice), clipped by `overflow-hidden`. Logo files exist in `public/partners/` but aren't used.
- **Fix:** Render the six partners once as a wrapped list (or a logo grid using the existing PNGs for the four that have them), remove the duplicate array.

#### UI-6 · Seasonal banner can render twice; two `banner` landmarks — Low · Small
- **Where:** `layout.tsx` renders `<GlobalBanner>` from `activeTheme.bannerMessage`, and `GlobalHeader.tsx` renders the same `bannerMessage` again inside the header. `GlobalBanner.tsx` also sets `role="banner"` on top of the `<header>`.
- **Problem:** When a seasonal theme has a banner message, it appears twice; assistive tech sees two banner landmarks. Currently inactive (`activeTheme: null`, verified live), so this will only surface when someone activates a theme. `oktoberfest.png` and `stPatricks.png` exist but the logo map (`GlobalHeader.tsx` `SEASONAL_LOGOS`) doesn't include them.
- **Fix:** Render the banner in exactly one place, drop `role="banner"` (use `role="region" aria-label="Announcement"`), map the two missing logos.

#### UI-7 · "You're up late" strip is decided at cache time, not visit time — Low · Small
- **Where:** `layout.tsx` (`isLateNight()` evaluated in a server component with `revalidate = 3600`), `page.tsx` hero.
- **Problem:** The value is frozen into the prerendered page, so the fixed strip can show at 2 PM or not at 2 AM. It also permanently occupies the footer space (`pb-32` hack in `GlobalFooter.tsx`).
- **Fix:** Move to a small client component (or remove; it competes with chat button + sticky order bar on mobile).

---

### 3.2 UX / Conversion

#### UX-1 · Header "Order Online" is a no-op on every page — **Critical** · Small
- **Where:** `GlobalHeader.tsx` ~L81–82 (`pathname.startsWith("/the-falls") ? "#order-falls" : "#order-appleton"`), used by the desktop CTA (~L232) and mobile drawer CTA (~L449). No element with those IDs exists anywhere (`rg` finds none; verified live: two `href="#order-appleton"` and no matching `id`).
- **Problem:** The most prominent conversion button, on every page, doesn't navigate. On `/`, `/events`, `/about`, `/contact` it's hard-coded to Appleton — a Menomonee Falls customer has no way to know that's the wrong store (and can't reach Falls ordering from the header at all unless already on a Falls path).
- **Fix:**
  - On `/appleton*` and `/the-falls*` pages: link straight to that location's Toast URL (`LOCATION_STATIC_DATA[...]. orderOnlineUrl`), `target="_blank" rel="noopener noreferrer"`.
  - On neutral pages: make it a two-option control ("Order Online ▾" → Appleton / Menomonee Falls), or remember the last-chosen location (UX-2) and label it: "Order — Appleton".
  - Consistency: Toast links open a new tab on home/location pages but the *same* tab on menu pages (`FoodMenuClient`, `DrinksMenuClient`, `StickyOrderBar`) and the home "Order Now" card. Pick one behavior (new tab keeps your menu open).

#### UX-2 · Location switcher and location-aware nav are broken — **Critical** · Medium
- **Where:** `GlobalHeader.tsx` — `LOCATION_SLUG_MAP`, `getOppositeLocationPath()`, `getCurrentLocationLabel()`, `navLinks`, `getPageType()`.
- **Root causes (three):**
  1. **Neutral pages:** `getOppositeLocationPath()` falls through to `return "/"`, while `getCurrentLocationLabel()` defaults to `"Appleton"`. So on `/` (and `/events`, `/about`, `/contact`, `/apply`, `/faq`) the header shows an "Appleton" pill and "Switch to The Falls →" pointing at `/`. This is the bug you saw. The "Food / Drinks / Visit" nav links also silently default to Appleton on those pages.
  2. **Trailing-slash mismatch:** the map keys are `"/appleton/"`, `"/appleton-food-menu/"` etc., but production serves paths **without** trailing slashes (verified: `/appleton/` → 308 → `/appleton`), so `usePathname()` never equals a key. On `/appleton-food-menu`, the map misses and the `startsWith` fallback sends the user to `/the-falls/` (the *location home*), not `/the-falls-food-menu`. Same cause: mobile drawer active state (`pathname === link.href` never true) and the "location" easter-egg message (`pathname === "/appleton/"`). (`LocationContextBar.tsx` alone handles both forms.)
  3. **No persistence:** the choice isn't stored, so navigating to Events resets context.
- **Fix:** Normalize once (`const p = pathname.replace(/\/$/, "") || "/"`), drive nav from a small `LOCATIONS` config (slug → `{label, home, food, drinks, order}`), keep the chosen location in a cookie (set on visiting a location page or on choosing from the switcher), and on neutral pages show a neutral pair of links ("Appleton | Menomonee Falls") instead of a fake current location. Combine with SEO-1 (`trailingSlash: true` fixes the key mismatch with no other code change, but then verify links again).

#### UX-3 · Home page: ordering/location clarity gaps — High · Small
- **Where:** `page.tsx` — "Next steps" `NextStepCard` "Order Online / Order Now" (`href={appletonOrderUrl}`), hero cards, "Find Us" cards.
- **Problem:** "Order Now" silently goes to Appleton with no location label (wrong-store orders for Falls customers). "Order Online" appears in the header, both hero cards, both Find-Us cards and the Next Steps card — five places, three different behaviors — while **directions** and **hours** aren't in the hero cards at all (hours only appear after the hydration-delayed badge).
- **Fix:** Replace the Next Steps order card with two location-labelled buttons or remove it. In the hero cards show: open/closed + today's hours, `Order`, `Directions`, `Menu`. Drop the duplicated Find-Us section or make it the only place with full hours.

#### UX-4 · Mobile has no persistent path to Order / Directions / Hours — High · Medium
- **Where:** `GlobalHeader.tsx` (mobile header = logo + location pill + hamburger; Order is inside the drawer), `StickyOrderBar.tsx` (only on the 4 menu pages), location pages (Directions button sits below the Hours table, ~1–2 screens down on a phone).
- **Problem:** For "near me / open now" traffic the critical answers are ≥2 taps or scrolls away. Approximate cost from the code: Order = 1 scroll (home hero) or 2 taps (drawer, currently dead); Hours = 2–3 scrolls; Directions = 2–3 scrolls; Phone = n/a. *(Estimate — needs device testing.)*
- **Fix:** On `/`, `/appleton`, `/the-falls` add a bottom action bar (safe-area aware): **Order · Directions · Hours/Open now**, using the location context on location pages and a two-location chooser on `/`. Reuse `StickyOrderBar`'s pattern; keep the chat bubble from stacking on it.

#### UX-5 · Newsletter signup fakes success and stores nothing — **Critical** · Medium
- **Where:** `GlobalFooter.tsx` ~L38–46 (`handleEmailSubmit`: `// TODO: wire to Mailchimp API` then `setEmailSubmitted(true)`), `mailchimpListId` in `queries.ts`/`types` (unused).
- **Problem:** Every visitor who subscribes sees "You're on the list. See you soon." and is never added. It's on every page (footer). No consent copy, no privacy link, no error state, no per-location list choice.
- **Fix:** Wire it (Mailchimp/Resend Audiences/whatever the owner uses) through a server action with validation + honeypot + rate limit; add an error state and "By subscribing you agree…" + privacy link. Until wired, hide the form (or link to the Linktree signup) rather than lie. Track signups per placement (DEP-4).

#### UX-6 · Contact form reports success when nothing was sent — **Critical (needs verification)** · Small
- **Where:** `contact/actions.ts` (`not_configured` path only `console.log`s the message), `ContactForm.tsx` (treats `not_configured` like success: "Thanks — your message was captured"). `.env.example` lists `RESEND_API_KEY` but **not** the three recipient variables (`CONTACT_APPLETON_EMAIL`, `CONTACT_FALLS_EMAIL`, `CONTACT_MEDIA_EMAIL`).
- **Problem:** If any of those env vars are missing in Vercel, every private-event/large-group inquiry (a revenue lead) is lost while the user sees success. I can't see Vercel env — **verify in the dashboard now** and submit a test per location/subject.
- **Fix:** Return an error state when unconfigured (in production), add the missing vars to `.env.example`, send a copy to a fallback address, and add `aria-live` to the error/success region.

#### UX-7 · Events page publishes fake demo events; CMS query drops fields — **Critical** · Small
- **Where:** `lib/sanity/queries.ts` `upcomingEventsQuery` (fetches `title,date,time,location,description,isRecurring,recurrenceNote,requiresTicket,ticketUrl` — **no `category`, `externalUrl`, `artistLinks`**); `components/events/EventsClient.tsx`; `data/events-seed.ts`; `scripts/seed-all.mjs`.
- **Problem 1 (verified live):** the live `/events` page renders no category chips, no category badges, and can't show the "Upcoming closures" notice, because CMS events arrive without `category`. `liveMusicTodayQuery` (the "Live Music Today" badge) depends on category too. "More info" and artist links can never render for CMS events.
- **Problem 2 (owner confirmed: all events are fake demo data):** `seed-all.mjs` pushed the whole demo list (named performers, tap releases, festival appearances, movie nights, trivia, etc. — including external ticket/Spotify links and specific beer names that read as fact) into the production Sanity dataset with no placeholder flag (the Sanity `event` schema has no such field). The live page (verified) lists Oct 3 (Oktoberfest Party), Oct 11 (Live Music: Mike Patterson) and Oct 25 (Halloween Pre-Party) as normal events, emits **Event JSON-LD** for them, and offers "Add to calendar" downloads. Real customers may show up for events that don't exist, and named musicians are being attributed to the business. This also conflicts with the project rule against inventing business content. Note `events-seed.ts` labels some entries `isPlaceholder: false` ("confirmed real") — per the owner those are fake too, so the flag is misleading.
- **Related claims to re-check:** copy that may have been derived from the demo calendar — "live music most Sundays" (`appleton/page.tsx`), "Live music is mostly on Sundays at Appleton" (`ChatBot.tsx`), "Live music is primarily at the Appleton location" (FAQ in Sanity), and the home/quick-link teasers ("Live music, tap releases, and community nights").
- **Fix:** (1) Delete every `event` document created by `scripts/seed-all.mjs` in Sanity (they have `_id`s prefixed `event-`, e.g. `event-jun-14`, `event-jul-16-paperfest`, `event-sep-12-tap` in `scripts/seed-all.mjs`), then retire `data/events-seed.ts` and the seed fallback in `events/page.tsx` (a fake fallback list should never render in production). (2) Design a real empty state: "No events posted yet — follow Instagram/Facebook" with links, and keep `jsonLd` empty when there are no events (it already is). (3) Add the missing fields to the GROQ projection so real events work. (4) Remove `seed-all.mjs`'s event section so a re-run can't republish them. (5) Owner confirms which live-music claims are true.

#### UX-8 · Location pages lack the info people need to decide to come — High · Medium
See **LOC-3** (map, parking, accessibility, dog/kid policy, private events per location are in the FAQ/chatbot but not on the pages).

#### UX-9 · Trust signals absent — Medium · Small (once content exists)
- **Where:** whole site.
- **Problem:** No review count/rating, no press, awards, or community logos, no Google/Untappd review links, no photos of the real space. Per the project rule I did not invent any; this is a content gap for the owner to fill.
- **Fix:** Add a "Reviews" link per location once the Google review short-link exists; surface the Untappd brewery page/rating if the owner wants it; add any real awards/press to `/about`.

#### UX-10 · Menus: good format, but identical pages and code-only editing — Medium · Small
- **Where:** `the-falls-food-menu/page.tsx` passes `APPLETON_FOOD_MENU` to `FoodMenuClient` (same items/prices, "Vol. 28" hard-coded); `data/menu-*.ts`.
- **Status:** Owner confirmed the two food menus are identical, so sharing one dataset is correct (rename the constant to something neutral like `FOOD_MENU`). The drinks menus are separate files/pages per location (`data/menu-appleton.ts`, `menu-the-falls.ts`) — I haven't confirmed with the owner whether those differ.
- **Problem:** Two indexable pages with identical body content compete with each other and read as duplicates. Menus are code, so an edit means a deploy (DEP-6); Sanity has a `menuItem` schema and query that nothing uses.
- **Fix:** Keep both URLs (each targets its own city) but give each a location-specific intro (H1 "Menomonee Falls Pizza Menu", one paragraph about that location, that location's Order/Directions/hours) and state "Same food menu at both locations." Don't canonical one to the other. Move menu data to Sanity or a single JSON the owner can edit.

#### UX-11 · `/apply`: 2200 px iframe of a Google Form — Low · Small
- **Where:** `apply/page.tsx` (`height="2200"`, `minHeight: 2200px`).
- **Problem:** On phones this is a scroll-inside-scroll trap with tiny inputs and no page chrome; the "Open it directly" link is at the very bottom. No `loading="lazy"`.
- **Fix:** Put a prominent "Open application" button above the fold (opens the standalone form), keep the iframe below with `loading="lazy"`. See LOC-7 for JobPosting.

#### UX-12 · Orphaned pages — Medium · Small
- **Where:** `/faq` and `/photos` are not in the header, footer, or sitemap (only reachable via chatbot/"View all →" when >8 photos); `/privacy-policy` is linked nowhere (verified via `rg`).
- **Fix:** Footer links to FAQ and Privacy; add both to the sitemap (FAQ) — Photos only once it has content.

---

### 3.3 Accessibility

#### A11Y-1 · Mobile drawer: hidden-but-focusable, no focus management — High · Small
- **Where:** `GlobalHeader.tsx` `MobileMenu` (~L373–381): the closed drawer is only `translate-x-full` + `aria-hidden={!open}`.
- **Problem:** Links/buttons in the closed drawer remain in the tab order (keyboard users tab into invisible controls; `aria-hidden` on focusable content is a WCAG failure). No `role="dialog"`/`aria-modal`, no focus move on open, no focus return, no Escape to close, no focus trap.
- **Fix:** Use `inert={!open}` (React 19 supports it), `role="dialog" aria-modal="true" aria-label="Menu"`, focus the close button on open and the hamburger on close, close on Escape.

#### A11Y-2 · Contrast — see UI-2 — High · Small
Also: hero eyebrow `text-white/50` at `text-xs` (4.9:1 — borderline), `/pour` footer link at `opacity-20`, footer text at `opacity-60/70`.

#### A11Y-3 · Nested interactive: `<button><Link>` logo — Medium · Small
- **Where:** `GlobalHeader.tsx` ~L189–205 (a `<button aria-label="…home">` wrapping `<Link href="/">` wrapping `<Image alt="Hop Yard Ale Works">`).
- **Problem:** Invalid HTML (interactive inside interactive), two tab stops, duplicated announcement, and the 5-click easter egg is attached to the button.
- **Fix:** Single `<Link>`; attach the click counter to the `Link` `onClick` without `preventDefault`.

#### A11Y-4 · FAQ and other disclosure widgets — Medium · Small
- **Where:** `FaqAccordion.tsx` (answers are `{isOpen && …}`, buttons lack `aria-controls`, answer regions have no id/role); `EmployeePickCard.tsx` (`role="button"` handles `Enter` but not `Space`; flipped face hidden with CSS only); `MenuSectionNav.tsx` (no `aria-current` on the active tab).
- **Fix:** Use native `<details>/<summary>` for FAQ (also fixes GEO-1), add Space handling or use a real `<button>`, add `aria-current="true"`.

#### A11Y-5 · Landmarks, skip link, dialogs — Medium · Small
- No skip-to-content link (`rg` finds none). Two `banner` landmarks (UI-6). `ChatBot.tsx` has `role="dialog"` but no `aria-modal`, focus trap, or Escape handling; the lightbox in `TaproomPhotoGrid.tsx` sets `aria-modal` but doesn't trap or restore focus. Toasts use `role="status"` (good).

#### A11Y-6 · Touch targets below 44 px — Medium · Small
- **Where (code):** `ChatBot.tsx` close (`h-7 w-7` = 28 px) and header ✕; `GlobalBanner.tsx` dismiss (28 px); mobile drawer location pills (`py-1`, ~28 px); `FoodMenuClient.tsx` filter chips (`min-h-[32px]`), "Clear", and "Just pick one for me" text link; `EventsClient.tsx` chips (32 px) and action links (36 px); `LocationContextBar.tsx` tabs (`py-1 text-xs`); footer nav links (`text-sm` with `space-y-2` ≈ 20 px lines).
- **Fix:** 44×44 hit areas on mobile (padding, not visual size). WCAG 2.2 AA floor is 24 px; the 28–32 px ones are borderline.

#### A11Y-7 · Heading structure — Low · Small
- Home: h1 → h2 (hero card names) → h3 pillars with no h2 between → h2 "Find Us" → h3s. Footer column titles are `<h3>` on every page, including pages without an h2 before them. `/pour` has no heading (iframe only). Prefer `<h2>` for section titles and `<p>`/`<h2 class="sr-only">` for footer groups.

#### A11Y-8 · Emoji/hidden links, `/pour` — Low · Small
- `GlobalFooter.tsx` `🍺` link (`opacity-20`, `aria-label="Pour a pint"`, plain `<a href="/pour/">`) is exposed to all users but effectively invisible to sighted keyboard users at focus time. `public/tap-rush.html` has 2 ARIA attributes, no reduced-motion query, `overflow:hidden` on `html/body`. Keep it as an easter egg but: `aria-hidden`/`tabindex=-1` on the footer link (or make it visible on focus), add `prefers-reduced-motion` handling and a "Skip game" link. Contact headings' emoji should be `aria-hidden`.

#### A11Y-9 · Forms — Low · Small
- `ContactForm.tsx`: labels wrap inputs (good) but errors aren't associated (`aria-describedby`) or announced (`aria-live`); required asterisk isn't hidden from AT; success replaces the form without moving focus. Footer email: visible label ✓, no error/success `aria-live`.

---

### 3.4 Performance / Core Web Vitals

*(Static analysis + live HTML; no Lighthouse — see §6.)*

#### PERF-1 · Header logo requested at w=1920 — Medium · Small
- **Where:** `GlobalHeader.tsx` `<Image width={740} height={372} … style={{ maxHeight: "56px", maxWidth: "280px" }} priority>`; live: `src="/_next/image?url=%2Flogo.png&w=1920&q=75"`, `srcSet` 750w/1920w (verified).
- **Problem:** The logo renders about 111×56 CSS px but `next/image` is told the intrinsic width is 740 with no `sizes`, so it fetches 750/1920-wide variants. Measured WebP responses: **w=1920 → 37.7 KB, w=750 → 31.8 KB, w=384 → 14.5 KB** (a right-sized 224 px would be far smaller). Source `logo.png` is 75 KB. `mix-blend-mode: multiply` on a sticky element also forces extra compositing.
- **Fix:** `width={112} height={56}` (or `sizes="112px"`), ship a transparent SVG/PNG so `mix-blend-multiply` isn't needed, and pass `activeTheme` logos through the same treatment (seasonal PNGs are 67–86 KB each).

#### PERF-2 · Global JS is heavier than it needs to be — Medium · Medium
- **Measured (verified live):** home page loads **14 script chunks ≈ 267 KB brotli-compressed**.
- **Likely contributors (code):** `GlobalHeader.tsx` (client) imports `urlFor` from `lib/sanity/client` → `@sanity/client` + `@sanity/image-url` ship on every page; `ChatBot.tsx` (26 intents of copy) + `KonamiCode` + `TabTitleInactivity` + `WeatherNudge` load on every route; `@vercel/analytics` and `speed-insights`.
- **Fix:** Resolve the logo URL on the server and pass a string prop; lazy-load `ChatBot` after idle (`next/dynamic` inside a small client wrapper); merge the tiny easter-egg listeners into one lazy module. Re-measure with `next build` output + Lighthouse.

#### PERF-3 · Five font files preloaded on every page — Medium · Small
- **Where:** `layout.tsx` — Zilla Slab with 4 weights (400/500/600/700) + Inter; live head has 5 `rel=preload as=font` links (verified).
- **Fix:** Zilla Slab 600/700 only (headings are `font-bold`), Inter variable with `preload: true`; set `preload: false` for anything not used above the fold.

#### PERF-4 · Layout shift and hydration pop-in in the hero — Medium · Small
- **Where:** `OpenClosedBadgeLive.tsx` returns `null` on the server and only renders after `useEffect` → the hero cards (`page.tsx`) and location heroes grow when it appears; `HoursTable.tsx` highlights "today" after hydration; `WeatherNudge.tsx` calls Open-Meteo from the browser on every visit and inserts a paragraph under the hours table; `UntappdEmbed.tsx` swaps a `py-16` placeholder for third-party content of unknown height; `EventsClient.tsx` results wrapper is `min-h-screen`.
- **Fix:** Reserve badge height (`min-h-[28px]`), render an SSR-safe initial state, reserve a fixed height for the weather line or drop the client fetch; give the Untappd container a realistic `min-height`.

#### PERF-5 · Third-party embeds — Low · Small
- Untappd preloader script (lazy, good), Google Forms iframe on `/apply` (no `loading="lazy"`), Open-Meteo `fetch` on every location page, Vercel Analytics/Speed Insights. Add `loading="lazy"` to the iframe; consider dropping the weather fetch or moving it server-side with caching.

#### PERF-6 · `public/` assets aren't long-cached — Low · Small
- Verified: `logo.png` and `tap-rush.html` respond `Cache-Control: public, max-age=0, must-revalidate`. Fine for a small site, but add `headers()` for `/logos/*`, `/partners/*`, `/icons/*` if kept.

#### PERF-7 · Unused assets and dead components — Low · Small
- `public/icons/*.png` (12 files, ~150 KB), `public/partners/*` (4 PNGs), `public/logos/{oktoberfest,stPatricks,icon-color,icon-outline}.png`, `public/{file,globe,next,vercel,window}.svg`, `quotes.json.bak`, and components `game/PourGame.tsx` and `game/TapperGame.tsx` (imported nowhere). Not shipped to visitors, but they make the repo confusing and PNGs might be re-linked accidentally. Delete or use.

*LCP note:* the home hero has no image, so LCP is text (fast once fonts arrive). Adding photos (UI-1) will make LCP an image: use `priority` + `sizes` and keep hero images < ~150 KB.

---

### 3.5 Technical SEO

Indexability at a glance (verified live):

| URL | Indexable | In sitemap | Unique title | Canonical | JSON-LD |
|---|---|---|---|---|---|
| `/` | yes | yes | yes (single brand) | **none** | **none** |
| `/appleton`, `/the-falls` | yes | yes (slash form → 308) | doubled brand | **none** | yes (invalid type?) |
| 4 menu pages | yes | yes (slash form) | doubled brand | **none** | none |
| `/events` | yes | yes | doubled brand | **none** | Event |
| `/about`, `/contact`, `/apply` | yes | yes | doubled brand | **none** | none |
| `/faq`, `/photos` | yes | **no** | doubled brand | **none** | none |
| `/privacy-policy` | `noindex` | no | doubled brand | none | none |
| `/pour` | `noindex,nofollow` | no | doubled brand | none | none |
| `/tap-rush.html` | **yes (unintended)** | no | own `<title>` | none | none |
| `/studio` | `X-Robots-Tag: noindex` | no | n/a | none | none |
| 404 | `noindex`, HTTP 404 | — | — | — | — |

#### SEO-1 · No canonicals; trailing-slash strategy is inconsistent — **High** · Small–Medium
- **Where:** `next.config.ts` (no `trailingSlash`), every `<Link href="/…/">`, `sitemap.ts`, JSON-LD URLs, `redirects()` destinations, `GlobalHeader.tsx` maps.
- **Problem (verified):** production serves `/appleton` and **308-redirects `/appleton/` → `/appleton`**. Yet *all* internal links, all 10 non-home sitemap URLs, and the JSON-LD `url` fields use the trailing-slash form. Every internal click and every sitemap entry is a redirect, and there's no `<link rel="canonical">` on any page (verified on all 17 URLs) to state the preferred form.
- **Fix:** Decide once. Least code churn: `trailingSlash: true` in `next.config.ts` (everything already uses slashes; also fixes the header path maps — UX-2) — then re-run the redirect table and verify no redirect chains for legacy slugs. Add canonicals: in `layout.tsx` set `alternates: { canonical: "./" }` (works with `metadataBase`) or per-page `alternates`.

#### SEO-2 · Titles are doubled and keyword-poor — High · Small
- **Where:** `layout.tsx` sets `template: "%s | Hop Yard Ale Works"`, and every page title already ends in "— Hop Yard Ale Works" (verified: `Appleton — Hop Yard Ale Works | Hop Yard Ale Works` ×14). `/privacy-policy` and `/pour` inherit the generic site description.
- **Fix:** Drop the brand from page-level titles (the template appends it) and add city/service. Suggested (all facts already stated on your own pages):

| Page | Title | Description (≤155 chars) |
|---|---|---|
| `/` | `Craft Brewery & Wood-Fired Pizza in Appleton & Menomonee Falls, WI` (absolute) | `Hop Yard Ale Works: two Wisconsin taprooms — Appleton and Menomonee Falls — brewing craft beer and serving wood-fired pizza. See hours, menus, and order online.` |
| `/appleton` | `Appleton Brewery & Wood-Fired Pizza Taproom` | `Craft beer and wood-fired pizza at 512 W Northland Ave, Appleton, WI. Hours, menus, directions, and online ordering.` |
| `/the-falls` | `Menomonee Falls Taproom: Craft Beer & Wood-Fired Pizza` | `Craft beer and wood-fired pizza at N88W16521 Main St, Menomonee Falls, WI. Hours, menus, directions, private events, and online ordering.` |
| menus | `Appleton Pizza Menu` / `Menomonee Falls Pizza Menu` / `Appleton Beer, Wine & Drinks` / … | keep existing, add city + "wood-fired" |
| `/events` | `Events: Live Music & Tap Releases in Appleton & Menomonee Falls` | keep |
| `/apply` | `Jobs at Hop Yard Ale Works — Appleton & Menomonee Falls` | keep |

  Don't put hours in descriptions (`the-falls/page.tsx` L17 hard-codes them — a tenth hours definition).

#### SEO-3 · Open Graph / Twitter are incomplete — High · Small
- **Where:** `layout.tsx` `openGraph` (siteName/type/locale only). Verified on all pages: og:title/description present (auto-derived), **no `og:image`, no `og:url`**, `twitter:card="summary"` everywhere.
- **Problem:** Shares in iMessage/Facebook/Slack show no image; QR-code and social traffic (your event audience) look untrustworthy. There's no `opengraph-image` file (verified `/opengraph-image` → 404).
- **Fix:** Add `src/app/opengraph-image.png` (1200×630, logo + a real photo) and `twitter-image.png`; per-location `src/app/appleton/opengraph-image.*` and `src/app/the-falls/opengraph-image.*`; set `twitter: { card: "summary_large_image" }` in `layout.tsx`. Use file conventions rather than the `openGraph` object, since a page-level `openGraph` replaces (not merges) the layout's.

#### SEO-4 · Sitemap quality — Medium · Small
- **Where:** `sitemap.ts` — hard-coded base URL, `lastModified: new Date()` for every URL on every request, `changeFrequency`/`priority` (ignored by Google), 11 URLs only.
- **Problem:** Verified live: `lastmod` = now for all URLs, which trains crawlers to ignore it; `/faq` (and `/photos` once populated) missing; on the vercel.app host it lists `hopyardaleworks.com` URLs.
- **Fix:** Use `SITE_URL` (DEP-1), real `lastModified` (Sanity `_updatedAt` for events/FAQ/locations, git/build date otherwise, or omit), drop priority/changefreq, add `/faq`, and make URLs match the SEO-1 decision.

#### SEO-5 · `/tap-rush.html` is indexable; robots.ts is minimal — Medium · Small
- **Where:** `public/tap-rush.html` (364 KB; `<title>Hop Yard Ale Works — Tap Rush</title>`, no robots meta), `robots.ts`.
- **Problem:** Verified 200 with no `X-Robots-Tag` and no robots rule. It's a thin game page that can enter the index (and steal impressions from real pages); robots.ts also disallows `/api/`, which doesn't exist.
- **Fix:** Add `headers()` `X-Robots-Tag: noindex` for `/tap-rush.html` (or move the game into an app route with `robots: {index:false}`) and `Disallow: /tap-rush.html`. Don't `Disallow: /pour` — the page-level `noindex` needs to be crawlable. Make robots environment-aware (DEP-2).

#### SEO-6 · URL naming and entity naming — Medium · Medium
- **Where:** `/the-falls`, `/the-falls-*-menu`, nav label "The Falls" vs H1/schema "Menomonee Falls".
- **Problem:** Target keywords are "Menomonee Falls". The slug `/the-falls` carries no geographic keyword, and the brand alternates between "The Falls", "Menomonee Falls", and "Hop Yard Ale Works — Menomonee Falls" (schema/CMS name). Flat menu URLs (`/appleton-food-menu`) are acceptable, but structure like `/appleton/menu` would give cleaner hierarchy.
- **Fix (decision for owner):** Since the site hasn't launched on the real domain, now is the cheapest moment to choose slugs: `/menomonee-falls/`, `/menomonee-falls/food-menu/` etc. with 301s from the current `/the-falls*` (and keep the existing WordPress redirects pointing straight to final URLs). Whatever you pick, use "Menomonee Falls" in titles/H1/schema and "The Falls" only as casual nav shorthand. If you keep current URLs, add "Menomonee Falls" to every Falls H1/H2 and internal link text. **Don't rename if the old WordPress URLs already rank and the redirect map (`next.config.ts`) is the source of truth — verify against the old site's Search Console first.**

#### SEO-7 · Favicon / manifest / touch icon — Low · Small
- Verified: `/manifest.webmanifest`, `/apple-touch-icon.png` → 404; only `favicon.ico` (256×256) is served. Add `src/app/icon.png`, `apple-icon.png`, a `manifest.ts`, and `viewport.themeColor`. Improves Google favicon-in-SERP, iOS home-screen, and QR-scan saves.

#### SEO-8 · 404 handling — Low · Small
- Proper HTTP 404 + `noindex` (verified). Suggest showing both locations' menu/order links (currently Appleton-only: "Food menu", "What's pouring"), and remove the inner `min-h-screen` in `not-found.tsx` which stacks with the layout's `min-h-screen` body.

#### SEO-9 · Internal linking — Medium · Small
- Footer "Navigate" omits menus, FAQ, Privacy, Photos. Location pages don't cross-link to the other location. Menu pages link to their own location only. Add a "Both locations" strip in the footer with per-location links (Visit · Menu · Drinks · Order) — this doubles as internal linking for "pizza Appleton / craft beer Menomonee Falls".

---

### 3.6 Local SEO (high priority)

#### LOC-1 · Location schema type and missing properties — High · Small–Medium
- **Where:** `appleton/page.tsx` & `the-falls/page.tsx` `JSON_LD` (verified live).
- **Problems:**
  - `"@type": "BreweryOrWinery"` — schema.org has `Brewery` and `Winery` (both `FoodEstablishment`), and I can't find a `BreweryOrWinery` type. If that's right, Google treats it as unknown and you get no LocalBusiness understanding. **(needs verification — run the Rich Results Test / validator.schema.org)**.
  - Missing: `@id`, `image`, `telephone` (none exists — see LOC-2), `geo`, `hasMenu`/`menu`, `acceptsReservations` (About page says no reservations → `false`), `sameAs`, `potentialAction` (`OrderAction`), `parentOrganization`, `logo`. `servesCuisine: ["Craft Beer","Pizza"]` — "craft beer" isn't a cuisine. `priceRange: "$$"` is an unverified claim (confirm with owner).
  - `url` uses `https://www.hopyardaleworks.com/appleton/` while `metadataBase`/sitemap use the apex (DEP-1).
  - Hours are re-typed inside the JSON-LD (third copy on the page) instead of derived from the same data as the visible table (DEP-6).
  - **There is no Organization/WebSite JSON-LD on the home page** (verified: 0 JSON-LD blocks).
- **Fix (sketch — fill from owner-confirmed data; do not use the approximate coordinates in `WeatherNudge.tsx`, they're city centers, not the venues):**

```ts
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["Brewery", "Restaurant"],          // verify best pairing with validator
  "@id": `${SITE_URL}/appleton#location`,
  name: "Hop Yard Ale Works — Appleton",        // pick ONE naming convention, match GBP
  url: `${SITE_URL}/appleton/`,
  image: `${SITE_URL}/appleton/opengraph-image`,
  address: { /* as today */ },
  geo: { "@type": "GeoCoordinates", latitude: /* TODO from GBP */, longitude: /* TODO */ },
  openingHoursSpecification: hoursFromSingleSource("appleton"),
  hasMenu: `${SITE_URL}/appleton-food-menu/`,
  acceptsReservations: false,                    // per /about; confirm
  sameAs: [instagram, facebook, untappd, linktree, /* GBP URL */],
  potentialAction: { "@type": "OrderAction", target: { "@type": "EntryPoint", urlTemplate: toastUrl,
                     actionPlatform: ["http://schema.org/DesktopWebPlatform","http://schema.org/MobileWebPlatform"] },
                     deliveryMethod: ["http://purl.org/goodrelations/v1#DeliveryModePickUp"] },
  parentOrganization: { "@id": `${SITE_URL}/#organization` },
};
```
  Add an `Organization` (name, logo, `sameAs`, founders once confirmed) + `WebSite` block in `layout.tsx` (or the home page). Escape `<` in the stringified JSON (`.replace(/</g, "\\u003c")`) for the CMS-fed events block.

#### LOC-2 · GBP wiring, off-site NAP, and (no) phone — High · Small
- **Where:** `location-data.ts` (`phone: null`), contact page/FAQ ("We don't have phones"), no GBP link anywhere in the code.
- **Status:** Owner confirmed: no phone; a Google Business Profile exists. So omitting `telephone` from schema is correct — but the site never links to the GBP, and I still can't see the profiles themselves (GBP, Apple/Bing, Yelp, Untappd, Toast, Facebook). Also **name** variants: "Hop Yard Ale Works", "Hop Yard Ale Works — Appleton" (schema, CMS), "Hop Yard" (About), "HopYardAleWorks".
- **Fix:**
  1. Pull the exact GBP business name, primary category, and coordinates for each location (use those for schema `geo` and the name convention).
  2. **Update the GBP hours** to match the corrected hours (Appleton Sunday 11–4; Falls Sunday closed after Labor Day), and use GBP "special hours"/seasonal hours for the Falls Sunday season. Put the site URL, Toast order link, and menu link on the GBP.
  3. Add each GBP URL to `sameAs`, add a "Leave a review" link (the GBP review short-link) and a map embed/GBP link on each location page (LOC-3, LOC-8).
  4. Since there's no phone, keep the "Contact form / Instagram / Facebook" path prominent and make sure the GBP doesn't list a stale or third-party number.

#### LOC-3 · Location pages are too thin and hide their best answers — High · Medium/Large
- **Where:** `appleton/page.tsx` (~290 words in `<main>`), `the-falls/page.tsx` (~360; verified).
- **Problem:** Each page has hours, an address, a directions link, and two short "What to expect" paragraphs. There's no embedded map or GBP/review link, no parking or neighborhood info, no accessibility info, no dog/kid policy, no private-event details on Appleton — yet the FAQ (`scripts/patch-faqs.mjs` → Sanity) and chatbot (`ChatBot.tsx`) already contain answers about dogs (outside patio), kids (all-ages), parking, reservations (none; hold up to 3 tables), private events (Appleton Mon/Tue; Falls any open day with contract). That content is invisible to Google (JS-only accordion/chatbot) and to the location pages. The CMS also has `visitFAQs`, `privateEvents`, `heroImage` per location — fetched in `queries.ts` and **never rendered**.
- **Fix:** Build each location page around: H1 "Hop Yard Ale Works — {City}" → order/directions/hours block → embedded Google Map (lazy `<iframe loading="lazy">`) + "Open in Google Maps / Apple Maps" links → "Getting here & parking" → "Good to know" (kids, dogs, accessibility, no reservations/tabs — owner-confirmed from existing FAQ) → a "Wood-fired pizza in {City}" and "Craft beer in {City}" section with links to the menus → private events (render CMS `privateEvents`) → this location's next 3 events (`upcomingEventsByLocationQuery` exists, unused) → FAQ (visible HTML) + reviews link. Aim ≥ 600–800 real words per page. Owner supplies parking/accessibility/neighborhood facts.

#### LOC-4 · NAP, hours, and link constants duplicated (inconsistencies already present) — High · Medium
- Facebook URL differs: footer/home use `facebook.com/hopyardaleworks/`, `contact/page.tsx` uses `facebook.com/HopYardAleWorks`. Email addresses are hard-coded in 5 places (`hopyardaleworks@gmail.com` in home/privacy/chatbot/FAQ, `hopyardthefalls@gmail.com` in the Falls page/chatbot/FAQ). Toast URLs in 4 places (`location-data.ts`, `ChatBot.tsx`, seed scripts, Sanity). Hours: see **DEP-6**. Fix: one `src/lib/site-data.ts` (or Sanity) that exports NAP, socials, order URLs, emails, and hours; import everywhere.

#### LOC-5 · Event schema is present but weak — Medium · Small
- **Where:** `events/page.tsx` `buildJsonLd`/`to24h`.
- **Good:** emitted, placeholders filtered, organizer present. **Gaps:** every event's `url` is the generic `/events/` (no deep link/anchor per event); `location.address` has only city/state (no street/ZIP), and `location.name` comes from CMS; no `endDate`, `eventStatus`, `eventAttendanceMode`, `image`, `offers` (free/ticket), `performer`; `startDate` has no timezone offset; `to24h("July 16-19")` yields an invalid time (`time` is free text in Sanity); a `description` with `</script>` would break the block (no `<` escaping).
- **Fix:** Add `id` anchors (or `/events/[slug]` pages), full `PostalAddress` from the location data, `eventStatus: EventScheduled`, `eventAttendanceMode: OfflineEventAttendanceMode`, an `offers` block (free vs `ticketUrl`), and default `image`; make `time` a real time field + optional end time/`endDate` in the schema. Model recurring live music as a weekly series page.

#### LOC-6 · Menu schema and tap list crawlability — Medium · Medium
- Food/wine/cider/NA items are crawlable HTML (**good**, verified). No `Menu`/`MenuSection`/`MenuItem` markup and no `hasMenu` link. The **beer tap list is not in the HTML** — the Untappd embed renders client-side after scroll; the SSR shows "Scroll to load tap list" (verified). The beer-style primer (`LearnToBrewery.tsx`) is generic (Blonde Ale, Hazy IPA, …) rather than Hop Yard's actual beers.
- **Fix:** Emit `Menu` JSON-LD on menu pages from the same data that renders the cards; for beer, add a server-rendered "Flagship & current beers" list (Untappd has a public menu API/RSS-like feed — check the brewery account; or owner-maintained list in Sanity) with name, style, ABV, description. Keep the embed as an enhancement.

#### LOC-7 · JobPosting — Low · Medium
- `/apply` is a general "we hire and train everyone" page. Google's JobPosting rich result needs specific, current openings (`title`, `datePosted`, `validThrough`, `hiringOrganization`, `jobLocation`, `description`, ideally pay). Add only if there are concrete roles; otherwise skip and just improve the copy with keywords ("Appleton", "Menomonee Falls", "bartender", "pizza maker") and a `noindex`-free standalone application link.

#### LOC-8 · Reviews / GBP / native-maps links — Medium · Small
- Only `maps.app.goo.gl` short links are used (also for `hasMap`). Add: the GBP place URL, a `https://search.google.com/local/writereview?placeid=…` (or `g.page/r/…`) link per location, and explicit directions URLs (`https://www.google.com/maps/dir/?api=1&destination=…` and `https://maps.apple.com/?daddr=…`). Short links work on Android, but don't open Apple Maps on iOS.

---

### 3.7 On-Page / Content SEO

#### CONT-1 · Home page: no place or category signal in H1/title — High · Small
- **Where:** `page.tsx` (H1 "Great Beer. Great Pizza. Great Company."; subline "Two Wisconsin taprooms. One community.").
- **Fix, keeping the brand voice:** keep the H1 as is, add a keyword eyebrow above it and make the subline factual:
  - Eyebrow: `Craft brewery · Wood-fired pizza · Appleton & Menomonee Falls, WI`
  - Subline: `Two Wisconsin taprooms — brew-house beer and wood-fired pizza in Appleton and Menomonee Falls.`
  - Add a short crawlable intro paragraph under the hero cards naming both cities and what each location offers, and use the LOC-1 Organization schema. (All of this is already stated elsewhere on your site — no new claims.)

#### CONT-2 · Location pages: intent match — High · Medium
- Target queries: "brewery in Appleton", "pizza Appleton WI", "craft beer Menomonee Falls", "wood-fired pizza Menomonee Falls", "taproom near me". Today neither location page contains "brewery", "pizza Appleton", or "Menomonee Falls pizza" in an H1/H2, and the Falls meta description is used for hours. Implement per LOC-3 with H2s like "Wood-fired pizza in Appleton", "Beer brewed on-site in Appleton" (the About/Appleton copy says beer is brewed at the Appleton brewhouse — reuse it).

#### CONT-3 · Missing pages worth building (confirm each is a real offering) — Medium · Large
- **Private events / group booking** (per location, with capacity, lead-time, contact) — currently only the Falls page and FAQ; Appleton has none. **Beer pages / tap list** (see LOC-6). **FAQ** in visible HTML with per-location answers. **Press & community** (partners on About). **Event recaps / photos** (uses `/photos`). Catering and gift cards **only if offered** — ask the owner. A blog is not needed; recaps + a monthly "what's new on tap" post would cover it.

#### CONT-4 · About page is good; add entity facts — Medium · Small
- `about/page.tsx` tells the founder story (Oliver & Amy Behm) — solid. To make it citable: add opening year(s)/timeline, who brews, where the brewhouse is, and any awards **only when the owner provides them**; add `Person`/`Organization` schema; link to each location; add a two-sentence "About Hop Yard Ale Works" summary at the top that assistants can quote.

#### CONT-5 · Quote banner: hard-coded, ignores CMS, unverified attributions — Medium · Small
- **Where:** `components/ui/QuoteBanner.tsx` (hard-coded `QUOTES`), `quotes.json.bak` (repo root), Sanity `globalConfig.quotes` (fetched, unused by the banner).
- **Problem:** Your rule allows quotes only from "clearly credited third parties that are real and verifiable". The Dave Barry quote is legit; the "Plato", "Benjamin Franklin", and "Kaiser Wilhelm" beer quotes are widely repeated but commonly considered apocryphal/misattributed, and `quotes.json.bak` has more (e.g., Bogart, Bill Murray) that I haven't verified. The banner also renders a random quote from `sessionStorage` after hydration (initial SSR shows `QUOTES[0]`, so users may see a flash).
- **Owner status:** the owner doesn't know whether the attributions are real. Since they're unverified, don't ship them.
- **Fix:** Keep the Dave Barry quote (widely documented; still worth a one-line source check) and drop the Plato, Franklin and Kaiser Wilhelm lines (all three are widely reported as unsourced/misattributed — the Franklin one is commonly traced to a letter about *wine* — but I haven't checked primary sources, so treat that as "needs verification"). Either leave a single quote, rotate a short list of quotes someone has actually sourced, or replace the block with a fact-based line (e.g., "Brewed in Appleton, served at both taprooms" — already stated on your site). Drive whatever remains from the CMS or one data file, and delete `quotes.json.bak`.

---

### 3.8 AI SEO (GEO / AEO)

#### GEO-1 · What an AI/crawler can and can't read without JS — High · Small
- **Readable in raw HTML (verified):** H1s, hours tables/footer, addresses, all food/wine/cider/NA menu items, events list, About story.
- **Not readable:** **FAQ answers** (rendered only when clicked — `FaqAccordion.tsx` `{isOpen && …}`; verified: no answer text in the DOM), **the beer tap list** (Untappd JS), open/closed status, chatbot answers, the weather line. No `FAQPage` schema anywhere.
- **Fix:** Render FAQ as `<details>` (all answers in HTML) and add `FAQPage` JSON-LD (Google rarely shows FAQ rich results now, but other engines/LLMs parse it); server-render the beer list (LOC-6).

#### GEO-2 · robots.txt and AI crawlers — Medium · Small
- **Where:** `robots.ts` — a single `User-agent: *` / `Allow: /` block (verified). Everything (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot) is allowed by default.
- **Decision for owner:** For a local business that wants to be *recommended*, allowing search/answer bots is beneficial. If you want to opt out of *training* only, disallow `GPTBot`, `Google-Extended`, `CCBot`, `Applebot-Extended` while allowing `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `Googlebot`. Make the choice explicit in `robots.ts`. Also confirm Vercel Bot Protection / Firewall isn't challenging those user agents once the domain is live (**needs verification**).

#### GEO-3 · llms.txt — Low · Small
- Absent (`/llms.txt` → 404, verified). It's cheap (a route handler that emits locations, hours, menu URLs, contact, and "what to say when asked X"), generated from the same data source as the site so it can't drift. No major engine has confirmed it as a ranking input, so treat as nice-to-have, after the schema and content fixes.

#### GEO-4 · Can an AI answer these correctly today?

| Question | Verdict | Why |
|---|---|---|
| "What time does Hop Yard open in Appleton on Sunday?" | **Wrong today (answers 12–6 PM; truth per owner is 11 AM–4 PM)** | The site is consistent — consistently wrong — across home, footer, page, schema, chatbot, CMS, FAQ. Also: the "kitchen closes 1 hour before close" note is wrong for Sunday (kitchen closes at 4), and there's no explicit "Sunday" sentence. |
| "Do they serve pizza in Menomonee Falls?" | **Yes, but Sunday answers are wrong/contradictory** | Falls page and menu say wood-fired pizza. Falls Sunday hours ended Labor Day, yet most of the site (and schema) still says Sun 11–4 while the footer/FAQ say closed, so an assistant can send someone on a Sunday. The Falls menu page is titled/H1'd generically ("Food Menu") and shares the (identical) Appleton data. |
| "What beers do they brew?" | **No** | No named beers in HTML; tap list is JS-only; only a generic style primer. Best available claim: "brewed at the Appleton brewhouse" (About/FAQ — FAQ hidden). |
| "Do they take reservations or host events?" | **Partially** | Reservations: "no" appears in About prose, chatbot, and the hidden FAQ, not on location pages or schema. Events: `/events` + Event schema, but the listed events are fake demo data (UX-7), so an assistant would currently confirm events that don't exist. Private events: Falls page only; Appleton (Mon/Tue) only in FAQ/chatbot. |

#### GEO-5 · Entity clarity and `sameAs` — Medium · Small
- Home has no Organization schema; `sameAs` candidates exist only as footer links (Instagram, Facebook, Untappd, Linktree). Add them in JSON-LD (plus GBP/Toast/Yelp if they exist), use a single canonical brand string and a fixed location naming scheme (SEO-6), and put a factual brand blurb near the top of `/` and `/about` for citation.

#### GEO-6 · Citation-worthy content — Medium · Medium
- Strong start: About founders story, beer style guide, dietary/BYO logic (vegan/GF/anchovy red sauce — very quotable), private-event rules. Missing: flagship beers with descriptions/ABV, brewing story, awards (if any), "how ordering works" (About mentions order-at-bar, tabs with 15% gratuity — useful, but only on `/about`), and an answer-first FAQ visible in HTML. Consider a short "At a glance" block on each location page (address · hours · order · reservations · dogs · kids · parking) — that block is what assistants quote.

---

### 3.9 Security & Best Practices

#### SEC-1 · No security headers beyond HSTS — High · Small–Medium
- **Verified (`curl -I`):** only `Strict-Transport-Security`. Missing `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and clickjacking protection (`X-Frame-Options`/`frame-ancestors`). (`next.config.ts` `headers()` only adds `X-Robots-Tag` for `/studio`.)
- **Fix:** Add a `headers()` block: `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `frame-ancestors 'self'` (the `/pour` iframe is same-origin). Start CSP in report-only; allow `cdn.sanity.io`, Untappd (`embed-menu-preloader.untappdapi.com` + its frames/XHR), Google Forms (`frame-src docs.google.com`), Open-Meteo (`connect-src api.open-meteo.com`), Vercel Analytics. The embedded Studio needs a looser policy — scope by path.

#### SEC-2 · Contact form: HTML injection, no spam protection — High · Small
- **Where:** `contact/actions.ts` (~L81–89) builds `html:` with raw `${name}`, `${email}`, `${message}`; no max lengths; no honeypot/CAPTCHA/rate limit on a publicly callable server action.
- **Problem:** Anyone can submit HTML/links that render inside the staff inbox (phishing-in-your-own-mail) and burn your Resend quota. Subject line includes user-supplied `name` unsanitized (strip newlines).
- **Fix:** Send `text:` (or HTML-escape), add length caps, a hidden honeypot + time-trap, and Cloudflare Turnstile / Vercel BotID; rate-limit by IP. Verify DKIM/SPF for `noreply@hopyardaleworks.com` before launch (DEP-8).

#### SEC-3 · Sanity Studio exposure and unused webhook secret — Low · Small
- `/studio` is public (auth-gated by Sanity; `noindex` header verified). Confirm the Sanity project's CORS origins list only your domains and that dataset ACL is "public read, authenticated write". `.env.example` documents `SANITY_WEBHOOK_SECRET` "for on-demand ISR" but there is **no `/api/*` route** — the webhook isn't implemented (see DEP-6).

#### SEC-4 · Email exposure and external links — Low · Small
- Plain `mailto:` addresses in markup (`page.tsx` "Send Us a Photo" with an unencoded space in the query, `the-falls/page.tsx`, `privacy-policy/page.tsx`) are scraped by spam bots. External links carry `rel="noopener noreferrer"` (**good**). Prefer the form + a domain address after launch (you already own the domain for Resend).

#### SEC-5 · Applicant data via Google Forms (minors) — Medium · Small
- `/apply` says the business hires kitchen staff 16+, and collects applicant data in a Google Form iframe; the privacy policy doesn't mention job applications or Google. See DEP-5.

#### SEC-6 · Secrets — OK
- No keys committed (`git ls-files` shows only `.env.example`); Sanity `projectId`/`dataset` are public by design; read client uses CDN with no token. `.next/` is ignored (`git check-ignore` confirms). Nothing to fix except adding the missing env vars to `.env.example` (UX-6).

---

### 3.10 Mobile-First Review

*(Code-derived; no device/emulator test. Widths considered: 320, 375, 390, 768.)*

#### MOB-1 · Taps/scrolls to key info — High · Medium
See **UX-4**. Recommendation: sticky action bar (Order · Directions · Hours) on `/` and location pages; per-location context via cookie (UX-2).

#### MOB-2 · Form inputs trigger iOS zoom — High · Small
- **Where:** `ContactForm.tsx` `inputClass` (`text-sm` = 14 px, all inputs/selects/textarea), `GlobalFooter.tsx` email input (`text-sm`), `ChatBot.tsx` input (`text-sm`).
- **Problem:** iOS Safari zooms the page when focusing any input under 16 px, then doesn't zoom back. It affects the newsletter, contact form, and chat.
- **Fix:** `text-base` on mobile (`text-base sm:text-sm`), keep `min-h-[44px]`.

#### MOB-3 · Mobile nav behavior — Medium · Small
- Closes on route change ✓ and on link click ✓; body scroll lock via `document.body.style.overflow` ✓ (iOS Safari can still rubber-band the page behind — add `overscroll-behavior: contain` on the drawer or a position-fixed lock). Missing: Escape, focus management, `inert` (A11Y-1). Location switcher is at the top of the drawer ✓ but inherits the routing bug (UX-2), pills are ~28 px tall, and on neutral pages it shows "Appleton" as the *current* location. The drawer is `w-full` on phones so the dimming overlay is invisible/meaningless.

#### MOB-4 · Sticky/fixed chrome eats the viewport — Medium · Small
- On a 375×667 phone, menu pages can stack: header 80 px + `LocationContextBar` ~44 px + `MenuSectionNav` ~46 px ≈ **170 px (≈25% of the screen)** at the top, plus `StickyOrderBar` (~68 px) and the chat bubble (52 px) at the bottom, plus the "up late" strip at night (`z-40`) — approaching **35–40% of the viewport** in chrome. Shrink the mobile header (`h-14`), make `LocationContextBar` non-sticky, hide-on-scroll-down for the header, and lazy-hide the chat bubble on menu pages.

#### MOB-5 · `100vh` behavior — Medium · Small
- `body` `min-h-screen` (`layout.tsx`), home hero `min-h-[75vh]`, 404 `min-h-screen`, and the Events results wrapper `min-h-screen` (`EventsClient.tsx` ~L170 — added to avoid scroll clamping when filtering, but leaves a full blank screen above the footer when only a few events exist). On iOS, `vh` is the *large* viewport. Use `min-h-dvh`/`svh`, and a smaller min-height on the events wrapper.

#### MOB-6 · 320 px overflow risks — Medium · Small · *needs device verification*
- `whitespace-nowrap` toasts (`GlobalHeader` easter-egg messages up to ~55 chars, `FoodMenuClient`, `KonamiCode`) can exceed 320 px width and get clipped (they're `fixed`, so no page scroll, but text is cut). Allow wrapping (`max-w-[calc(100vw-2rem)] whitespace-normal text-center`). Untappd container is `overflow-x-hidden`, which may clip wide embed content instead of letting it wrap. Header row (logo + location pill + hamburger) fits by arithmetic, but verify the "Menomonee Falls" pill on `/the-falls-*` at 320 px (the pill shows the short label "The Falls").

#### MOB-7 · Menus on mobile — Medium · Small
- **Good:** text menus, horizontally scrollable sticky section nav that auto-scrolls the active tab into view, BYO dietary guidance.
- **Fix:** add `scroll-mt-[calc(var(--header-h)+…)]` to `#our-creations`, `#the-basics`, `#wine`, etc., because deep links like `/appleton-drinks-menu#wine` (from your redirects) will otherwise land with the heading hidden behind the sticky bars; add a "back to top"/"Order" affordance; change the placeholder "Scroll to load tap list" to something like "Loading tap list…" and give it a stable height; hours/notes in `text-xs` are too small for key information — see next item.

#### MOB-8 · Text readability for key facts — Medium · Small
- Hours are `text-xs` (12 px) muted gray in the home "Find Us" cards (`page.tsx` `hoursNote`) and 12 px at 70% opacity in the footer (`GlobalFooter.tsx`). Make hours ≥14–16 px, full contrast, and show today's hours first.

#### MOB-9 · Hover-only content — Low · Small
- `TaproomPhotoGrid.tsx` captions appear only on hover (`opacity-0 group-hover:opacity-100`), so touch users never see them. Show captions permanently (or on tap).

#### MOB-10 · Native maps / tel — Medium · Small
- Directions use `maps.app.goo.gl` (Android/Google Maps ok; iOS won't open Apple Maps). Provide Apple Maps and Google Maps links (LOC-8). No `tel:` because there is no phone (LOC-2).

#### MOB-11 · Safe-area insets — Low · Small
- `StickyOrderBar.tsx` uses `p-3` with no `env(safe-area-inset-bottom)`, and `viewport-fit=cover` isn't set. Fine in mobile Safari today (browser chrome), but matters for home-screen/PWA mode and landscape notches — cheap to add.

#### MOB-12 · Mobile performance on throttled 4G — Medium · Medium · *not measured*
- Known payload (verified live): home HTML 62 KB; ~267 KB compressed JS in 14 chunks; one CSS file; 5 preloaded font files; logo 32–38 KB; no hero image. Expect acceptable LCP (text) but risk in hydration/INP from many always-mounted client components (PERF-2) and CLS from the hero badge (PERF-4). Run Lighthouse mobile + WebPageTest (Moto G / Slow 4G) before launch.

---

### 3.11 Deployment & Measurement

#### DEP-1 · Base URL is hard-coded and inconsistent — High · Small
Every place a domain appears (none are env-driven):

| Location | Value |
|---|---|
| `src/app/layout.tsx` `metadataBase` | `https://hopyardaleworks.com` (apex) |
| `src/app/sitemap.ts` `baseUrl` | `https://hopyardaleworks.com` |
| `src/app/robots.ts` `sitemap:` | `https://hopyardaleworks.com/sitemap.xml` |
| `src/app/appleton/page.tsx` JSON-LD `url` | `https://www.hopyardaleworks.com/appleton/` (**www**) |
| `src/app/the-falls/page.tsx` JSON-LD `url` | `https://www.hopyardaleworks.com/the-falls/` (**www**) |
| `src/app/events/page.tsx` JSON-LD `url` ×2, organizer `url` | `https://www.hopyardaleworks.com/…` (**www**) |
| `src/app/contact/actions.ts` | `from: noreply@hopyardaleworks.com`, subject `[hopyardaleworks.com]` |

- **What breaks/misleads today:** on the vercel.app host, the sitemap and robots.txt advertise a *different* host (verified); JSON-LD points to `www.` while the sitemap/`metadataBase` use the apex. There are no canonicals or `og:url` tags yet (SEO-1/3) — so nothing points to vercel.app, which also means nothing tells Google which host is preferred.
- **Fix:** one module:
```ts
// src/lib/site.ts
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_ENV === "production" ? "https://hopyardaleworks.com" : `https://${process.env.VERCEL_URL}`))
  .replace(/\/$/, "");
```
  Use it in `metadataBase`, sitemap, robots, every JSON-LD `url`/`@id`, OG image URLs, and email templates. Choose apex vs `www` (DEP-3) and set `NEXT_PUBLIC_SITE_URL` accordingly.

#### DEP-2 · vercel.app URL after launch; preview indexing — High · Small
- **Today (verified):** the production alias `hop-yard-ale-works.vercel.app` returns `<meta name="robots" content="index, follow">`, no `X-Robots-Tag`, and `robots.txt` `Allow: /` — i.e., it's indexable.
- **Recommendation:** after the custom domain is attached, make `*.vercel.app` **301/308 redirect to the custom domain** (Vercel Domains → redirect the `.vercel.app` alias, or a host-matching `redirects()` rule). Redirect, don't `noindex`, so any accrued links/signals consolidate. Keep previews non-indexable: Vercel sends `X-Robots-Tag: noindex` on non-production deployments by default — **verify with `curl -I` on a preview URL** (I only tested the production alias). Belt-and-braces: in `robots.ts`, return `{ rules: { userAgent: "*", disallow: "/" } }` when `process.env.VERCEL_ENV !== "production"`.

#### DEP-3 · www / apex and trailing slash — Medium · Small
- Pick apex or `www` in Vercel Domains (whichever you choose, 308 the other), align `NEXT_PUBLIC_SITE_URL`, canonicals, sitemap, JSON-LD, and email. Trailing slash: per SEO-1. Test `/appleton`, `/appleton/`, `http://`, `www` variants → exactly **one** hop to the final URL.

#### DEP-4 · Analytics and conversion tracking — High · Medium
- **Now:** `@vercel/analytics` + `@vercel/speed-insights` only (page views, vitals) — no custom events. Nothing measures: Toast clicks per location and placement, directions taps, menu views, newsletter signups, contact submissions, apply clicks, event `.ics` downloads, chatbot use.
- **Fix:** Add a tiny `trackClick` helper (Vercel Analytics `track()` — confirm your plan supports custom events — or GA4/Plausible) and instrument: `order_click {location, placement}`, `directions_click {location}`, `newsletter_submit {placement}`, `contact_submit {subject, location}`, `apply_click`, `event_add_to_calendar`. Add UTM parameters to outbound Toast links where Toast preserves them, and to QR codes (`?utm_source=qr&utm_medium=table-tent&utm_campaign=appleton`). Set up Search Console (domain property) and link GBP insights.

#### DEP-5 · Legal / policy — Medium · Small
- **Privacy policy** (`/privacy-policy`, "Last updated May 2026") exists but is `noindex` and linked nowhere; it omits: **Google Forms** (applicant data, including 16–17-year-olds), **Open-Meteo** (the visitor's IP is sent to a third party), **Untappd embed** (third-party script/cookies — the claim "No cookie consent banner is required" should be re-checked), **Resend**, **Sanity**, and the (yet-to-exist) newsletter provider; it doesn't say how long form data is kept. Link it in the footer and beside the newsletter/contact forms.
- **Age/alcohol notice:** none on the site (age appears only on `/apply`). Add a plain line such as "Alcohol sold to guests 21+ with valid ID" — wording/ID rules confirmed by the owner — in the footer and near the ordering CTA.
- **Newsletter:** consent language now, unsubscribe + physical address in emails later (CAN-SPAM). Have counsel confirm cookie/consent needs after the Untappd embed and any analytics change.

#### DEP-6 · Content workflow and single source of truth — **High** · Large
**Hours are defined in ten places today:**

**Owner-confirmed truth:** Appleton — Mon/Tue closed; Wed–Sat 11 AM–10 PM (kitchen closes 1 hr earlier); **Sun 11 AM–4 PM (kitchen closes at 4)**. Falls — Mon closed; Tue–Thu 4–10 PM; Fri–Sat 11 AM–10 PM (kitchen closes 1 hr earlier); **Sun 11 AM–4 PM only through Labor Day (Sept 7, 2026), so closed Sundays now**.

| # | Where | Appleton Sunday (truth 11–4) | Falls Sunday (truth: closed since Labor Day) |
|---|---|---|---|
| 1 | `location-data.ts` `LOCATION_STATIC_DATA` (fallback) | 12–6 ✗ | 11–4 ✗ (stale) |
| 2 | `location-data.ts` `HOURS_DISPLAY` (contact page) | 12–6 ✗ | 11–4 ✗ (stale) |
| 3 | `GlobalFooter.tsx` (every page) | 12–6 ✗ | Closed ✓ (by accident) |
| 4 | `page.tsx` home `hoursNote` ×2 | 12–6 ✗ | 11–4 ✗ (stale) |
| 5 | `appleton/page.tsx` rows + JSON-LD | 12–6 ✗ | n/a |
| 6 | `the-falls/page.tsx` rows + JSON-LD + meta description | n/a | 11–4 ✗ (stale) |
| 7 | `ChatBot.tsx` hours intent | 12–6 ✗ | 11–4 ✗ (stale) |
| 8 | Live Sanity `location` docs (verified in RSC payload) | 12–6 ✗ | 11–4 ✗ (stale) |
| 9 | Live Sanity `faq` "What are your hours?" ← `scripts/patch-faqs.mjs` | check text | Closed ✓ (by accident) |
| 10 | `scripts/seed-all.mjs` / `seed-locations.mjs` | 12–6 ✗ | `isClosed: true` (right now, wrong in spring) — re-running the seed overwrites the live docs |

- **Every place that shows Appleton Sunday is wrong (12–6 vs 11–4).** The Falls "Sunday 11–4" is a seasonal hour that has lapsed; the site advertises it in most places while the footer/FAQ say closed. Git history (`081b1bc`) shows the 11–4 was the summer change — the closed footer text is just the older wording.
- **Kitchen-close rules to encode as data, not prose:** Appleton Wed–Sat = close − 1 hr; Appleton Sun = 4 PM (the whole day, not −1 hr); Falls = close − 1 hr. The blanket "Kitchen closes 1 hour before close" note on `appleton/page.tsx` / `the-falls/page.tsx` is wrong for Appleton Sundays.
- **Add a seasonal model** (it doesn't exist): in the Sanity `location` schema add `seasonalHours[]` with `{label, startDate, endDate, hours}`; make `lib/hours.ts` `computeOpenClosed` resolve the active season (in `America/Chicago`, fixing the `toISOString()` day bug); emit `openingHoursSpecification` with `validFrom`/`validThrough` for the seasonal block; show a note like "Sunday hours return <date>". **Ask the owner** when Falls Sunday resumes next year — I haven't assumed a date. Keep GBP special/seasonal hours in sync.
- The CMS `hours`/`sundayHours` only drive the badge; the visible tables, footer, schema, and chatbot ignore the CMS. `holidayOverrides` also only affect the badge (and the `computeOpenClosed` date logic uses `toISOString()` on a locale-shifted date, so evening visitors in Central time can get the wrong day for overrides — `lib/hours.ts`).
- **Menus:** hard-coded in `src/data/menu-*.ts` (with "Vol. 28" in `FoodMenuClient.tsx`) even though a Sanity `menuItem` schema and `menuItemsByLocationQuery` exist and go unused. **Order URLs** live in four places. **Events:** Sanity with a seed fallback (UX-7). **FAQ:** Sanity, but answers contain hard-coded hours/emails.
- **Revalidation:** ISR windows 900/1800/3600 s (+ Sanity CDN); `SANITY_WEBHOOK_SECRET` is documented but no revalidate route exists, so edits show up 15–60+ minutes later.
- **Fix:** Make Sanity `location` the single source for hours/holidays/order URL/address/phone; generate the hours tables, footer, home cards, JSON-LD, chatbot copy, FAQ tokens (`{{appleton.hours}}`), meta descriptions, and `llms.txt` from it; keep `location-data.ts` only as a typed fallback; add an `/api/revalidate` route using the webhook secret (`revalidateTag`); move menus into Sanity (or one JSON the owner edits). Add a visible "Hours last updated" for holidays.

#### DEP-7 · Social previews and QR landing — Medium · Small
- No OG image (SEO-3). For QR codes: use short, stable paths (`/appleton`, `/the-falls`, or dedicated `/qr/appleton-table` redirects with UTMs) that land on the location page with Order/Menu above the fold (they mostly do). Print QR codes only after the canonical URL/trailing-slash decision (each QR scan on a slash URL currently costs a 308 hop).

#### DEP-8 · Ops / config hygiene — Low · Small
- `.env.example` is missing `CONTACT_APPLETON_EMAIL`, `CONTACT_FALLS_EMAIL`, `CONTACT_MEDIA_EMAIL` (and any future newsletter key). `vercel.json` is only `{ "framework": "nextjs" }`. Verify Resend domain authentication for `hopyardaleworks.com`. `README.md` is still the create-next-app template — replace with a short "how to update hours/menus/events" runbook.

---

## 4. Quick wins — High priority + Small effort

| # | Change | Where | Ref |
|---|---|---|---|
| 1 | Point header/drawer "Order Online" at real Toast URLs (per-location) | `GlobalHeader.tsx` | UX-1 |
| 2 | Normalize paths in header; neutral labels on non-location pages; fix the switcher target (`trailingSlash: true` + normalize) | `GlobalHeader.tsx`, `next.config.ts` | UX-2, SEO-1 |
| 3 | Fix hours everywhere: Appleton Sun 12–6 → **11–4** (~10 places, incl. Sanity); Falls Sun → closed (until seasonal model exists); fix the kitchen-close note for Appleton Sun | `location-data.ts`, `GlobalFooter.tsx`, home/location pages + JSON-LD, `ChatBot.tsx`, Sanity `location`/`faq`, `scripts/*.mjs`, GBP | DEP-6 |
| 4 | Add canonical (`alternates.canonical` + `metadataBase`) | `layout.tsx` | SEO-1 |
| 5 | Remove doubled brand from page titles; keyword-ise titles | every `metadata.title` | SEO-2 |
| 6 | Add `opengraph-image` (+ Twitter large card) | `src/app/opengraph-image.*`, `layout.tsx` | SEO-3 |
| 7 | Single `SITE_URL` env-driven module used by metadataBase/sitemap/robots/JSON-LD | `src/lib/site.ts` + 7 files | DEP-1 |
| 8 | Fix location JSON-LD type + add `sameAs`, `hasMenu`, `acceptsReservations`, `image`, `OrderAction`; add Organization on home | location pages, `layout.tsx` | LOC-1 |
| 9 | **Delete the fake demo events from Sanity** (and the seed fallback/seed script); add an events empty state; then add `category`, `externalUrl`, `artistLinks` to `upcomingEventsQuery` | Sanity, `seed-all.mjs`, `events/page.tsx`, `queries.ts` | UX-7 |
| 10 | Render FAQ answers in HTML (`<details>`) | `FaqAccordion.tsx` | GEO-1, A11Y-4 |
| 11 | 16 px inputs on mobile (iOS zoom) | `ContactForm.tsx`, `GlobalFooter.tsx`, `ChatBot.tsx` | MOB-2 |
| 12 | Escape/strip user input in the contact email; add honeypot | `contact/actions.ts`, `ContactForm.tsx` | SEC-2 |
| 13 | Make contact form fail loudly when env vars are missing; verify Vercel env now | `actions.ts`, Vercel | UX-6 |
| 14 | Hide (or wire) the fake newsletter form | `GlobalFooter.tsx` | UX-5 |
| 15 | `noindex` for `/tap-rush.html`; add FAQ (and Privacy) to footer/sitemap | `next.config.ts`, `GlobalFooter.tsx`, `sitemap.ts` | SEO-5, UX-12 |
| 16 | `inert` + dialog semantics + Escape on mobile drawer | `GlobalHeader.tsx` | A11Y-1 |
| 17 | Darker CTA green token (white-on-green 2.29 → 5.35:1) | `globals.css` | UI-2 |
| 18 | Baseline security headers (`nosniff`, `Referrer-Policy`, `frame-ancestors`, `Permissions-Policy`) | `next.config.ts` | SEC-1 |

---

## 5. Roadmap

### This week (pre-launch blockers)
1. **Correct the hours** (Appleton Sun 11–4; Falls Sun closed; kitchen note) everywhere including Sanity and the GBP; **delete the fake events** from Sanity and retire the seed fallback; **remove unverified quotes** (keep at most Dave Barry). Remaining owner questions: when Falls Sunday hours resume next season; whether the live-music claims are true; the GBP URLs/coordinates; whether `$$` and the private-event capacities (Falls page: up to 80) are accurate.
2. Fix UX-1, UX-2, SEO-1 (trailing-slash decision), SEO-2, SEO-3, DEP-1 (site URL module), LOC-1 (schema, incl. GBP `sameAs`, no `telephone`), UX-7 (fake events + events empty state + query), UX-5/6 (newsletter + contact honesty), SEC-2, MOB-2, A11Y-1, UI-2, quick-win items 3/15/18.
3. Verify Vercel env vars, Resend domain auth, preview `X-Robots-Tag`.

### This month
- Single hours/NAP/order-URL data source (DEP-6) and menus in the CMS; revalidate webhook.
- Rebuild location pages (LOC-3, CONT-2): map, parking, accessibility, kids/dogs, private events, events, visible FAQ, reviews link.
- Photography + hero images (UI-1); trim fonts/JS/logo (PERF-1…4); sticky-offset and mobile chrome cleanup (UI-4, MOB-4/5/7/8).
- Analytics events (DEP-4); Search Console + GBP linkage; privacy/legal updates (DEP-5); AI-crawler policy (GEO-2); `llms.txt` (GEO-3).
- Server-rendered tap list/beer pages (LOC-6); Menu + FAQ + Event schema polish (LOC-5).

### Later
- URL/entity naming decision (`/menomonee-falls`) with redirects (SEO-6) — ideally *before* launch if the owner agrees.
- Private-events pages per location, event recaps, press/community, JobPosting (if real openings), gift cards/catering (if offered).
- Component clean-up: remove dead code and orphan assets (PERF-7), replace inline `style={{…}}` color tokens with Tailwind theme classes for maintainability, reduce always-mounted client components.

### Launch-day checklist (tailored)
- [ ] `NEXT_PUBLIC_SITE_URL` set; sitemap/robots/canonicals/JSON-LD/OG all show the final host (`curl` each).
- [ ] Apex/`www` and `http`/`https` variants → single 308 hop to final URL; `/appleton/` vs `/appleton` behaves per decision; legacy WordPress URLs (`next.config.ts` redirects) hit final URLs in one hop.
- [ ] `hop-yard-ale-works.vercel.app` redirects to the custom domain; a preview URL returns `X-Robots-Tag: noindex`.
- [ ] Rich Results Test / validator on both location pages, `/events`, home Organization; compare hours in schema = visible = footer = GBP.
- [ ] Header/drawer/home/menu "Order Online" open the correct Toast page per location; test on iOS Safari and Android Chrome; UTM present.
- [ ] Location switcher: from `/`, `/events`, `/appleton-food-menu`, `/the-falls-drinks-menu` — lands on the equivalent page for the other location.
- [ ] Contact form: test each subject × location delivers to the right inbox; newsletter actually stores the address; spam protection on; privacy link present.
- [ ] Share `/`, `/appleton`, `/the-falls`, `/events` in iMessage/Facebook/Slack — image + correct title appear.
- [ ] Google Business Profile (both), Apple Business Connect, Bing Places, Yelp, Untappd, Toast listing: name/address/hours/website/phone consistent with the site; website field points to the final domain (with UTM if desired).
- [ ] Submit sitemap in Search Console; request indexing for `/`, both location pages, both menus, `/events`; confirm `/tap-rush.html` and `/pour` are `noindex`.
- [ ] Analytics events firing (Toast, directions, newsletter, contact) per location; Vercel Analytics + Speed Insights on the production domain.
- [ ] Lighthouse mobile ≥ 90 on `/`, `/appleton`, one menu page; check CLS on the hero; manual pass at 320/375/390/768 px; keyboard-only pass through header, drawer, forms; VoiceOver quick check.
- [ ] QR codes regenerated with the final URLs + UTMs.
- [ ] Age/alcohol notice, privacy policy (updated), and form consent wording live.
- [ ] Holiday-hours procedure written down (who updates what, where) and tested.

---

## 6. Things I couldn't verify

- **Lighthouse / Core Web Vitals / field data** (PageSpeed Insights API returned 429; no browser). LCP/CLS/INP statements are inferences from code and live HTML; measured only payload sizes (HTML, JS ≈267 KB br, logo variants).
- **Rendering at 320/375/390/768 px, tap-target sizes as rendered, sticky-bar overlap (UI-4/MOB-4), overflow (MOB-6), the Falls hero "Menomonee Falls"/"The Falls" pill at 320 px, and how `/pour` layers under the header.** All derived from classes/CSS arithmetic.
- **Search Console** (indexing status, coverage, queries, manual actions), **Google Business Profile / Apple / Bing / Yelp / Untappd / Toast listing data** (NAP consistency, phone, categories, reviews).
- **Toast behavior:** whether the ordering pages accept UTM parameters, alcohol/age checks, delivery partners, hours shown inside Toast vs on the site.
- **Vercel dashboard:** environment variables (Resend + recipient addresses — critical for UX-6), domain/redirect settings, Bot Protection/Firewall rules affecting AI crawlers, plan-level Analytics custom events, preview-deployment `X-Robots-Tag`.
- **Sanity dataset beyond what renders:** CORS origins, ACLs, unpublished/draft content, whether any fake demo events have already been deleted, whether `phone`/`heroImage`/`visitFAQs`/`privateEvents` are populated.
- **`BreweryOrWinery` validity** — from my knowledge of schema.org it isn't a defined type; confirm in the validator.
- **Untappd embed** weight/behavior, cookie usage, and whether it exposes crawlable content in any form.
- **Quote attributions** (Plato, Franklin, Kaiser Wilhelm, and those in `quotes.json.bak`) — the owner doesn't know either; flagged as widely reported as misattributed, not proven so. Recommendation is to not ship them (CONT-5).
- **Falls Sunday season dates** (when the 11–4 Sunday hours start next year) — owner only said "through Labor Day".
- **Whether legacy WordPress URLs beyond those in the redirect map are indexed** — needs the old site's sitemap/Search Console.
- **Live behavior of the Tap Rush game** in a real browser (accessibility, performance, the header/iframe layering).
