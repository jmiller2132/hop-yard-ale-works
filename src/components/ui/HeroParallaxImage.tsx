"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Drop-in replacement for the static hero image in the homepage.
 * The image wrapper is slightly oversized (extends above/below the clip region)
 * so parallax movement never reveals empty edges.
 */
export default function HeroParallaxImage() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf: number | null = null;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const el = wrapRef.current;
        if (!el) return;
        const y = window.scrollY * 0.28;
        el.style.transform = `translateY(${y}px)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    // Extra height + negative top so parallax movement never reveals edges
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        inset: "-14% 0",
        willChange: "transform",
      }}
    >
      <Image
        src="/look/appleton-bar-overview.jpg"
        alt="The bar and tap wall at Hop Yard Ale Works in Appleton"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
    </div>
  );
}
