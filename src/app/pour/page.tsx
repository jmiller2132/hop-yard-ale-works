import TapperGame from "@/components/game/TapperGame";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Last Call Tapper — Hop Yard Ale Works",
  robots: { index: false, follow: false },
};

export default function PourPage() {
  return <TapperGame />;
}
