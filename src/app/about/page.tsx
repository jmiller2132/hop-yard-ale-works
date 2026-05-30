import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Hop Yard Ale Works",
  description: "We brew small-batch beers and fire up bold pizzas in a space built for good company and great ideas.",
};

export default function AboutPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Hero */}
        <div
          className="mb-10 rounded-xl px-8 py-16 text-center"
          style={{ backgroundColor: "var(--color-teal)", color: "var(--color-warm-white)" }}
        >
          <h1 className="font-heading text-4xl font-bold sm:text-5xl">About Hop Yard</h1>
        </div>

        {/* Brand statement */}
        <div className="mb-12 text-center">
          <p className="text-xl leading-relaxed" style={{ color: "var(--color-ink)" }}>
            We brew small-batch beers and fire up bold, wood-fired pizzas in a space built
            for good company and great ideas.
          </p>
        </div>

        {/* Locations */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl p-6" style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.08)" }}>
            <h2 className="font-heading text-xl font-bold mb-2" style={{ color: "var(--color-teal)" }}>Appleton</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              The flagship taproom. The original Hop Yard. An Appleton neighborhood staple built
              on community, craft, and a commitment to making every pint count.
            </p>
          </div>
          <div className="rounded-xl p-6" style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.08)" }}>
            <h2 className="font-heading text-xl font-bold mb-2" style={{ color: "var(--color-teal)" }}>Menomonee Falls</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              A newer home bringing the same great beer and pizza to the Milwaukee area crowd.
              Pizza-forward, brewery-hearted — and building its own story one pint at a time.
            </p>
          </div>
        </div>

        {/* Community philosophy */}
        <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "var(--color-warm-white)", border: "1px solid rgba(0,0,0,0.06)" }}>
          <p className="text-lg leading-relaxed" style={{ color: "var(--color-ink)" }}>
            Hop Yard is a place for regulars and first-timers alike. A spot where you can
            try something new on tap, share a pizza with people you just met, and leave
            feeling like you belong here. Because you do.
          </p>
        </div>
      </div>
    </div>
  );
}
