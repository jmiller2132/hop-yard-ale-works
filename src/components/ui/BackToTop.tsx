"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="back-to-top fixed left-4 z-50 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-opacity md:left-auto md:right-24"
      style={{
        bottom: "var(--fab-bottom)",
        backgroundColor: "var(--color-warm-white)",
        color: "var(--color-ink)",
        border: "1px solid rgba(0,0,0,0.12)",
        WebkitTapHighlightColor: "transparent",
      }}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
