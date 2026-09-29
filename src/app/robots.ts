import type { MetadataRoute } from "next";
import { IS_PRODUCTION_DEPLOY, absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION_DEPLOY) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
