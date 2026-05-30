import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact — Hop Yard Ale Works" };

export default function ContactPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="font-heading text-4xl font-bold mb-4" style={{ color: "var(--color-teal)" }}>
          Contact
        </h1>
        <p className="mb-8 text-lg" style={{ color: "var(--color-muted)" }}>
          Have a question? Drop us a line.
        </p>
        {/* ContactForm component — Phase 2 */}
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.08)" }}
        >
          <p style={{ color: "var(--color-muted)" }}>Contact form — Phase 2</p>
        </div>
      </div>
    </div>
  );
}
