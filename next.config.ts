import type { NextConfig } from "next";

// With trailingSlash: true, Next redirects "/about-us" → "/about-us/" before
// these rules run, so each legacy source only needs its slash form, and every
// destination must end in "/" to avoid a second hop.
const LEGACY_REDIRECTS: [source: string, destination: string][] = [
  // SEO — beer/wine menu consolidation
  ["/appleton-beer-menu/", "/appleton-drinks-menu/"],
  ["/appleton-wine-menu/", "/appleton-drinks-menu/#wine"],
  ["/the-falls-beer-menu/", "/the-falls-drinks-menu/"],
  ["/the-falls-wine-menu/", "/the-falls-drinks-menu/#wine"],
  // Slug changes (WordPress slugs → new site slugs)
  ["/about-us/", "/about/"],
  ["/contact-us/", "/contact/"],
  ["/apply-now/", "/apply/"],
  // Old WordPress redirect chains — collapse to final destination
  ["/beer-menu-appleton/", "/appleton-drinks-menu/"],
  ["/beer-menu-menomonee-falls/", "/the-falls-drinks-menu/"],
  // Order Online standalone page → home
  ["/order-online/", "/"],
];

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  trailingSlash: true,

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
    return LEGACY_REDIRECTS.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        // Disallow indexing of studio
        source: "/studio/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      {
        // The game is embedded by /pour (itself noindex); keep the raw file out of search.
        source: "/tap-rush.html",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
