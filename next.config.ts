import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },

  async redirects() {
    return [
      // ── SEO — beer/wine menu consolidation ─────────────────────────
      {
        source: "/appleton-beer-menu",
        destination: "/appleton-drinks-menu",
        permanent: true,
      },
      {
        source: "/appleton-beer-menu/",
        destination: "/appleton-drinks-menu/",
        permanent: true,
      },
      {
        source: "/appleton-wine-menu",
        destination: "/appleton-drinks-menu#wine",
        permanent: true,
      },
      {
        source: "/appleton-wine-menu/",
        destination: "/appleton-drinks-menu/#wine",
        permanent: true,
      },
      {
        source: "/the-falls-beer-menu",
        destination: "/the-falls-drinks-menu",
        permanent: true,
      },
      {
        source: "/the-falls-beer-menu/",
        destination: "/the-falls-drinks-menu/",
        permanent: true,
      },
      {
        source: "/the-falls-wine-menu",
        destination: "/the-falls-drinks-menu#wine",
        permanent: true,
      },
      {
        source: "/the-falls-wine-menu/",
        destination: "/the-falls-drinks-menu/#wine",
        permanent: true,
      },
      // ── Slug changes (WordPress slugs → new site slugs) ────────────
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/about-us/",
        destination: "/about/",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/contact-us/",
        destination: "/contact/",
        permanent: true,
      },
      {
        source: "/apply-now",
        destination: "/apply",
        permanent: true,
      },
      {
        source: "/apply-now/",
        destination: "/apply/",
        permanent: true,
      },
      // ── Old WordPress redirect chains — collapse to final destination
      {
        source: "/beer-menu-appleton",
        destination: "/appleton-drinks-menu",
        permanent: true,
      },
      {
        source: "/beer-menu-appleton/",
        destination: "/appleton-drinks-menu/",
        permanent: true,
      },
      {
        source: "/beer-menu-menomonee-falls",
        destination: "/the-falls-drinks-menu",
        permanent: true,
      },
      {
        source: "/beer-menu-menomonee-falls/",
        destination: "/the-falls-drinks-menu/",
        permanent: true,
      },
      // ── Order Online standalone page → home ────────────────────────
      {
        source: "/order-online",
        destination: "/",
        permanent: true,
      },
      {
        source: "/order-online/",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Sanity Studio route — handled by embedded studio
  async headers() {
    return [
      {
        // Disallow indexing of studio
        source: "/studio/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
