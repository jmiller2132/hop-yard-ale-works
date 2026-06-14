"use client";

import { useEffect, useRef } from "react";

const IDLE_MESSAGES = ["We're still here.", "Still pouring."];
const IDLE_MS = 60_000;

export default function TabTitleInactivity() {
  const originalTitle = useRef<string>("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgIndex = useRef(0);

  useEffect(() => {
    originalTitle.current = document.title;

    function goIdle() {
      originalTitle.current = document.title;
      document.title = IDLE_MESSAGES[msgIndex.current % IDLE_MESSAGES.length];
      msgIndex.current++;
    }

    function resetTimer() {
      if (timer.current) clearTimeout(timer.current);
      // Restore title if it was changed
      if (document.title !== originalTitle.current) {
        document.title = originalTitle.current;
      }
      timer.current = setTimeout(goIdle, IDLE_MS);
    }

    function handleVisibility() {
      if (!document.hidden) {
        document.title = originalTitle.current;
        resetTimer();
      }
    }

    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    document.addEventListener("visibilitychange", handleVisibility);

    // Start the timer
    timer.current = setTimeout(goIdle, IDLE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
