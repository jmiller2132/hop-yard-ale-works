// Static location data — server-side fallback while Sanity is being populated.
// Once Sanity has location documents, these are superseded by CMS data.
// Hours use 12-hour format matching the Sanity schema open/close field convention.

import type { Location } from "@/types";

export const LOCATION_STATIC_DATA: Record<string, Partial<Location>> = {
  appleton: {
    name: "Hop Yard Ale Works — Appleton",
    address: "512 W Northland Ave\nAppleton, WI 54911",
    phone: null as unknown as string,
    orderOnlineUrl:
      "https://order.toasttab.com/online/hop-yard-ale-works-appleton-512-w-northland-ave",
    tagline: "The original taproom.",
    hours: [
      { day: "Monday", open: "", close: "", isClosed: true },
      { day: "Tuesday", open: "", close: "", isClosed: true },
      { day: "Wednesday", open: "11:00 AM", close: "10:00 PM", isClosed: false },
      { day: "Thursday", open: "11:00 AM", close: "10:00 PM", isClosed: false },
      { day: "Friday", open: "11:00 AM", close: "10:00 PM", isClosed: false },
      { day: "Saturday", open: "11:00 AM", close: "10:00 PM", isClosed: false },
    ],
    sundayHours: { open: "12:00 PM", close: "6:00 PM", isClosed: false },
  },
  "the-falls": {
    name: "Hop Yard Ale Works — Menomonee Falls",
    address: "N88W16521 Main St\nMenomonee Falls, WI 53051",
    phone: null as unknown as string,
    orderOnlineUrl:
      "https://order.toasttab.com/online/hop-yard-ale-works-menomonee-falls-n88w16521-main-street",
    tagline: "Pizza-forward taproom.",
    hours: [
      { day: "Monday", open: "", close: "", isClosed: true },
      { day: "Tuesday", open: "4:00 PM", close: "10:00 PM", isClosed: false },
      { day: "Wednesday", open: "4:00 PM", close: "10:00 PM", isClosed: false },
      { day: "Thursday", open: "4:00 PM", close: "10:00 PM", isClosed: false },
      { day: "Friday", open: "11:00 AM", close: "10:00 PM", isClosed: false },
      { day: "Saturday", open: "11:00 AM", close: "10:00 PM", isClosed: false },
    ],
    sundayHours: { open: "", close: "", isClosed: true },
  },
};

export const HOURS_DISPLAY: Record<string, string[]> = {
  appleton: [
    "Wed–Sat  11 AM–10 PM",
    "Sun  12–6 PM",
    "Mon–Tue  Closed",
  ],
  "the-falls": [
    "Tue–Thu  4–10 PM",
    "Fri–Sat  11 AM–10 PM",
    "Sun–Mon  Closed",
  ],
};
