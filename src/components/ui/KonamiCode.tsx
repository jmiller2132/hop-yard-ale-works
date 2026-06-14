"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const SEQUENCE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a",
];

const MESSAGES = [
  "You've done this before.",
  "Old habits.",
  "We were wondering when you'd show up.",
];

const SESSION_KEY = "hopyard_konami_idx";

function getNextMessage(): string {
  const raw = sessionStorage.getItem(SESSION_KEY);
  const idx = raw !== null ? parseInt(raw, 10) : 0;
  const msg = MESSAGES[idx % MESSAGES.length];
  sessionStorage.setItem(SESSION_KEY, String((idx + 1) % MESSAGES.length));
  return msg;
}

export default function KonamiCode() {
  const [toast, setToast] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const progress = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = useCallback(() => {
    const msg = getNextMessage();
    setToast(msg);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 3200);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const expected = SEQUENCE[progress.current];
      if (e.key === expected) {
        progress.current += 1;
        if (progress.current === SEQUENCE.length) {
          progress.current = 0;
          fire();
        }
      } else {
        // Allow restarting from step 1 if the new key matches the first key
        progress.current = e.key === SEQUENCE[0] ? 1 : 0;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fire]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[110] pointer-events-none flex justify-center px-4">
      <div
        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-opacity duration-300 ${visible ? "opacity-[0.88]" : "opacity-0"}`}
        style={{ backgroundColor: "var(--color-ink)", color: "var(--color-warm-white)" }}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>
    </div>
  );
}
