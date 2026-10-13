import type { Metadata } from "next";
import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { faqsByCategoryQuery } from "@/lib/sanity/queries";
import type { FAQ } from "@/types";
import FaqAccordion from "@/components/faq/FaqAccordion";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "FAQ: Hours, Food, Drinks & Visiting",
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
      <section
        className="pb-12 pt-24 sm:pb-16 sm:pt-36"
        style={{ minHeight: "clamp(260px, 44vh, 400px)", backgroundColor: "var(--color-ink)", display: "flex", alignItems: "flex-end" }}
      >
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "var(--color-green)" }}>
            Got questions?
          </p>
          <h1 className="font-display text-5xl sm:text-6xl uppercase leading-[0.9] text-white mb-4">
            We've got answers.
          </h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
            Everything you need to know before (and after) your visit.
          </p>
        </div>
      </section>

      {/* FAQ content */}
      <section className="section-padding">
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
      <section className="section-padding" style={{ backgroundColor: "var(--color-teal)" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p
            className="font-heading text-lg font-semibold mb-2"
            style={{ color: "white" }}
          >
            Still not finding what you need?
          </p>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.75)" }}>
            We don't have phones, but we do respond to messages.
          </p>
          <Link
            href="/contact/"
            className="inline-flex rounded-md px-6 py-2.5 text-sm font-semibold min-h-[44px] items-center transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--color-green-strong)", color: "white" }}
          >
            Send us a message
          </Link>
        </div>
      </section>
    </>
  );
}
