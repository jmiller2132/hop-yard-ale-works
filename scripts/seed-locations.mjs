// Run with: node scripts/seed-locations.mjs
// Requires SANITY_API_WRITE_TOKEN in .env.local (needs Editor or higher permissions)

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

// Read token from .env.local
const env = readFileSync(".env.local", "utf8");
const token = env.match(/SANITY_API_WRITE_TOKEN=(.+)/)?.[1]?.trim()
  ?? env.match(/SANITY_API_READ_TOKEN=(.+)/)?.[1]?.trim();

if (!token) {
  console.error("No token found in .env.local. Add SANITY_API_WRITE_TOKEN=<your-token>");
  process.exit(1);
}

const client = createClient({
  projectId: "huwr3nhe",
  dataset: "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const locations = [
  {
    _id: "location-appleton",
    _type: "location",
    name: "Hop Yard Ale Works — Appleton",
    slug: { _type: "slug", current: "appleton" },
    address: "512 W Northland Ave\nAppleton, WI 54911",
    googleMapsUrl: "https://maps.app.goo.gl/9N2389HKdPiMQgzL7",
    orderOnlineUrl: "https://order.toasttab.com/online/hop-yard-ale-works-appleton-512-w-northland-ave",
    tagline: "The original brewhouse & taproom.",
    hours: [
      { _key: "mon", day: "Monday",    open: "",         close: "",         isClosed: true  },
      { _key: "tue", day: "Tuesday",   open: "",         close: "",         isClosed: true  },
      { _key: "wed", day: "Wednesday", open: "11:00 AM", close: "10:00 PM", isClosed: false },
      { _key: "thu", day: "Thursday",  open: "11:00 AM", close: "10:00 PM", isClosed: false },
      { _key: "fri", day: "Friday",    open: "11:00 AM", close: "10:00 PM", isClosed: false },
      { _key: "sat", day: "Saturday",  open: "11:00 AM", close: "10:00 PM", isClosed: false },
    ],
    sundayHours: { open: "12:00 PM", close: "6:00 PM", isClosed: false },
  },
  {
    _id: "location-the-falls",
    _type: "location",
    name: "Hop Yard Ale Works — Menomonee Falls",
    slug: { _type: "slug", current: "the-falls" },
    address: "N88W16521 Main St\nMenomonee Falls, WI 53051",
    googleMapsUrl: "https://maps.app.goo.gl/DWFo5Du6CZfUqkt7A",
    orderOnlineUrl: "https://order.toasttab.com/online/hop-yard-ale-works-menomonee-falls-n88w16521-main-street",
    tagline: "Pizza-forward taproom.",
    hours: [
      { _key: "mon", day: "Monday",    open: "",         close: "",         isClosed: true  },
      { _key: "tue", day: "Tuesday",   open: "4:00 PM",  close: "10:00 PM", isClosed: false },
      { _key: "wed", day: "Wednesday", open: "4:00 PM",  close: "10:00 PM", isClosed: false },
      { _key: "thu", day: "Thursday",  open: "4:00 PM",  close: "10:00 PM", isClosed: false },
      { _key: "fri", day: "Friday",    open: "11:00 AM", close: "10:00 PM", isClosed: false },
      { _key: "sat", day: "Saturday",  open: "11:00 AM", close: "10:00 PM", isClosed: false },
    ],
    sundayHours: { open: "", close: "", isClosed: true },
  },
];

console.log("Seeding locations...");
for (const loc of locations) {
  try {
    const result = await client.createOrReplace(loc);
    console.log(`✓ ${result.name}`);
  } catch (err) {
    console.error(`✗ ${loc.name}:`, err.message);
    if (err.message.includes("Insufficient permissions") || err.statusCode === 403) {
      console.error("\nYour token doesn't have write access.");
      console.error("Create a new token at https://www.sanity.io/manage/personal/project/huwr3nhe/api");
      console.error("Choose 'Editor' or higher, then add it to .env.local as SANITY_API_WRITE_TOKEN=<token>");
      process.exit(1);
    }
  }
}

console.log("\nDone! Refresh Sanity Studio to see the locations.");
