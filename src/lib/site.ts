export const PRODUCTION_URL = "https://hopyardaleworks.com";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : PRODUCTION_URL)
).replace(/\/$/, "");

export const IS_PRODUCTION_DEPLOY =
  process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === "production";

export const SOCIAL_PROFILES = [
  "https://www.instagram.com/hopyardaleworks/",
  "https://www.facebook.com/hopyardaleworks/",
  "https://untappd.com/HopYardAleWorks",
];

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
