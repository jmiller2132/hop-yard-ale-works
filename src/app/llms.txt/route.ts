import { LOCATIONS, LOCATION_SLUGS, hoursSummaryText } from "@/lib/location-data";
import { SOCIAL_LINKS, absoluteUrl } from "@/lib/site";

// Plain-text site summary for AI assistants and crawlers. Built from the same
// data as the rest of the site so hours and addresses can't drift.
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  const locations = LOCATION_SLUGS.map((slug) => {
    const l = LOCATIONS[slug];
    return [
      `## ${l.name}`,
      `- Address: ${l.street}, ${l.city}, ${l.region} ${l.postalCode}`,
      `- Hours: ${hoursSummaryText(slug)}`,
      `- Kitchen: ${l.kitchenNote}`,
      `- Page: ${absoluteUrl(l.paths.home)}`,
      `- Food menu: ${absoluteUrl(l.paths.food)}`,
      `- Drinks and tap list: ${absoluteUrl(l.paths.drinks)}`,
      `- Order online: ${l.orderOnlineUrl}`,
    ].join("\n");
  });

  const body = [
    "# Hop Yard Ale Works",
    "",
    "> Craft brewery and taproom with two Wisconsin locations (Appleton and Menomonee Falls) serving house-brewed beer and wood-fired pizza. No phone line; contact is by email form.",
    "",
    ...locations.flatMap((l) => [l, ""]),
    "## More",
    `- Events: ${absoluteUrl("/events/")}`,
    `- FAQ: ${absoluteUrl("/faq/")}`,
    `- About: ${absoluteUrl("/about/")}`,
    `- Contact: ${absoluteUrl("/contact/")}`,
    ...SOCIAL_LINKS.map((s) => `- ${s.label}: ${s.href}`),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
