import type { Metadata } from "next";
import { Zilla_Slab, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import GlobalHeader from "@/components/layout/GlobalHeader";
import GlobalFooter from "@/components/layout/GlobalFooter";
import { sanityClient } from "@/lib/sanity/client";
import { activeSeasonalThemeQuery, globalConfigQuery } from "@/lib/sanity/queries";
import type { SeasonalTheme, GlobalConfig } from "@/types";

const zillaSlab = Zilla_Slab({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-zilla-slab",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Hop Yard Ale Works",
    default: "Hop Yard Ale Works — Great Beer, Great Pizza, Great Company",
  },
  description:
    "Hop Yard Ale Works is a craft brewery and taproom with two Wisconsin locations: Appleton and Menomonee Falls. Small-batch beers, wood-fired pizza, and great company.",
  metadataBase: new URL("https://hopyardaleworks.com"),
  openGraph: {
    siteName: "Hop Yard Ale Works",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 3600; // GlobalConfig revalidates daily-ish from layout

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch global data server-side
  const [activeTheme, globalConfig] = await Promise.all([
    sanityClient
      .fetch<SeasonalTheme | null>(activeSeasonalThemeQuery)
      .catch(() => null),
    sanityClient
      .fetch<GlobalConfig | null>(globalConfigQuery)
      .catch(() => null),
  ]);

  const themeAttr =
    activeTheme?.accentPalette && activeTheme.accentPalette !== "default"
      ? activeTheme.accentPalette
      : undefined;

  return (
    <html
      lang="en"
      className={`${zillaSlab.variable} ${inter.variable}`}
      {...(themeAttr ? { "data-theme": themeAttr } : {})}
    >
      <body className="flex min-h-screen flex-col" style={{ fontFamily: "var(--font-body)" }}>
        <GlobalHeader activeTheme={activeTheme} />
        <main className="flex-1">{children}</main>
        <GlobalFooter config={globalConfig} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
