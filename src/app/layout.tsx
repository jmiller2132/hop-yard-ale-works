import type { Metadata } from "next";
import { Zilla_Slab, Inter, DM_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import GlobalHeader from "@/components/layout/GlobalHeader";
import GlobalFooter from "@/components/layout/GlobalFooter";
import GlobalBanner from "@/components/layout/GlobalBanner";
import ChatBot from "@/components/chat/ChatBot";
import KonamiCode from "@/components/ui/KonamiCode";
import TabTitleInactivity from "@/components/ui/TabTitleInactivity";
import CustomCursor from "@/components/ui/CustomCursor";
import ScrollProgressBar from "@/components/ui/ScrollProgressBar";
import { sanityClient } from "@/lib/sanity/client";
import { activeSeasonalThemeQuery, chatbotDataQuery, globalConfigQuery } from "@/lib/sanity/queries";
import type { SeasonalTheme, GlobalConfig, HolidayOverride } from "@/types";
import type { ChatFaq } from "@/lib/chatbot";
import type { LocationSlug } from "@/lib/location-data";
import { isLateNight } from "@/lib/hours";
import { IS_PRODUCTION_DEPLOY, SITE_URL } from "@/lib/site";

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

const wooderson = localFont({
  src: "../fonts/wooderson-crisp.otf",
  variable: "--font-wooderson",
  display: "swap",
  weight: "400",
});

// TODO: American Typewriter (brand tag / label face).
// Drop AmericanTypewriter-Medium.ttf into src/fonts/, then uncomment:
// const americanTypewriter = localFont({
//   src: "../fonts/AmericanTypewriter-Medium.ttf",
//   variable: "--font-american-typewriter",
//   display: "swap",
//   weight: "500",
// });
// Add ${americanTypewriter.variable} to the html className below,
// and update --font-tag in globals.css to var(--font-american-typewriter).

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Hop Yard Ale Works",
    default: "Hop Yard Ale Works — Great Beer, Great Pizza, Great Company",
  },
  description:
    "Hop Yard Ale Works is a craft brewery and taproom with two Wisconsin locations: Appleton and Menomonee Falls. Small-batch beers, wood-fired pizza, and great company.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "./",
  },
  openGraph: {
    siteName: "Hop Yard Ale Works",
    type: "website",
    locale: "en_US",
    url: "./",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: IS_PRODUCTION_DEPLOY
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export const revalidate = 3600; // GlobalConfig revalidates daily-ish from layout

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch global data server-side
  const [activeTheme, globalConfig, chatbotData] = await Promise.all([
    sanityClient
      .fetch<SeasonalTheme | null>(activeSeasonalThemeQuery)
      .catch(() => null),
    sanityClient
      .fetch<GlobalConfig | null>(globalConfigQuery)
      .catch(() => null),
    sanityClient
      .fetch<{
        faqs: ChatFaq[];
        locations: { slug: string; holidayOverrides: HolidayOverride[] | null }[];
      }>(chatbotDataQuery)
      .catch(() => null),
  ]);

  const chatHolidayOverrides: Partial<Record<LocationSlug, HolidayOverride[]>> = Object.fromEntries(
    (chatbotData?.locations ?? []).map((l) => [l.slug, l.holidayOverrides ?? []]),
  );

  const themeAttr =
    activeTheme?.accentPalette && activeTheme.accentPalette !== "default"
      ? activeTheme.accentPalette
      : undefined;

  const lateNight = isLateNight();

  return (
    <html
      lang="en"
      className={`${zillaSlab.variable} ${inter.variable} ${wooderson.variable} ${dmMono.variable}`}
      {...(themeAttr ? { "data-theme": themeAttr } : {})}
    >
      <body className="flex min-h-screen flex-col" style={{ fontFamily: "var(--font-body)" }}>
        {activeTheme?.bannerMessage && (
          <GlobalBanner
            message={activeTheme.bannerMessage}
            linkUrl={activeTheme.bannerLinkUrl ?? undefined}
          />
        )}
        <GlobalHeader activeTheme={activeTheme} />
        <main className="flex-1">{children}</main>
        <GlobalFooter config={globalConfig} />
        {lateNight && (
          <p
            className="fixed bottom-0 left-0 right-0 text-center text-xs py-1.5 pointer-events-none z-40"
            style={{ backgroundColor: "var(--color-ink)", color: "rgba(255,255,255,0.72)" }}
          >
            You&apos;re up late. So is the dough.
          </p>
        )}
        <ChatBot faqs={chatbotData?.faqs ?? []} holidayOverrides={chatHolidayOverrides} />
        <KonamiCode />
        <TabTitleInactivity />
        <CustomCursor />
        <ScrollProgressBar />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
