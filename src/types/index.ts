import type { SanityImageSource } from "@sanity/image-url";

// Exported for use with urlFor()
export type { SanityImageSource };

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface Location {
  _id: string;
  name: string;
  slug: { current: string };
  address: string;
  phone: string;
  googleMapsUrl: string;
  orderOnlineUrl: string;
  heroImage: SanityImage;
  tagline: string;
  hours: DayHours[];
  sundayHours?: { open: string; close: string; isClosed: boolean };
  holidayOverrides?: HolidayOverride[];
  visitFAQs?: { question: string; answer: string }[];
  privateEvents?: PrivateEvents;
}

export interface DayHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface HolidayOverride {
  date: string;
  label: string;
  hoursNote: string;
}

export interface PrivateEvents {
  isActive: boolean;
  headline: string;
  description: string;
  highlights: { text: string }[];
  photo?: SanityImage;
}

export interface SeasonalTheme {
  name: string;
  badgeText?: string;
  bannerMessage?: string;
  bannerLinkUrl?: string;
  heroImages?: SanityImage[];
  logoOverride?: SanityImage;
  accentPalette:
    | "default"
    | "stPatricks"
    | "summerBright"
    | "fourthOfJuly"
    | "oktoberfest"
    | "halloween"
    | "christmas";
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface GlobalConfig {
  siteName: string;
  quotes: Quote[];
  returningVisitorQuotes: Quote[];
  footerMessages: { text: string }[];
  globalBanner?: { text: string; isActive: boolean; linkUrl?: string };
  mailchimpListId?: string;
}

export interface Quote {
  quote: string;
  author: string;
  weight: number;
  pinFirst?: boolean;
}

export interface EmployeePick {
  _id: string;
  employeeName: string;
  staffBio?: string;
  pickType: "drinking" | "eating";
  itemName: string;
  message?: string;
}

export interface Event {
  _id: string;
  title: string;
  date: string;
  time?: string;
  location?: { name: string; slug: { current: string } };
  description: string;
  isRecurring: boolean;
  recurrenceNote?: string;
  requiresTicket: boolean;
  ticketUrl?: string;
  externalUrl?: string;
  artistLinks?: { label: string; url: string }[];
  category?: string;
  isPlaceholder?: boolean;
}

export interface TaproomPhoto {
  _id: string;
  image: SanityImage;
  caption?: string;
  location?: { name: string; slug: { current: string } };
  featured: boolean;
}

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: string;
  menuType: "food" | "wine" | "cider" | "na";
  section: string;
  tags?: ("vegetarian" | "vegan" | "glutenFree")[];
  isFanFavorite: boolean;
  isStaffPick: boolean;
  displayOrder?: number;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: "hours" | "visit" | "food" | "drinks" | "events" | "contact" | "general";
  location?: { name: string; slug: { current: string } };
}

export interface OpenClosedStatus {
  isOpen: boolean;
  label: string;
}
