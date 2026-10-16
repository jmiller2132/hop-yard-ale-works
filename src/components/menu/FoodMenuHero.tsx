import Link from "next/link";
import Image from "next/image";

export default function FoodMenuHero({
  backHref,
  backLabel,
  place,
}: {
  backHref: string;
  backLabel: string;
  place: string;
}) {
  return (
    <section
      className="relative overflow-hidden flex items-end pb-6 pt-28 sm:pb-10 sm:pt-36"
      style={{ minHeight: "220px", backgroundColor: "#E2A21A", color: "#231F20" }}
      aria-label="Food Menu"
    >
      {/* Oven photo adds texture behind the yellow */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/look/appleton-oven-fire.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          style={{ opacity: 0.18, mixBlendMode: "multiply" }}
        />
      </div>
      <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-6 px-4 sm:px-6">
        <div>
          <Link
            href={backHref}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" />
            </svg>
            {backLabel}
          </Link>
          <h1 className="font-display text-5xl sm:text-7xl uppercase leading-[0.9]">
            Food Menu
          </h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wider">{place}</p>
          <p className="mt-1 text-sm">Same food menu at both locations.</p>
          <a
            href="/menus/food-menu.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ borderColor: "rgba(35,31,32,0.45)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" />
            </svg>
            View PDF
          </a>
        </div>
        <img
          src="/look/stamp-black.png"
          alt=""
          className="hidden h-24 w-24 shrink-0 sm:block"
        />
      </div>
    </section>
  );
}
