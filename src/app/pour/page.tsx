import PourGame from "@/components/game/PourGame";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfect Pour — Hop Yard Ale Works",
  robots: { index: false, follow: false },
};

export default function PourPage() {
  return <PourGame />;
}
