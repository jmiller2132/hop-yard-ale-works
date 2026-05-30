import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appleton — Hop Yard Ale Works",
  description: "Visit Hop Yard Ale Works in Appleton, WI. The flagship taproom. Great beer, great pizza, great company.",
};

export const revalidate = 900;

export default async function AppletonPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="font-heading text-4xl font-bold" style={{ color: "var(--color-teal)" }}>
          Appleton
        </h1>
        <p className="mt-3 text-lg" style={{ color: "var(--color-muted)" }}>
          The flagship taproom — location hub coming soon.
        </p>
      </div>
    </div>
  );
}
