// Untappd embed configuration.
// Appleton: brewery 35292, menu 136697
// The Falls: brewery 49776, menu 175504

export const UNTAPPD_CONFIG = {
  appleton: {
    breweryId: 35292,
    menuId: 136697,
    label: "What's Pouring at Appleton Right Now",
  },
  "the-falls": {
    breweryId: 49776,
    menuId: 175504,
    label: "What's Pouring at Menomonee Falls Right Now",
  },
} as const;

export type LocationSlug = keyof typeof UNTAPPD_CONFIG;

// Script URL used by both embeds
export const UNTAPPD_PRELOADER_URL =
  "https://embed-menu-preloader.untappdapi.com/embed-menu-preloader.min.js";
