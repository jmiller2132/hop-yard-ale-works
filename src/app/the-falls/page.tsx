import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menomonee Falls — Hop Yard Ale Works",
  description: "Visit Hop Yard Ale Works in Menomonee Falls, WI. Pizza-forward taproom. Great beer and great company.",
};

export const revalidate = 900;

export default async function TheFallsPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="font-heading text-4xl font-bold" style={{ color: "var(--color-teal)" }}>
          Menomonee Falls
        </h1>
        <p className="mt-3 text-lg" style={{ color: "var(--color-muted)" }}>
          The Falls taproom — location hub coming soon.
        </p>
      </div>
    </div>
  );
}
