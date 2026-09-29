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
  { _id: "faq-hours-01", question: "What are your hours?", answer: "Appleton: Wed–Sat 11 AM–10 PM, Sun 11 AM–4 PM, Mon–Tue Closed.\nMenomonee Falls: Tue–Thu 4–10 PM, Fri–Sat 11 AM–10 PM, Sun 11 AM–4 PM, Mon Closed.\n\nThe kitchen closes one hour before closing time, except Sundays, when it stays open until the 4 PM close.\n\nHours may vary on holidays — check our Events page for closures and early-close notices.", category: "hours" },

  // Gluten-free — full accurate answer
  { _id: "faq-food-03", question: "Do you have gluten-free options?", answer: "Yes — here's the full breakdown:\n\n• Our regular dough is vegan but not gluten-free\n• Our cauliflower crust is gluten-free but not vegan\n• We have a dairy-free cheese made with oat milk\n• Our homemade red sauce is not vegan (ask for garlic oil as a substitute)\n\nAll pizzas are made to order and can accommodate most allergies. However, we cannot guarantee zero cross-contamination of garlic, oil, or flour.\n\nIf you are a true celiac: flour is present in the air in our kitchen and oven, which makes it very difficult to keep a pizza 100% gluten-free. We also use a lot of garlic. If you have severe sensitivities to either, please be aware of that before ordering.", category: "food" },

  // Private events — location-specific accurate answer
  { _id: "faq-events-03", question: "Can I host a private event or large group?", answer: "Yes — details differ by location:\n\n• Appleton: We host private group events on Mondays and Tuesdays when we're closed to the public. Email hopyardaleworks@gmail.com for details.\n• Menomonee Falls: We can accommodate group events any day we're open, but a contract is required to book. Email hopyardthefalls@gmail.com.\n\nOr use the Contact form on this site and select 'Private event / large group' as your subject.", category: "events" },

  // New: allergy handling
  { _id: "faq-food-07", question: "How do you handle dairy, nut, egg, and other allergies?", answer: "We take allergies seriously. When you notify us of an allergy, we'll do our best to clean, sanitize, and isolate your pizza while it's being made.\n\nFor nuts, dairy, egg, fish, shellfish, soy, sesame, or other allergies — ask our staff to check with the kitchen on what's safe. A few things to know:\n• Our house dough is vegan but uses soybean oil\n• Our cauliflower crust is gluten-free but contains eggs and dairy\n• Our red sauce contains fish, basil, and oregano\n\nGarlic and flour are the two ingredients we have the hardest time isolating. If you have a severe allergy to either, please use caution.", category: "food" },

  // Delivery — pickup and delivery are both through Toast
  { _id: "faq-food-05", question: "Do you deliver or offer takeout?", answer: "Yes — you can order online for pickup or delivery through Toast at both locations.", category: "food" },

  // Hours comparison — The Falls is open Sundays again
  { _id: "faq-hours-03", question: "Do both locations have the same hours?", answer: "No — the hours are different. Appleton is the brewhouse and is open Wednesday through Sunday. Menomonee Falls is open Tuesday through Sunday. See our Locations pages for full details.", category: "hours" },

  // Live music — not during football season
  { _id: "faq-events-02", question: "Do you host live music?", answer: "Yes — we have live music most Sundays at Appleton outside of football season. Check the Events page for confirmed dates and artists.", category: "events" },

  // Owner corrections (CHATBOT_OWNER_QUESTIONS.md)
  { _id: "faq-visit-06", question: "Can I open a tab?", answer: "Yes. We can open a tab with any valid credit or debit card. We'll hand it right back to you — no personal info is stored. If you need to leave during a busy period, we'll settle the tab with the card on file at the end of the night, including a 15% gratuity.\n\nIf you pay with tap to pay (Apple Pay, Google Pay, etc.), we can't keep a tab open — you'll close out each time.", category: "visit" },
  { _id: "faq-visit-07", question: "Is there parking?", answer: "Yes, there's parking available at both locations. Appleton has on-site parking. Menomonee Falls has street parking and a nearby lot.", category: "visit" },
  { _id: "faq-visit-08", question: "Can I bring outside food or drinks?", answer: "Outside beverages aren't allowed. Outside food is generally not allowed, but reach out if you have a specific situation.", category: "visit" },
  { _id: "faq-food-06", question: "Do you use local ingredients?", answer: "At our Appleton location, yes. We work with several local Wisconsin businesses — including The Meat Block in Greenville and Let It BEE honey, also from Greenville. Ask your bartender about what's local on any given day.", category: "food" },

  // Owner answers (CHATBOT_OWNER_QUESTIONS.md)
  { _id: "faq-visit-09", question: "What forms of payment do you take?", answer: "We take cash, credit and debit cards, and tap to pay, including Apple Pay and Google Pay. If you pay with tap to pay, we can't keep a tab open — you'll close out each time.", category: "visit" },
  { _id: "faq-visit-10", question: "Can we split the check?", answer: "Yes — groups can split the check or pay on separate cards.", category: "visit" },
  { _id: "faq-visit-11", question: "Are you wheelchair accessible?", answer: "Yes — both locations are wheelchair accessible, including the entrances and restrooms.", category: "visit" },
  { _id: "faq-visit-12", question: "Do you have high chairs or a changing table?", answer: "Yes — we have high chairs, boosters, and a changing table.", category: "visit" },
  { _id: "faq-visit-13", question: "Do you have TVs? Do you show the Packers game?", answer: "Yes — we have TVs and show Packers games and other sports.", category: "visit" },
  { _id: "faq-visit-14", question: "Do you have Wi-Fi?", answer: "Yes — we have guest Wi-Fi.", category: "visit" },
  { _id: "faq-visit-15", question: "Do you have games?", answer: "Yes — we have board games, cards, and more.", category: "visit" },
  { _id: "faq-visit-16", question: "How busy does it get?", answer: "It can get pretty busy. We don't take reservations, so if you're coming with a group, it helps to arrive a little early and hold tables (up to 3 per group).", category: "visit" },
  { _id: "faq-visit-17", question: "Do you have a patio?", answer: "Appleton has an outside patio and Menomonee Falls has a back patio. Patio seating is seasonal, and the patios aren't heated. Well-behaved, leashed dogs are welcome out there too.", category: "visit" },
  { _id: "faq-visit-18", question: "How old do you have to be to drink?", answer: "You must be 21 or older to be served alcohol.", category: "visit" },
  { _id: "faq-food-08", question: "Do you have a kids menu?", answer: "No — we don't have a kids menu or kid-size options.", category: "food" },
  { _id: "faq-drinks-07", question: "Do you sell beer to go?", answer: "Yes — we sell 4-packs of select beers to go.", category: "drinks" },
  { _id: "faq-drinks-08", question: "Do you serve cocktails or liquor?", answer: "We carry some ready-to-drink (RTD) cocktails, along with beer, wine, cider, and seltzer.", category: "drinks" },
  { _id: "faq-drinks-09", question: "Do you offer brewery tours?", answer: "No — we don't offer brewery tours.", category: "drinks" },
  { _id: "faq-events-04", question: "How can my band play at Hop Yard?", answer: "Bands and musicians can reach out by sending us a message through the contact form.", category: "events" },
  { _id: "faq-contact-04", question: "I left something behind. What should I do?", answer: "Send us a message through the contact form and let us know what you left and at which location.", category: "contact" },
  { _id: "faq-contact-05", question: "How do I ask about donations, fundraisers, or sponsorships?", answer: "Send us a message through the contact form with the details.", category: "contact" },
  { _id: "faq-general-01", question: "Do you sell gift cards?", answer: "Yes — gift cards are available in person and online.", category: "general" },
  { _id: "faq-general-02", question: "Do you have a happy hour or daily specials?", answer: "No — we don't run a happy hour, daily specials, or discounts.", category: "general" },
  { _id: "faq-general-03", question: "Do you cater?", answer: "No — we don't cater off-site.", category: "general" },

  // New: kitchen closing time (standalone)
  { _id: "faq-hours-04", question: "When does the kitchen close?", answer: "The kitchen closes one hour before the taproom's closing time at both locations, except Sundays, when the kitchen stays open until the 4 PM close.", category: "hours" },
];

console.log(`Patching ${PATCHES.length} FAQs...`);
let ok = 0;
for (const faq of PATCHES) {
  try {
    const { _id, ...fields } = faq;
    await client
      .transaction()
      .createIfNotExists({ _id, _type: "faq", ...fields })
      .patch(_id, (p) => p.set(fields))
      .commit();
    process.stdout.write(".");
    ok++;
  } catch (e) {
    console.error(`\n✗ ${faq._id}: ${e.message}`);
  }
}
console.log(`\n✅ Patched ${ok} FAQs.`);
