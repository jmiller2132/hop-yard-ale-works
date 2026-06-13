import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/contact/ContactForm";
import { LOCATION_STATIC_DATA, HOURS_DISPLAY } from "@/lib/location-data";

export const metadata: Metadata = {
  title: "Contact — Hop Yard Ale Works",
  description:
    "Get in touch with Hop Yard Ale Works. Questions, private events, or just want to say hey — we'd love to hear from you.",
};

const locations = [
  {
    key: "appleton",
    label: "Appleton",
    emoji: "🍺",
    note: "Brewhouse & original taproom",
  },
  {
    key: "the-falls",
    label: "Menomonee Falls",
    emoji: "🍕",
    note: "Pizza-forward taproom",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="py-16 sm:py-20"
        style={{ backgroundColor: "var(--color-ink)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "var(--color-green)" }}>
            Get in touch
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            Say something.
          </h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.65)" }}>
            Questions, private events, partnerships — or just want to say hey.
            We don't have phones, but we do check email.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-14 items-start">
            {/* Info panel */}
            <div className="space-y-8">
              {locations.map(({ key, label, emoji, note }) => {
                const data = LOCATION_STATIC_DATA[key];
                const hours = HOURS_DISPLAY[key];
                return (
                  <div key={key}>
                    <h2 className="font-heading text-base font-bold mb-3" style={{ color: "var(--color-ink)" }}>
                      {emoji} {label}
                    </h2>
                    <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--color-muted)" }}>
                      {note}
                    </p>
                    <address className="not-italic text-sm space-y-1" style={{ color: "var(--color-ink)" }}>
                      {data?.address?.split("\n").map((line, i) => (
                        <span key={i} className="block">{line}</span>
                      ))}
                    </address>
                    {data?.googleMapsUrl && (
                      <a
                        href={data.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-1.5 text-sm font-medium hover:underline underline-offset-2"
                        style={{ color: "var(--color-green)" }}
                      >
                        Get directions ↗
                      </a>
                    )}
                    {hours && (
                      <ul className="mt-3 space-y-0.5">
                        {hours.map((line, i) => (
                          <li key={i} className="text-sm" style={{ color: "var(--color-muted)" }}>
                            {line}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}

              {/* Social / email note */}
              <div
                className="rounded-xl p-4 text-sm space-y-1"
                style={{ backgroundColor: "rgba(106,191,75,0.08)", border: "1px solid rgba(106,191,75,0.2)" }}
              >
                <p className="font-semibold" style={{ color: "var(--color-ink)" }}>
                  No phone? Correct.
                </p>
                <p style={{ color: "var(--color-muted)" }}>
                  Use the form to reach us. You can also slide into our DMs on{" "}
                  <a
                    href="https://www.instagram.com/hopyardaleworks/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                    style={{ color: "var(--color-green)" }}
                  >
                    Instagram
                  </a>{" "}
                  or{" "}
                  <a
                    href="https://www.facebook.com/HopYardAleWorks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                    style={{ color: "var(--color-green)" }}
                  >
                    Facebook
                  </a>
                  .
                </p>
              </div>

              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                For private events and large groups, select that topic in the form
                and give us a bit of detail — date, group size, and which location
                you're thinking.
              </p>
            </div>

            {/* Form */}
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section
        className="py-12"
        style={{ backgroundColor: "var(--color-warm-white)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "var(--color-muted)" }}>
            While you're here
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/appleton/"
              className="rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--color-ink)", color: "white" }}
            >
              Visit Appleton
            </Link>
            <Link
              href="/the-falls/"
              className="rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--color-ink)", color: "white" }}
            >
              Visit The Falls
            </Link>
            <Link
              href="/events/"
              className="rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
            >
              See upcoming events
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
