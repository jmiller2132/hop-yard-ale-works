// Only quotes with a verifiable, credited source belong here.
const QUOTE = {
  text: "Without question the greatest invention in the history of mankind is beer… the wheel does not go nearly as well with pizza.",
  attribution: "Dave Barry",
};

export default function QuoteBanner() {
  return (
    <section
      className="py-10 px-4 text-center sm:px-6"
      style={{ backgroundColor: "var(--color-warm-white)" }}
      aria-label="Quote"
    >
      <blockquote className="mx-auto max-w-2xl">
        <p
          className="font-heading text-lg italic leading-relaxed sm:text-xl"
          style={{ color: "var(--color-green-text)" }}
        >
          &ldquo;{QUOTE.text}&rdquo;
        </p>
        <footer className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
          — {QUOTE.attribution}
        </footer>
      </blockquote>
    </section>
  );
}
