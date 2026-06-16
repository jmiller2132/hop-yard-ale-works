// Patches Appleton food item section names from "Specialty Pizzas"
// to "The Basics" or "Our Creations", and adds Snacks items.
// Run with: node scripts/patch-sections.mjs

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const token = env.match(/SANITY_API_WRITE_TOKEN=(.+)/)?.[1]?.trim();
const client = createClient({
  projectId: "huwr3nhe", dataset: "production",
  apiVersion: "2024-01-01", token, useCdn: false,
});

// The Basics = steadfast, always on menu
const THE_BASICS = [
  "mi-app-food-07", // Italian Dunkers
  "mi-app-food-08", // Fancy Pants
  "mi-app-food-09", // My Fav
  "mi-app-food-10", // First Timer
  "mi-app-food-11", // Old Reliable
  "mi-app-food-12", // Bits & Bobs
  "mi-app-food-13", // Winner Winner Chicken Dinner
];

// Our Creations = rotating ~every 2 months
const OUR_CREATIONS = [
  "mi-app-food-01", // Watermelon Sugar Pie
  "mi-app-food-02", // Should'a Been a Cowboy
  "mi-app-food-03", // Catalina Wine Mixer
  "mi-app-food-04", // Cheeseburger in Paradise
  "mi-app-food-05", // The Italian Job
  "mi-app-food-06", // Big Bang-Bang Theory
  "mi-app-food-14", // 99 Corvette
  "mi-app-food-15", // White Lightning
];

const SNACKS = [
  {
    _id: "mi-app-snack-01",
    _type: "menuItem",
    name: "Popcorn",
    description: "House popcorn.",
    price: "$5",
    location: { _type: "reference", _ref: "location-appleton" },
    menuType: "food",
    section: "Snacks",
    displayOrder: 1,
    tags: ["vegan", "glutenFree"],
    isActive: true,
  },
  {
    _id: "mi-app-snack-02",
    _type: "menuItem",
    name: "Chips",
    description: "Bar chips.",
    price: "$2",
    location: { _type: "reference", _ref: "location-appleton" },
    menuType: "food",
    section: "Snacks",
    displayOrder: 2,
    tags: ["vegan", "glutenFree"],
    isActive: true,
  },
];

async function run() {
  console.log("Patching section names...");

  for (const id of THE_BASICS) {
    await client.patch(id).set({ section: "The Basics" }).commit();
    process.stdout.write(".");
  }
  for (const id of OUR_CREATIONS) {
    await client.patch(id).set({ section: "Our Creations" }).commit();
    process.stdout.write(".");
  }

  console.log("\nAdding snacks...");
  for (const doc of SNACKS) {
    await client.createOrReplace(doc);
    process.stdout.write(".");
  }

  console.log("\n✅ Done.");
}

run().catch((e) => { console.error(e); process.exit(1); });
