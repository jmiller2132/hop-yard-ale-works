// Patches incorrect FAQs and adds missing ones based on live site content
// Run with: node scripts/patch-faqs.mjs
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const token =
  env.match(/SANITY_API_WRITE_TOKEN=(.+)/)?.[1]?.trim() ??
  env.match(/SANITY_API_READ_TOKEN=(.+)/)?.[1]?.trim();

const client = createClient({
  projectId: "huwr3nhe",
  dataset: "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const PATCHES = [
  // Reservations — add table-holding detail
  { _id: "faq-visit-01", question: "Do you take reservations?", answer: "We don't take reservations — it's first come, first served. Being a brewery, it's very hard to anticipate how long a group will stay.\n\nYou're welcome to come in a little early and hold tables for your group. Maximum of 3 tables for any one group.", category: "visit" },

  // Dogs — location-specific
  { _id: "faq-visit-04", question: "Are you dog friendly?", answer: "Yes, with conditions:\n\n• Appleton: outside patio only\n• Menomonee Falls: back patio and front sidewalks\n\nDogs must be well-behaved and on a leash at all times. Registered service animals are welcome inside with proof of certification.", category: "visit" },

  // Hours — add kitchen closing note
  { _id: "faq-hours-01", question: "What are your hours?", answer: "Appleton: Wed–Sat 11 AM–10 PM, Sun 12–6 PM, Mon–Tue Closed.\nMenomonee Falls: Tue–Thu 4–10 PM, Fri–Sat 11 AM–10 PM, Sun–Mon Closed.\n\nThe kitchen closes one hour before the stated closing time.\n\nHours may vary on holidays — check our Events page for closures and early-close notices.", category: "hours" },

  // Gluten-free — full accurate answer
  { _id: "faq-food-03", question: "Do you have gluten-free options?", answer: "Yes — here's the full breakdown:\n\n• Our regular dough is vegan but not gluten-free\n• Our cauliflower crust is gluten-free but not vegan\n• We have a dairy-free cheese made with oat milk\n• Our homemade red sauce is not vegan (ask for garlic oil as a substitute)\n\nAll pizzas are made to order and can accommodate most allergies. However, we cannot guarantee zero cross-contamination of garlic, oil, or flour.\n\nIf you are a true celiac: flour is present in the air in our kitchen and oven, which makes it very difficult to keep a pizza 100% gluten-free. We also use a lot of garlic. If you have severe sensitivities to either, please be aware of that before ordering.", category: "food" },

  // Private events — location-specific accurate answer
  { _id: "faq-events-03", question: "Can I host a private event or large group?", answer: "Yes — details differ by location:\n\n• Appleton: We host private group events on Mondays and Tuesdays when we're closed to the public. Email hopyardaleworks@gmail.com for details.\n• Menomonee Falls: We can accommodate group events any day we're open, but a contract is required to book. Email hopyardthefalls@gmail.com.\n\nOr use the Contact form on this site and select 'Private event / large group' as your subject.", category: "events" },

  // New: allergy handling
  { _id: "faq-food-07", question: "How do you handle dairy, nut, egg, and other allergies?", answer: "We take allergies seriously. When you notify us of an allergy, we'll do our best to clean, sanitize, and isolate your pizza while it's being made.\n\nFor nuts, dairy, egg, fish, shellfish, soy, sesame, or other allergies — ask our staff to check with the kitchen on what's safe. A few things to know:\n• Our house dough is vegan but uses soybean oil\n• Our cauliflower crust is gluten-free but contains eggs and dairy\n• Our red sauce contains fish, basil, and oregano\n\nGarlic and flour are the two ingredients we have the hardest time isolating. If you have a severe allergy to either, please use caution.", category: "food" },

  // New: kitchen closing time (standalone)
  { _id: "faq-hours-04", question: "When does the kitchen close?", answer: "The kitchen closes one hour before the taproom's stated closing time at both locations.", category: "hours" },
];

console.log(`Patching ${PATCHES.length} FAQs...`);
let ok = 0;
for (const faq of PATCHES) {
  try {
    await client.createOrReplace({ ...faq, _type: "faq" });
    process.stdout.write(".");
    ok++;
  } catch (e) {
    console.error(`\n✗ ${faq._id}: ${e.message}`);
  }
}
console.log(`\n✅ Patched ${ok} FAQs.`);
