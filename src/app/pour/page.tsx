import type { Metadata } from "next";
import TapperGame from "@/components/game/TapperGame";

export const metadata: Metadata = {
  title: "Last Call Tapper",
  robots: { index: false, follow: false },
};

export default function PourPage() {
  return <TapperGame />;
}
