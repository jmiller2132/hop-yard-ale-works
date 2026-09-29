export const PRODUCTION_URL = "https://hopyardaleworks.com";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : PRODUCTION_URL)
).replace(/\/$/, "");

export const IS_PRODUCTION_DEPLOY =
  process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === "production";

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/hopyardaleworks/", icon: "instagram" },
  { label: "Facebook", href: "https://www.facebook.com/hopyardaleworks/", icon: "facebook" },
  { label: "Untappd", href: "https://untappd.com/HopYardAleWorks", icon: "untappd" },
  { label: "Linktree", href: "https://linktr.ee/hopyardaleworks", icon: "linktree" },
];

export const SOCIAL_PROFILES = SOCIAL_LINKS.slice(0, 3).map((s) => s.href);

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
