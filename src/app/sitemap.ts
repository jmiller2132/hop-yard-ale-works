import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

const PATHS = [
  "/",
  "/appleton/",
  "/the-falls/",
  "/appleton-food-menu/",
  "/appleton-drinks-menu/",
  "/the-falls-food-menu/",
  "/the-falls-drinks-menu/",
  "/events/",
  "/about/",
  "/faq/",
  "/contact/",
  "/apply/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: absoluteUrl(path) }));
}
