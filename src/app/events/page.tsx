import type { Metadata } from "next";

export const metadata: Metadata = { title: "Events — Hop Yard Ale Works" };
export const revalidate = 1800;

export default function EventsPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="font-heading text-4xl font-bold" style={{ color: "var(--color-teal)" }}>
          Events
        </h1>
        <p className="mt-3" style={{ color: "var(--color-muted)" }}>Upcoming events — coming soon.</p>
      </div>
    </div>
  );
}
