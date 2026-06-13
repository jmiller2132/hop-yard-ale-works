import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Hop Yard Ale Works",
  description:
    "Oliver & Amy Behm built Hop Yard Ale Works out of a shared love for food, beer, and community. Learn our story, how we operate, and the local partners who make it all possible.",
};

const partners = [
  { name: "The Meat Block", location: "Greenville, WI" },
  { name: "Let It BEE", location: "Greenville, WI" },
  { name: "Wilmar Chocolate", location: "Appleton, WI" },
  { name: "Ort Lumber", location: "New London, WI" },
  { name: "ORO De Oliva", location: "Brookfield, WI" },
  { name: "Caprine Supreme Goat Cheese", location: "Black Creek, WI" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="py-16 sm:py-24"
        style={{ backgroundColor: "var(--color-ink)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "var(--color-green)" }}>
            Our story
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-6">
            About Hop Yard
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            A Fox Valley love story — beer, food, and the people who make a place worth coming back to.
          </p>
        </div>
      </section>

      {/* Founders */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-6" style={{ color: "var(--color-ink)" }}>
                Oliver &amp; Amy Behm
              </h2>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
                <p>
                  Oliver and Amy grew up in the Fox Valley with a shared love for food and beer — a love
                  that took them on adventures across the country, collecting flavors, atmospheres, and
                  memories along the way.
                </p>
                <p>
                  What they built for you is a vibrant blend of all of it. The good beer. The wood-fired
                  pizza. The kind of room where strangers end up having a great conversation. They took
                  a leap of faith to follow their dream, and they genuinely hope it brings you joy.
                </p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.07)", aspectRatio: "4/3" }}>
              <Image
                src="/oliver-amy.jpg"
                alt="Oliver and Amy Behm at the Hop Yard Ale Works bar"
                width={1125}
                height={563}
                className="w-full h-full object-cover"
                style={{ objectPosition: "40% center" }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* The experience */}
      <section
        className="py-16 sm:py-20"
        style={{ backgroundColor: "var(--color-warm-white)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3" style={{ color: "var(--color-ink)" }}>
            The brewery experience
          </h2>
          <p className="text-sm font-medium mb-6" style={{ color: "var(--color-green)" }}>
            A brewery isn&apos;t just a bar or a restaurant. It&apos;s something better.
          </p>
          <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
            <p>
              Come as you are. Stay as long as you'd like. Grab a seat at the bar and chat with
              someone nearby, or lose yourself in a book and let the afternoon disappear.
            </p>
            <p>
              Above all, let us know how we can make your visit better — we're here to craft the
              right experience for you.
            </p>
          </div>
        </div>
      </section>

      {/* How we operate */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-6" style={{ color: "var(--color-ink)" }}>
            How we operate
          </h2>
          <div className="space-y-6">
            {[
              {
                heading: "Order at the bar",
                body: "We don't have servers or take reservations. Walk up to the bar — look for the Order Here sign — and we'll take care of you.",
              },
              {
                heading: "More than just beer",
                body: "Alongside our craft beers we offer fruit-forward seltzers, excellent wines, and hard ciders that go well beyond your usual apple juice. Our bartenders are happy to point you in the right direction.",
              },
              {
                heading: "Tabs & cards",
                body: "Open a tab with any credit or debit card. We'll hand it right back — no personal info stored. If things get busy and you need to head out before we can get to you, no problem: we'll close your tab with the card on file, including a 15% gratuity.",
              },
            ].map(({ heading, body }) => (
              <div
                key={heading}
                className="rounded-xl p-6"
                style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.07)" }}
              >
                <h3 className="font-heading text-base font-bold mb-2" style={{ color: "var(--color-ink)" }}>
                  {heading}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community / partners */}
      <section
        className="py-16 sm:py-20"
        style={{ backgroundColor: "var(--color-ink)" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "var(--color-green)" }}>
            Community
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-4">
            Proud to support local.
          </h2>
          <p className="text-base mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
            We work with a handful of small businesses whose ingredients and craftsmanship make
            their way into what you order. Ask us about any of them.
          </p>
          <div
            className="overflow-hidden -mx-4 sm:-mx-6"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            }}
          >
            <div className="flex animate-marquee gap-12 py-2 will-change-transform">
              {[...partners, ...partners].map(({ name, location }, i) => (
                <span key={i} className="flex-shrink-0 flex items-baseline gap-2">
                  <span className="font-heading font-semibold text-white whitespace-nowrap">{name}</span>
                  <span className="text-xs whitespace-nowrap" style={{ color: "rgba(255,255,255,0.4)" }}>{location}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12" style={{ backgroundColor: "var(--color-warm-white)" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-widest mb-4" style={{ color: "var(--color-muted)" }}>
            Come see it for yourself
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/appleton/"
              className="rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--color-ink)", color: "white" }}
            >
              Appleton
            </Link>
            <Link
              href="/the-falls/"
              className="rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--color-ink)", color: "white" }}
            >
              Menomonee Falls
            </Link>
            <Link
              href="/contact/"
              className="rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
