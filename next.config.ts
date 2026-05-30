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
      // SEO — preserve old beer/wine menu slugs with 301s
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
