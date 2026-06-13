"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  links?: { label: string; href: string }[];
}

// ─── Intent definitions ───────────────────────────────────────────────────────

interface Intent {
  keywords: string[];
  response: { text: string; links?: { label: string; href: string }[] };
}

const INTENTS: Intent[] = [
  {
    keywords: ["hour", "open", "close", "when", "today", "schedule", "time", "kitchen", "close at", "open at"],
    response: {
      text: "Here are the hours for both locations. The kitchen closes one hour before closing time.\n\n🍺 Appleton\nWed–Sat: 11 AM–10 PM\nSun: 12–6 PM\nMon–Tue: Closed\n\n🍕 Menomonee Falls\nTue–Thu: 4–10 PM\nFri–Sat: 11 AM–10 PM\nSun–Mon: Closed",
      links: [
        { label: "Appleton details", href: "/appleton/" },
        { label: "The Falls details", href: "/the-falls/" },
      ],
    },
  },
  {
    keywords: ["pizza", "food", "eat", "hungry", "menu", "appetizer", "dessert", "topping", "byo", "build your own", "cookie"],
    response: {
      text: "We do wood-fired pizza — specialty pies, a build your own option, and a dessert pizza. The full menu is on the Food page.",
      links: [{ label: "See the food menu", href: "/appleton-food-menu/" }],
    },
  },
  {
    keywords: ["gluten", "vegan", "dairy", "allerg", "cauliflower", "dietary", "celiac", "nut", "egg", "soy"],
    response: {
      text: "Here's the quick rundown:\n• Regular dough: vegan, not gluten-free\n• Cauliflower crust: gluten-free, not vegan\n• Dairy-free cheese available (oat milk)\n• Red sauce: not vegan (ask for garlic oil sub)\n\nNote: flour is in the air in our kitchen, so we can't guarantee 100% gluten-free. If you have a severe allergy, let our bartenders know.",
      links: [{ label: "Full FAQ", href: "/faq/" }],
    },
  },
  {
    keywords: ["beer", "tap", "brew", "ipa", "ale", "lager", "hazy", "craft", "draft", "pint", "flight", "stout", "porter", "pale", "sour", "saison", "what's on tap", "what is on tap"],
    response: {
      text: "Our tap list rotates regularly — the Drinks page has a live Untappd embed showing exactly what's pouring right now. We never want to give you outdated info on that.",
      links: [
        { label: "Appleton tap list", href: "/appleton-drinks-menu/" },
        { label: "The Falls tap list", href: "/the-falls-drinks-menu/" },
      ],
    },
  },
  {
    keywords: ["wine", "rosé", "rose", "prosecco", "moscato", "riesling", "chardonnay", "pinot", "sauvignon", "cabernet", "bubbly", "sparkling"],
    response: {
      text: "We carry a rotating selection of reds, whites, rosés, and sparkling at both locations. The Falls also offers wine by the bottle.",
      links: [
        { label: "Appleton drinks", href: "/appleton-drinks-menu/" },
        { label: "The Falls drinks", href: "/the-falls-drinks-menu/" },
      ],
    },
  },
  {
    keywords: ["cider", "seltzer", "non-alcoholic", "non alcoholic", "na ", "n/a", "no alcohol", "athletic", "mocktail", "soda", "water", "buzzkill", "liquid death"],
    response: {
      text: "Yes — we have non-alcoholic beers, wines, sparkling options, craft sodas, and canned water. The Drinks menu has the full list.",
      links: [
        { label: "Appleton drinks", href: "/appleton-drinks-menu/" },
        { label: "The Falls drinks", href: "/the-falls-drinks-menu/" },
      ],
    },
  },
  {
    keywords: ["where", "address", "direction", "located", "location", "find us", "map", "parking", "appleton", "menomonee", "falls", "kimberly", "northland"],
    response: {
      text: "We have two locations:\n\n📍 Appleton\n512 W Northland Ave, Appleton, WI 54911\n\n📍 Menomonee Falls\nN88W16521 Main St, Menomonee Falls, WI 53051",
      links: [
        { label: "Get directions to Appleton", href: "https://maps.app.goo.gl/9N2389HKdPiMQgzL7" },
        { label: "Get directions to The Falls", href: "https://maps.app.goo.gl/DWFo5Du6CZfUqkt7A" },
      ],
    },
  },
  {
    keywords: ["event", "music", "live", "sunday", "show", "concert", "band", "trivia", "oktoberfest", "flick", "movie", "paperfest", "calendar"],
    response: {
      text: "Live music is mostly on Sundays at Appleton. The Events page has the full upcoming calendar — including live music, tap releases, and community events we're part of.",
      links: [{ label: "See upcoming events", href: "/events/" }],
    },
  },
  {
    keywords: ["reservation", "reserv", "book", "table", "seat", "walk-in", "walk in", "wait", "hold table"],
    response: {
      text: "We don't take reservations — first come, first served. You're welcome to come a bit early and hold tables for your group (max 3 tables per group).",
      links: [{ label: "Visit info", href: "/faq/" }],
    },
  },
  {
    keywords: ["dog", "pet", "pup", "leash", "outside", "patio"],
    response: {
      text: "Dogs are welcome outside:\n• Appleton: outside patio\n• Menomonee Falls: back patio and front sidewalks\n\nMust be well-behaved and leashed. Registered service animals are welcome inside with proof of certification.",
    },
  },
  {
    keywords: ["kid", "child", "children", "family", "age", "minor", "baby"],
    response: {
      text: "Yes — we're all-ages at both locations. Kids are welcome.",
    },
  },
  {
    keywords: ["private event", "private party", "group event", "large group", "rent", "buyout", "hire", "corporate"],
    response: {
      text: "We do private events!\n• Appleton: Mondays or Tuesdays (when we're closed to the public). Email hopyardaleworks@gmail.com.\n• Menomonee Falls: Any day we're open, contract required. Email hopyardthefalls@gmail.com.\n\nOr use the contact form.",
      links: [{ label: "Contact us", href: "/contact/" }],
    },
  },
  {
    keywords: ["order online", "order", "pickup", "takeout", "take out", "to go", "toast", "delivery"],
    response: {
      text: "You can order online for pickup at both locations through Toast. We don't offer delivery.",
      links: [
        { label: "Order — Appleton", href: "https://order.toasttab.com/online/hop-yard-ale-works-appleton-512-w-northland-ave" },
        { label: "Order — The Falls", href: "https://order.toasttab.com/online/hop-yard-ale-works-menomonee-falls-n88w16521-main-street" },
      ],
    },
  },
  {
    keywords: ["tab", "card", "pay", "payment", "credit", "cash", "tip", "gratuity"],
    response: {
      text: "Open a tab with any credit or debit card — we hand it right back, no info stored. If you need to leave during a busy period, we'll close it with the card on file (includes 15% gratuity).",
    },
  },
  {
    keywords: ["phone", "call", "contact", "email", "reach", "get in touch", "message"],
    response: {
      text: "We don't have a public phone number. Best way to reach us is through the contact form, or message us on Instagram or Facebook.",
      links: [
        { label: "Contact form", href: "/contact/" },
      ],
    },
  },
  {
    keywords: ["about", "owner", "who are", "oliver", "amy", "behm", "story", "history", "founded"],
    response: {
      text: "Hop Yard Ale Works was started by Oliver and Amy Behm, who grew up in the Fox Valley with a shared love for food and beer. Read the full story on our About page.",
      links: [{ label: "About us", href: "/about/" }],
    },
  },
];

const WELCOME: Message = {
  id: "welcome",
  role: "bot",
  text: "Hey — what can I help you find? Ask about hours, food, beer, events, or getting here.",
};

function matchIntent(input: string): { text: string; links?: { label: string; href: string }[] } {
  const lower = input.toLowerCase();
  for (const intent of INTENTS) {
    if (intent.keywords.some((kw) => lower.includes(kw))) {
      return intent.response;
    }
  }
  return {
    text: "Hmm, I'm not sure about that one. Here are a few places that might help:",
    links: [
      { label: "FAQ", href: "/faq/" },
      { label: "Food menu", href: "/appleton-food-menu/" },
      { label: "Events", href: "/events/" },
      { label: "Contact us", href: "/contact/" },
    ],
  };
}

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: uid(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = matchIntent(text);
      const botMsg: Message = { id: uid(), role: "bot", ...response };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat window — sits above sticky order bar on mobile */}
      {isOpen && (
        <div
          className="fixed bottom-[5.5rem] md:bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          style={{ height: "min(520px, 80vh)", backgroundColor: "white", border: "1px solid rgba(0,0,0,0.1)" }}
          role="dialog"
          aria-label="Hop Yard chat assistant"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ backgroundColor: "var(--color-ink)" }}
          >
            <div>
              <p className="font-heading font-bold text-sm text-white">Hop Yard</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Quick answers</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white text-sm hover:opacity-70 transition-opacity"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm"
                  style={
                    msg.role === "user"
                      ? { backgroundColor: "var(--color-ink)", color: "white", borderBottomRightRadius: "4px" }
                      : { backgroundColor: "var(--color-warm-white)", color: "var(--color-ink)", borderBottomLeftRadius: "4px" }
                  }
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  {msg.links && msg.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target={link.href.startsWith("http") ? "_blank" : undefined}
                          rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="inline-block rounded-full px-2.5 py-1 text-xs font-medium hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: "var(--color-green)", color: "white" }}
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label} →
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl px-4 py-2.5 text-sm"
                  style={{ backgroundColor: "var(--color-warm-white)", color: "var(--color-muted)", borderBottomLeftRadius: "4px" }}
                >
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>·</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something…"
              className="flex-1 rounded-full px-4 py-2 text-sm outline-none min-h-[36px]"
              style={{ backgroundColor: "var(--color-warm-white)", color: "var(--color-ink)" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full transition-opacity disabled:opacity-40"
              style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
              aria-label="Send"
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* Floating bubble — sits above sticky order bar on mobile */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-[4.5rem] md:bottom-4 right-4 sm:right-6 z-50 flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          backgroundColor: "var(--color-ink)",
          color: "white",
          width: "52px",
          height: "52px",
          border: "2px solid rgba(255,255,255,0.25)",
        }}
        aria-label={isOpen ? "Close chat" : "Open chat assistant"}
      >
        {isOpen ? (
          <span className="text-lg leading-none">✕</span>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}
