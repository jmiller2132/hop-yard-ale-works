import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://hopyardaleworks.com";
  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/appleton/`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/the-falls/`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/appleton-food-menu/`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/appleton-drinks-menu/`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/the-falls-food-menu/`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/the-falls-drinks-menu/`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/events/`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/about/`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact/`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/apply/`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
