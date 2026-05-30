import type { Metadata } from "next";

export const metadata: Metadata = { title: "The Falls Drinks Menu — Hop Yard Ale Works" };
export const revalidate = 3600;

export default function TheFallsDrinksMenuPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="font-heading text-4xl font-bold" style={{ color: "var(--color-teal)" }}>
          Menomonee Falls — Drinks
        </h1>
        <p className="mt-3" style={{ color: "var(--color-muted)" }}>
          On Tap · Wine · Ciders · Non-Alcoholic — coming soon.
        </p>
      </div>
    </div>
  );
}
