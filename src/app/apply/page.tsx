import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the Team — Hop Yard Ale Works",
  description:
    "We're hiring at both Appleton and Menomonee Falls. Team-first, flexible hours, great environment. Apply now.",
};

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc2KmDqcGbEqCLOUdBg-glKLzLdyXFoiEnnwG3mRECbmJEUHw/viewform?embedded=true";

export default function ApplyPage() {
  return (
    <div style={{ backgroundColor: "var(--color-warm-white)" }}>
      {/* Hero */}
      <section
        className="px-4 py-20 text-center"
        style={{ backgroundColor: "var(--color-ink)" }}
      >
        <div className="mx-auto max-w-2xl">
          <p
            className="font-heading text-sm font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--color-green)" }}
          >
            We&apos;re Hiring
          </p>
          <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl">
            Join Our Team
          </h1>
          <p className="mt-4 text-base sm:text-lg" style={{ color: "rgba(255,255,255,0.55)" }}>
            Appleton &amp; Menomonee Falls
          </p>
        </div>
      </section>

      {/* Intro copy */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="prose prose-neutral max-w-none" style={{ color: "var(--color-ink)" }}>
            <p className="text-lg leading-relaxed mb-5">
              We operate very much as a <strong>team environment</strong>. We hire and train people to work
              in all areas of our brewery — that means if you apply, it&apos;s not just for bartending. It
              also includes roles like glass washer, pizza maker, cleaning tables, and washing pizza
              trays.
            </p>
            <p className="text-base leading-relaxed mb-5" style={{ color: "var(--color-muted)" }}>
              Bartenders must be 21, but we hire kitchen and cleanup staff who are 16 or older. We are
              an equal opportunity employer and encourage all to apply.
            </p>
            <div
              className="rounded-xl px-6 py-5 mb-6"
              style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.07)" }}
            >
              <p className="font-semibold mb-2" style={{ color: "var(--color-ink)" }}>
                It can get crazy in here.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                Before you apply, know that you&apos;ll need a good pair of shoes and will be on your feet
                for most of your shift — usually 4–5 hours long.
              </p>
            </div>
            <p className="text-base leading-relaxed mb-2" style={{ color: "var(--color-muted)" }}>
              We&apos;re very flexible with hours and can work around sports, second jobs, and life. We
              just ask that you understand <strong>weekends are our busiest times</strong> — as part of
              your employment, you&apos;ll be required to work them.
            </p>
            <p className="text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
              If that all sounds good — we&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Google Form */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-2xl">
          <h2
            className="font-heading text-2xl font-bold mb-6"
            style={{ color: "var(--color-ink)" }}
          >
            Apply Now
          </h2>
          <div
            className="overflow-hidden rounded-xl"
            style={{ border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <iframe
              src={FORM_URL}
              width="100%"
              height="2200"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              title="Hop Yard Ale Works Job Application"
              className="block w-full"
              style={{ minHeight: "2200px" }}
            >
              Loading application form…
            </iframe>
          </div>
          <p className="mt-4 text-xs text-center" style={{ color: "var(--color-muted)" }}>
            Having trouble with the form?{" "}
            <a
              href={FORM_URL.replace("?embedded=true", "")}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-70 transition-opacity"
              style={{ color: "var(--color-ink)" }}
            >
              Open it directly
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
