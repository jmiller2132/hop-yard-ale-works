// Answer logic for the site chat assistant. Kept free of React so the matching
// can be exercised outside the browser.
//
// How a question is matched: the text is lowercased and split into words.
// A string keyword matches when a word in the question *starts with* it
// ("pizza" matches "pizzas", but "eat" does not match "seating"). Multi-word
// keywords score higher than single words, the highest-scoring intent wins, and
// ties go to the intent listed first. Answers that exist in the Sanity FAQ are
// read from there, so editing an FAQ in Studio also changes the chat answer.

import { chicagoNow, computeOpenClosed } from "@/lib/hours";
import {
  DAYS,
  LOCATIONS,
  LOCATION_SLUGS,
  addressLines,
  formatRange,
  hoursSummaryText,
  locationForBadge,
  type LocationInfo,
  type LocationSlug,
} from "@/lib/location-data";
import { SOCIAL_LINKS } from "@/lib/site";
import type { HolidayOverride, Location } from "@/types";

export interface ChatLink {
  label: string;
  href: string;
}

export interface ChatReply {
  text: string;
  links?: ChatLink[];
}

export interface ChatFaq {
  _id: string;
  question: string;
  answer: string;
  chatKeywords?: string[] | null;
}

export interface ChatContext {
  /** Location of the page the visitor is on (or last visited), if any. */
  location: LocationSlug | null;
  faqs: ChatFaq[];
  holidayOverrides: Partial<Record<LocationSlug, HolidayOverride[]>>;
}

export interface ChatAnswer extends ChatReply {
  /** The intent that answered: an intent id, "unposted:<topic>", or "fallback". */
  intent: string;
}

interface Query {
  /** Normalized question text, padded with a space on each side. */
  text: string;
  /** Location the question is about; null means both. */
  location: LocationSlug | null;
  ctx: ChatContext;
}

type Keyword = string | { re: RegExp; weight: number };

interface Intent {
  id: string;
  /** Sanity FAQ document whose answer (and chatKeywords) this intent uses. */
  faqId?: string;
  keywords: Keyword[];
  respond: (q: Query) => ChatReply;
  /** Only considered when nothing else matched (greetings, a bare location name). */
  lowPriority?: boolean;
}

// ─── Text matching ────────────────────────────────────────────────────────────

export function normalize(input: string): string {
  const text = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'/]+/g, " ")
    .trim();
  return ` ${text} `;
}

const re = (pattern: RegExp, weight = 1): Keyword => ({ re: pattern, weight });

function keywordWeight(text: string, keyword: Keyword): number {
  if (typeof keyword !== "string") return keyword.re.test(text) ? keyword.weight : 0;
  const needle = normalize(keyword).trimEnd();
  return needle.trim() && text.includes(needle) ? needle.trim().split(" ").length : 0;
}

function bestIntent(intents: Intent[], text: string): Intent | null {
  let best: Intent | null = null;
  let bestScore = 0;
  for (const intent of intents) {
    const score = Math.max(0, ...intent.keywords.map((k) => keywordWeight(text, k)));
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }
  return best;
}

function mentionedLocation(text: string): LocationSlug | "both" | null {
  const appleton = /\bappleton\b/.test(text);
  const falls = /\b(falls|menomonee)\b/.test(text);
  if ((appleton && falls) || /\b(both|each|either)\b/.test(text)) return "both";
  if (appleton) return "appleton";
  if (falls) return "the-falls";
  return null;
}

// ─── Reply helpers ────────────────────────────────────────────────────────────

const CONTACT_LINK: ChatLink = { label: "Contact us", href: "/contact/" };
const FAQ_LINK: ChatLink = { label: "FAQ", href: "/faq/" };
const EVENTS_LINK: ChatLink = { label: "See upcoming events", href: "/events/" };
const SOCIAL = SOCIAL_LINKS.filter((s) => s.icon === "instagram" || s.icon === "facebook");

function slugsFor(location: LocationSlug | null): LocationSlug[] {
  return location ? [location] : LOCATION_SLUGS;
}

function locationLinks(
  location: LocationSlug | null,
  page: keyof LocationInfo["paths"],
  label: string,
): ChatLink[] {
  const slugs = slugsFor(location);
  return slugs.map((slug) => ({
    label: slugs.length > 1 ? `${LOCATIONS[slug].navLabel} ${label.toLowerCase()}` : label,
    href: LOCATIONS[slug].paths[page],
  }));
}

function orderLinks(location: LocationSlug | null): ChatLink[] {
  const slugs = slugsFor(location);
  return slugs.map((slug) => ({
    label: slugs.length > 1 ? `Order — ${LOCATIONS[slug].navLabel}` : "Order online",
    href: LOCATIONS[slug].orderOnlineUrl,
  }));
}

function faqAnswer(q: Query, faqId: string): string | null {
  return q.ctx.faqs.find((f) => f._id === faqId)?.answer ?? null;
}

/** An intent answered by a Sanity FAQ document. */
function faqIntent(
  id: string,
  faqId: string,
  keywords: Keyword[],
  options: { links?: (q: Query) => ChatLink[]; fallback?: string } = {},
): Intent {
  return {
    id,
    faqId,
    keywords,
    respond: (q) => {
      const links = options.links?.(q) ?? [];
      const answer = faqAnswer(q, faqId);
      if (answer) return { text: answer, links };
      if (options.fallback) return { text: options.fallback, links };
      return { text: "The FAQ page has the answer to that one.", links: [FAQ_LINK, ...links] };
    },
  };
}

const UNPOSTED_REPLY: ChatReply = {
  text: "I don't have an answer for that one yet. Send us a message and we'll get back to you.",
  links: [CONTACT_LINK],
};

/** A topic people ask about that the site has no answer for yet. */
function unposted(topic: string, keywords: Keyword[]): Intent {
  return { id: `unposted:${topic}`, keywords, respond: () => UNPOSTED_REPLY };
}

function todayKey(now: Date): string {
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function statusLine(q: Query, slug: LocationSlug): string {
  const info = LOCATIONS[slug];
  const overrides = q.ctx.holidayOverrides[slug] ?? [];
  const status = computeOpenClosed(locationForBadge(slug, { holidayOverrides: overrides } as Location));
  const now = chicagoNow();
  if (overrides.some((o) => o.date === todayKey(now))) return `${info.shortName}: ${status.label}.`;
  const today = info.hours[DAYS[now.getDay()]];
  return today
    ? `${info.shortName}: ${status.label}.\nToday: ${formatRange(today)}. ${info.kitchenNote}`
    : `${info.shortName}: ${status.label}.`;
}

function hoursReply(q: Query): ChatReply {
  const asksNow = /\b(now|tonight|today|currently|still open|open late)\b/.test(q.text);
  const blocks = slugsFor(q.location).map((slug) =>
    asksNow
      ? statusLine(q, slug)
      : `${LOCATIONS[slug].shortName}\n${hoursSummaryText(slug, "\n")}\n${LOCATIONS[slug].kitchenNote}`,
  );
  return { text: blocks.join("\n\n"), links: locationLinks(q.location, "home", "Location details") };
}

function directionsReply(q: Query): ChatReply {
  const slugs = slugsFor(q.location);
  return {
    text: slugs
      .map((slug) => `${LOCATIONS[slug].shortName}\n${addressLines(slug).join("\n")}`)
      .join("\n\n"),
    links: slugs.map((slug) => ({
      label: slugs.length > 1 ? `Directions to ${LOCATIONS[slug].navLabel}` : "Get directions",
      href: LOCATIONS[slug].googleMapsUrl,
    })),
  };
}

function locationCardReply(q: Query): ChatReply {
  const slugs = slugsFor(q.location);
  return {
    text: slugs
      .map((slug) => `${statusLine(q, slug)}\n${addressLines(slug).join(", ")}`)
      .join("\n\n"),
    links: [
      ...locationLinks(q.location, "home", "Location details"),
      ...(slugs.length === 1 ? orderLinks(q.location) : []),
    ],
  };
}

function fallbackReply(q: Query): ChatReply {
  return {
    text: "Hmm, I'm not sure about that one. Here are a few places that might help:",
    links: [FAQ_LINK, ...locationLinks(q.location, "food", "Food menu"), { label: "Events", href: "/events/" }, CONTACT_LINK],
  };
}

// ─── Intents ──────────────────────────────────────────────────────────────────
// Order matters only for ties: more specific topics come first.

const INTENTS: Intent[] = [
  // Topics with no answer on the site yet. Add an FAQ in Sanity with chat
  // keywords and it replaces these.
  // TODO: confirm with owner — see CHATBOT_OWNER_QUESTIONS.md.
  unposted("smoking", ["smoke", "smoking", "vape", "vaping", "cigar"]),
  unposted("outside-cake", ["cake", "cupcake"]),

  faqIntent("id-policy", "faq-visit-18", ["drinking age", "minimum age", "how old", "underage", "under 21", "card me", "do you card", "carded", "identification", re(/\b21\b/), re(/\bids?\b/)]),
  faqIntent("beer-to-go", "faq-drinks-07", ["growler", "crowler", "4 pack", "four pack", "6 pack", "six pack", "cans", "cans to go", "buy cans", "beer to go", "take home"]),
  faqIntent("gift-cards", "faq-general-01", ["gift card", "gift certificate", "giftcard"]),
  faqIntent("accessibility", "faq-visit-11", ["wheelchair", "accessib", "handicap", "ramp", "elevator", "stairs", re(/\bada\b/)]),
  faqIntent("high-chairs", "faq-visit-12", ["high chair", "highchair", "booster", "changing table", "changing station"]),
  faqIntent("tvs", "faq-visit-13", ["watch the game", "big screen", "the game", "packers", "badgers", "bucks game", "brewers game", "football game", "television", re(/\btvs?\b/)]),
  faqIntent("wifi", "faq-visit-14", ["wifi", "wi fi", "internet"]),
  faqIntent("games", "faq-visit-15", ["board game", "cornhole", "darts", "pool table", "arcade", "games", "card game", "deck of cards"]),
  faqIntent("spirits", "faq-drinks-08", ["cocktail", "liquor", "spirit", "mixed drink", "whiskey", "whisky", "vodka", "bourbon", "tequila", "old fashioned", "bloody mary", "margarita", "rtd", "ready to drink"], {
    links: (q) => locationLinks(q.location, "drinks", "Drinks menu"),
  }),
  faqIntent("specials", "faq-general-02", ["happy hour", "daily special", "drink special", "discount", "deal", "promo", re(/\bspecials\b/)]),
  faqIntent("payment-methods", "faq-visit-09", ["cash", "apple pay", "google pay", "samsung pay", "tap to pay", "with my phone", "venmo", "contactless", "forms of payment", "payment method"]),
  faqIntent("split-checks", "faq-visit-10", ["split", "separate check", "separate tab", "multiple cards"]),
  faqIntent("catering", "faq-general-03", ["cater"]),
  faqIntent("donations", "faq-contact-05", ["donat", "fundrais", "sponsor", "charity", "raffle", "silent auction", "nonprofit", "non profit"], {
    links: () => [CONTACT_LINK],
  }),
  faqIntent("lost-and-found", "faq-contact-04", ["lost and found", "lost my", "left my", "forgot my", "i lost", "i left", "left behind"], {
    links: () => [CONTACT_LINK],
  }),
  faqIntent("band-booking", "faq-events-04", ["my band", "our band", "play a show", "play there", "play at", "perform", "gig"], {
    links: () => [CONTACT_LINK],
  }),
  faqIntent("tours", "faq-drinks-09", ["tour"]),
  faqIntent("kids-menu", "faq-food-08", ["kids menu", "kid menu", "kid's menu", "kids' menu", "menu for kids", "childrens menu", "children's menu", "kids meal", "kid size"], {
    links: (q) => locationLinks(q.location, "food", "Food menu"),
  }),
  faqIntent("atmosphere", "faq-visit-16", ["loud", "noisy", "quiet", "busy", "crowded"]),

  faqIntent("holidays", "faq-hours-02", ["holiday", "thanksgiving", "christmas", "xmas", "new year", "easter", "fourth of july", "4th of july", "july 4", "memorial day", "labor day"], {
    links: () => [EVENTS_LINK],
  }),
  faqIntent("order-at-bar", "faq-visit-05", ["order at the bar", "order at the counter", "at the bar", "where do i order", "table service", "counter service", "server", "waiter", "waitress"]),
  faqIntent("outside-food", "faq-visit-08", ["outside food", "outside drink", "outside beverage", "bring food", "bring in food", "bring my own", "bring our own", "bring snacks", "own food", "own drinks", "byob"]),
  faqIntent("cover", "faq-visit-02", ["cover", "entry fee", "admission", "to get in", re(/\bfees?\b/)]),
  faqIntent("scratch", "faq-food-02", ["scratch", "homemade", "home made", "house made", "made in house", "made fresh", "fresh dough", "own dough", "make dough", "make your dough", "make the dough", "dough made"]),
  faqIntent("local", "faq-food-06", ["local", "sourced", "ingredient", "farm"]),
  {
    id: "gf-drinks",
    keywords: ["gluten free beer", "gluten free drink", "gluten free beverage", "gluten free cider", "gluten free seltzer", "gf beer", "gluten reduced"],
    respond: (q) => ({
      text: "Yes — the Drinks menu marks gluten-free options with a GF tag, including a gluten-free beer and seltzer.",
      links: locationLinks(q.location, "drinks", "Drinks menu"),
    }),
  },
  faqIntent("dietary", "faq-food-03", ["gluten", "celiac", "coeliac", "vegan", "dairy", "lactose", "cauliflower", "plant based", re(/\bgf\b/)], {
    links: (q) => locationLinks(q.location, "food", "Food menu"),
  }),
  faqIntent("allergies", "faq-food-07", ["allerg", "peanut", "shellfish", "sesame", re(/\b(nuts?|eggs?|soy|fish)\b/)]),
  {
    id: "menu-filters",
    keywords: ["vegetarian", "veggie", "meatless", "no meat"],
    respond: (q) => ({
      text: "The Food menu has filters for vegetarian, vegan, and gluten-free options.",
      links: locationLinks(q.location, "food", "Food menu"),
    }),
  },
  faqIntent("taps-same", "faq-drinks-06", ["same tap", "same beer", "tap list the same", "taps the same", "beers the same", "different beer", "different tap"], {
    links: (q) => locationLinks(q.location, "drinks", "Tap list"),
  }),
  faqIntent("brewed", "faq-drinks-02", ["brewed", "beer brewed", "brew on site", "brew here", "brew your own", "brew it", "brewhouse", "who brews", "make your own beer", "make the beer", "make beer", "brew the beer"]),
  faqIntent("flights", "faq-drinks-05", ["flight", "sampler", "taster", "sample"]),
  {
    id: "newsletter",
    keywords: ["newsletter", "email list", "mailing list", "sign up", "signup", "subscribe"],
    respond: () => ({
      text: "There's no email signup right now. Follow us on Instagram or Facebook for events and new taps.",
      links: SOCIAL,
    }),
  },
  {
    id: "social",
    keywords: ["insta", "facebook", "social media", "socials", "tiktok", "twitter", "linktree"],
    respond: () => ({ text: "Follow us for events and new taps.", links: SOCIAL }),
  },
  {
    id: "feedback",
    keywords: ["feedback", "review", "complain", "complaint", "bad experience", "manager", "suggestion", "compliment"],
    respond: () => ({ text: "The best way to share feedback is the contact form.", links: [CONTACT_LINK] }),
  },
  {
    id: "jobs",
    keywords: ["job", "hiring", "apply", "application", "employment", "career", "work there", "work for", "work at", "position", re(/\bhire\b/)],
    respond: () => ({ text: "You can apply on our Jobs page.", links: [{ label: "Jobs", href: "/apply/" }] }),
  },
  faqIntent("loyalty-merch", "faq-contact-03", ["loyalty", "reward", "punch card", "merch", "shirt", "t shirt", "hoodie", "sticker", "glassware", "mug", re(/\bhats?\b/)], {
    links: () => SOCIAL,
  }),
  faqIntent("private-events", "faq-events-03", [
    "private", "party room", "birthday party", "wedding", "rehearsal", "shower", "reception", "corporate",
    "company party", "office party", "work party", "group event", "large group", "big group", "buyout", "buy out",
    "host a", "host an", "host my", "host our",
    re(/\brent(al|als|ing)?\b/),
    re(/\b(table|party|group) (for|of) \d{2,}\b/, 3),
    re(/\b\d{2,} (people|guests|persons)\b/, 3),
  ], { links: () => [CONTACT_LINK] }),
  faqIntent("parking", "faq-visit-07", ["park"], {
    links: (q) => directionsReply(q).links ?? [],
  }),
  {
    id: "hours",
    keywords: ["hour", "open", "schedule", "kitchen", re(/\bclos(e|es|ed|ing)\b/)],
    respond: hoursReply,
  },
  {
    id: "directions",
    keywords: [
      "address", "direction", "located", "map", "get there", "get to you", "how far", "near", "find you", "find us",
      "northland", "main st", "main street",
      re(/\bwhere (are|is|'s) (you|it|hop yard|the (falls|appleton|brewery|taproom)|appleton|menomonee)\b/, 2),
      re(/\bwhere's (hop yard|the (falls|appleton)|appleton)\b/, 2),
    ],
    respond: directionsReply,
  },
  faqIntent("order", "faq-food-05", [
    "order", "online order", "pickup", "pick up", "takeout", "take out", "to go", "carry out", "carryout", "toast",
    "deliver", "doordash", "door dash", "uber eats", "grubhub",
  ], {
    links: (q) => orderLinks(q.location),
    fallback: "You can order online for pickup or delivery through Toast.",
  }),
  faqIntent("food", "faq-food-01", [
    "pizza", "food", "hungry", "menu", "appetizer", "snack", "dessert", "topping", "byo", "build your own", "cookie",
    "salad", "wing", "spicy", "calzone", "sandwich", "lunch", "dinner", "ranch", "crust", "dough", "slice",
    "what's good", "popular", "favorite", "recommend",
    "same menu", "menu the same", "menus the same", "different menu", "menus different", "menu different",
    re(/\beats?\b/),
  ], {
    links: (q) => locationLinks(q.location, "food", "Food menu"),
    fallback: "We do wood-fired pizza — specialty pies, a build your own option, and a dessert pizza.",
  }),
  faqIntent("beer", "faq-drinks-01", [
    "beer", "tap", "brew", "ipa", "lager", "hazy", "craft", "draft", "draught", "pint", "stout", "porter", "pale",
    "sour", "saison", "pilsner", "pils", "untappd", "drink menu", "drinks menu", "beer menu", "abv",
    re(/\bales?\b/),
  ], { links: (q) => locationLinks(q.location, "drinks", "Tap list") }),
  faqIntent("wine", "faq-drinks-03", ["wine", "rose", "prosecco", "moscato", "riesling", "chardonnay", "pinot", "sauvignon", "cabernet", "merlot", "zinfandel", "bubbl", "sparkling", "by the bottle"], {
    links: (q) => locationLinks(q.location, "drinks", "Drinks menu"),
  }),
  {
    id: "cider-seltzer",
    keywords: ["cider", "seltzer", "hard seltzer", "white claw", "truly"],
    respond: (q) => ({
      text: "We carry hard ciders and seltzers. The Drinks menu lists what's available.",
      links: locationLinks(q.location, "drinks", "Drinks menu"),
    }),
  },
  faqIntent("non-alcoholic", "faq-drinks-04", [
    "non alcoholic", "nonalcoholic", "na beer", "no alcohol", "alcohol free", "athletic", "mocktail", "soda", "water",
    "sparkling water", "sober", "zero proof", "don't drink", "dont drink", "not drinking", "buzzkill", "liquid death", "kombucha", "root beer",
    re(/\bn\/?a\b/), re(/\bpop\b/),
  ], { links: (q) => locationLinks(q.location, "drinks", "Drinks menu") }),
  faqIntent("live-music", "faq-events-02", ["live music", "music", "band", "concert", "musician", "who's playing", re(/\bdj\b/)], {
    links: () => [EVENTS_LINK],
  }),
  faqIntent("events", "faq-events-01", ["event", "trivia", "oktoberfest", "halloween", "movie", "calendar", "happening", "going on", "this weekend", "tap release", "upcoming", "open mic", "paperfest"], {
    links: () => [EVENTS_LINK],
  }),
  faqIntent("reservations", "faq-visit-01", ["reservation", "reserve", "book a table", "booking", "walk in", "wait", "hold a table", "hold table", "save a table", "save seats", "seat", "table"]),
  faqIntent("dogs", "faq-visit-04", ["dog", "pet", "pup", "leash", "service animal"]),
  faqIntent("patio", "faq-visit-17", [
    "patio", "outdoor", "outside", "sit outside", "outdoor seating",
    re(/\b(patio|outdoor|outside)\b.*\b(heat|heated|heaters?|covered|enclosed)\b|\b(heat|heated|heaters?|covered|enclosed)\b.*\b(patio|outdoor|outside)\b/, 2),
  ]),
  faqIntent("kids", "faq-visit-03", ["kid", "child", "family", "families", "baby", "babies", "toddler", "stroller", "all ages", "minor"]),
  faqIntent("tab", "faq-visit-06", ["open a tab", "credit card", "debit", "card", "pay", "payment", "tip", "gratuity", re(/\btabs?\b/)]),
  faqIntent("contact", "faq-contact-01", ["phone", "call", "contact", "email", "e mail", "reach", "get in touch", "message", "text you"], {
    links: () => [CONTACT_LINK],
  }),
  faqIntent("about", "faq-contact-02", ["owner", "who owns", "oliver", "amy", "behm", "your story", "history", "founded", "who started", "what is hop yard", "tell me about hop yard", "about hop yard", "about you", "about us"], {
    links: () => [{ label: "About us", href: "/about/" }],
  }),

  {
    id: "location",
    keywords: [re(/\b(appleton|falls|menomonee)\b/)],
    respond: locationCardReply,
    lowPriority: true,
  },
  {
    id: "greeting",
    keywords: [re(/\b(hi|hello|hey|howdy|yo|sup)\b/)],
    respond: () => ({ text: "Hey! Ask me about hours, food, beer, events, or getting here." }),
    lowPriority: true,
  },
  {
    id: "thanks",
    keywords: [re(/\b(thanks|thank you|thx|ty|cheers|appreciate it)\b/)],
    respond: () => ({ text: "Anytime! Anything else I can help with?" }),
    lowPriority: true,
  },
];

/** Built-in intents plus FAQs that were given chat keywords in Sanity. */
function intentsFor(faqs: ChatFaq[]): Intent[] {
  const extraKeywords = new Map(faqs.map((f) => [f._id, f.chatKeywords?.filter(Boolean) ?? []]));
  const builtIn = INTENTS.map((intent) => {
    const extra = intent.faqId ? extraKeywords.get(intent.faqId) : undefined;
    return extra?.length ? { ...intent, keywords: [...intent.keywords, ...extra] } : intent;
  });
  const used = new Set(INTENTS.map((i) => i.faqId));
  // Owner-written answers come first so they win ties with the placeholders above.
  const custom: Intent[] = faqs
    .filter((f) => !used.has(f._id) && f.chatKeywords?.some(Boolean))
    .map((f) => ({
      id: `faq:${f._id}`,
      keywords: f.chatKeywords!.filter(Boolean),
      respond: () => ({ text: f.answer }),
    }));
  return [...custom, ...builtIn];
}

export function answer(input: string, ctx: ChatContext): ChatAnswer {
  const text = normalize(input);
  const mentioned = mentionedLocation(text);
  const q: Query = { text, ctx, location: mentioned === "both" ? null : (mentioned ?? ctx.location) };
  const intents = intentsFor(ctx.faqs);
  const match =
    bestIntent(intents.filter((i) => !i.lowPriority), text) ??
    bestIntent(intents.filter((i) => i.lowPriority), text);
  return match ? { intent: match.id, ...match.respond(q) } : { intent: "fallback", ...fallbackReply(q) };
}

/** Strip email addresses and phone-like numbers before a question is logged. */
export function redactForLogging(input: string): string {
  return input
    .replace(/\S+@\S+\.\S+/g, "[email]")
    .replace(/\+?\d[\d\s().-]{6,}\d/g, "[number]")
    .slice(0, 200);
}
