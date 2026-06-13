"use client";

import { useState, useEffect } from "react";

const QUOTES = [
  {
    text: "Without question the greatest invention in the history of mankind is beer… the wheel does not go nearly as well with pizza.",
    attribution: "Dave Barry",
  },
  {
    text: "He was a wise man who invented beer.",
    attribution: "Plato",
  },
  {
    text: "Beer is proof that God loves us and wants us to be happy.",
    attribution: "Benjamin Franklin",
  },
  {
    text: "A fine beer may be judged with only one sip, but it's better to be thoroughly sure.",
    attribution: "Czech proverb",
  },
  {
    text: "Give me a woman who loves beer and I will conquer the world.",
    attribution: "Kaiser Wilhelm",
  },
  {
    text: "The best beer is the one you drink with friends.",
    attribution: "Unknown",
  },
  {
    text: "Pizza is the perfect food. Beer proves it.",
    attribution: "Hop Yard Ale Works",
  },
];

export default function QuoteBanner() {
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    // Pick a random quote on mount, persist for the session
    const stored = sessionStorage.getItem("hyw-quote-index");
    let index = stored ? parseInt(stored, 10) : -1;

    if (index < 0 || index >= QUOTES.length) {
      index = Math.floor(Math.random() * QUOTES.length);
      sessionStorage.setItem("hyw-quote-index", String(index));
    }

    setQuote(QUOTES[index]);
  }, []);

  return (
    <section
      className="py-10 px-4 text-center sm:px-6"
      style={{ backgroundColor: "var(--color-warm-white)" }}
      aria-label="Quote"
    >
      <blockquote className="mx-auto max-w-2xl">
        <p
          className="font-heading text-lg italic leading-relaxed sm:text-xl"
          style={{ color: "var(--color-green)" }}
        >
          &ldquo;{quote.text}&rdquo;
        </p>
        <footer className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
          — {quote.attribution}
        </footer>
      </blockquote>
    </section>
  );
}
