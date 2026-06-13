import type { Metadata } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { taproomPhotosQuery } from "@/lib/sanity/queries";
import type { TaproomPhoto } from "@/types";
import TaproomPhotoGrid from "@/components/ui/TaproomPhotoGrid";
import Link from "next/link";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Photos — Hop Yard Ale Works",
  description: "A look inside the taprooms. Real people, real pints, real pizza.",
};

export default async function PhotosPage() {
  const photos = await sanityClient
    .fetch<TaproomPhoto[]>(taproomPhotosQuery)
    .catch(() => [] as TaproomPhoto[]);

  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: "var(--color-ink)" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "var(--color-green)" }}>
            From the taproom
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            Real people. Real pints.
          </h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
            A look inside Hop Yard. Tag us on Instagram or Facebook with{" "}
            <span style={{ color: "var(--color-green)" }}>#HopYardAleWorks</span> and you might end up here.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {photos.length > 0 ? (
            <TaproomPhotoGrid photos={photos} />
          ) : (
            <div
              className="rounded-2xl py-20 text-center"
              style={{ backgroundColor: "var(--color-warm-white)" }}
            >
              <p className="text-lg font-heading font-semibold mb-2" style={{ color: "var(--color-ink)" }}>
                Photos coming soon.
              </p>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                In the meantime, follow along on{" "}
                <a
                  href="https://www.instagram.com/hopyardaleworks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                  style={{ color: "var(--color-green)" }}
                >
                  Instagram
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12" style={{ backgroundColor: "var(--color-warm-white)" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-widest mb-4" style={{ color: "var(--color-muted)" }}>
            Come be in the next one
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
          </div>
        </div>
      </section>
    </>
  );
}
