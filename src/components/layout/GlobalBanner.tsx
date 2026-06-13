"use client";

import { useState } from "react";

interface GlobalBannerProps {
  message: string;
  linkUrl?: string;
}

export default function GlobalBanner({ message, linkUrl }: GlobalBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const content = (
    <span className="flex-1 text-center text-sm font-medium leading-snug">
      {message}
    </span>
  );

  return (
    <div
      className="relative flex items-center gap-3 px-4 py-2.5 min-h-[44px]"
      style={{
        backgroundColor: "var(--color-seasonal-banner-bg)",
        color: "var(--color-seasonal-banner-text)",
      }}
      role="banner"
    >
      {/* Spacer to balance close button */}
      <span className="w-7 flex-shrink-0" />

      {linkUrl ? (
        <a
          href={linkUrl}
          className="flex-1 text-center text-sm font-medium leading-snug hover:underline underline-offset-2"
          style={{ color: "var(--color-seasonal-banner-text)" }}
        >
          {message}
        </a>
      ) : (
        content
      )}

      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-xs transition-opacity hover:opacity-70"
        style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
        aria-label="Dismiss announcement"
      >
        ✕
      </button>
    </div>
  );
}
