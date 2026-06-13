import type { Metadata } from "next";
import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { faqsByCategoryQuery } from "@/lib/sanity/queries";
import type { FAQ } from "@/types";
import FaqAccordion from "@/components/faq/FaqAccordion";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "FAQ — Hop Yard Ale Works",
  description:
    "Answers to common questions about visiting Hop Yard Ale Works — hours, food, drinks, events, and more.",
};

const ALL_CATEGORIES = ["hours", "visit", "food", "drinks", "events", "contact", "general"];

export default async function FaqPage() {
  const faqs = await sanityClient
    .fetch<FAQ[]>(faqsByCategoryQuery, { categories: ALL_CATEGORIES })
    .catch(() => [] as FAQ[]);

  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: "var(--color-ink)" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "var(--color-green)" }}>
            Got questions?
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            We've got answers.
          </h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
            Everything you need to know before (and after) your visit.
          </p>
        </div>
      </section>

      {/* FAQ content */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {faqs.length > 0 ? (
            <FaqAccordion faqs={faqs} />
          ) : (
            <div
              className="rounded-2xl py-16 text-center"
              style={{ backgroundColor: "var(--color-warm-white)" }}
            >
              <p className="text-base" style={{ color: "var(--color-muted)" }}>
                FAQs coming soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="py-12" style={{ backgroundColor: "var(--color-warm-white)" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p
            className="font-heading text-lg font-semibold mb-2"
            style={{ color: "var(--color-ink)" }}
          >
            Still not finding what you need?
          </p>
          <p className="text-sm mb-5" style={{ color: "var(--color-muted)" }}>
            We don't have phones, but we do respond to messages.
          </p>
          <Link
            href="/contact/"
            className="inline-flex rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
          >
            Send us a message
          </Link>
        </div>
      </section>
    </>
  );
}
