import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tap Rush",
  robots: { index: false, follow: false },
};

export default function TapRushPage() {
  return (
    <iframe
      src="/tap-rush.html"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
        display: "block",
      }}
      title="Tap Rush"
    />
  );
}
