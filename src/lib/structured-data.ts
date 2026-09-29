import { LOCATIONS, openingHoursSpecification, type LocationSlug } from "@/lib/location-data";
import { SITE_URL, SOCIAL_PROFILES, absoluteUrl } from "@/lib/site";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export function organizationJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: "Hop Yard Ale Works",
      url: `${SITE_URL}/`,
      logo: absoluteUrl("/logo.png"),
      sameAs: SOCIAL_PROFILES,
      // TODO: confirm with owner — add Google Business Profile URLs to sameAs.
      subOrganization: Object.values(LOCATIONS).map((l) => ({
        "@id": absoluteUrl(`${l.paths.home}#location`),
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Hop Yard Ale Works",
      url: `${SITE_URL}/`,
      publisher: { "@id": ORGANIZATION_ID },
    },
  ];
}

export function locationJsonLd(slug: LocationSlug) {
  const l = LOCATIONS[slug];
  return {
    "@context": "https://schema.org",
    "@type": ["Brewery", "Restaurant"],
    "@id": absoluteUrl(`${l.paths.home}#location`),
    name: l.name,
    url: absoluteUrl(l.paths.home),
    image: absoluteUrl("/logo.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: l.street,
      addressLocality: l.city,
      addressRegion: l.region,
      postalCode: l.postalCode,
      addressCountry: "US",
    },
    hasMap: l.googleMapsUrl,
    openingHoursSpecification: openingHoursSpecification(slug),
    servesCuisine: "Pizza",
    hasMenu: absoluteUrl(l.paths.food),
    acceptsReservations: false,
    potentialAction: {
      "@type": "OrderAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: l.orderOnlineUrl,
        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
        ],
      },
    },
    parentOrganization: { "@id": ORGANIZATION_ID },
  };
}
