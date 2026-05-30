import type { Metadata } from "next";

export const metadata: Metadata = { title: "Apply — Hop Yard Ale Works" };

export default function ApplyPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="font-heading text-4xl font-bold mb-4" style={{ color: "var(--color-teal)" }}>
          Join the Team
        </h1>
        <p className="mb-8 text-lg" style={{ color: "var(--color-muted)" }}>
          We're always looking for great people who love great beer and great pizza.
        </p>
        {/* Google Form embed or native form — TBD with owners */}
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.08)" }}
        >
          <p style={{ color: "var(--color-muted)" }}>Application form — pending owner decision (Google Form or native)</p>
        </div>
      </div>
    </div>
  );
}
