// Run with: node scripts/seed-faqs.mjs
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

const FAQS = [
  // ── Visit Info ────────────────────────────────────────────────────────────
  { _id: "faq-visit-01", question: "Do you take reservations?", answer: "We don't take reservations — it's first come, first served. During busy times there may be a short wait for a table, but we usually turn over pretty quickly. Walk-ins welcome always.", category: "visit" },
  { _id: "faq-visit-02", question: "Is there a cover charge?", answer: "Nope. No cover, ever. Live music nights are free to attend.", category: "visit" },
  { _id: "faq-visit-03", question: "Can I bring kids?", answer: "Yes — we're an all-ages venue. Kids are welcome at both locations.", category: "visit" },
  { _id: "faq-visit-04", question: "Can I bring my dog?", answer: "We love dogs. Well-behaved pups on a leash are welcome in our outdoor seating areas. Check with us on your specific visit as seasonal setups vary.", category: "visit" },
  { _id: "faq-visit-05", question: "Where do I order?", answer: "We don't have servers. Place all orders at the bar — look for the 'Order Here' sign. We'll call your name or bring it to you.", category: "visit" },
  { _id: "faq-visit-06", question: "Can I open a tab?", answer: "Yes. We can open a tab with any valid credit or debit card. We'll hand it right back to you — no personal info is stored. If you need to leave during a busy period, we'll settle the tab with the card on file at the end of the night, including a 15% gratuity.", category: "visit" },
  { _id: "faq-visit-07", question: "Is there parking?", answer: "Yes, there's parking available at both locations. Appleton has street parking and a nearby lot. Menomonee Falls has on-site parking.", category: "visit" },
  { _id: "faq-visit-08", question: "Can I bring outside food or drinks?", answer: "Outside beverages aren't allowed — wristband must be worn to purchase alcohol at ticketed events. Outside food is generally not allowed, but reach out if you have a specific situation.", category: "visit" },

  // ── Hours ─────────────────────────────────────────────────────────────────
  { _id: "faq-hours-01", question: "What are your hours?", answer: "Appleton: Wed–Sat 11 AM–10 PM, Sun 12–6 PM, Mon–Tue Closed.\nMenomonee Falls: Tue–Thu 4–10 PM, Fri–Sat 11 AM–10 PM, Sun–Mon Closed.\nHours may vary on holidays — check our Events page or social media for updates.", category: "hours" },
  { _id: "faq-hours-02", question: "Are you open on holidays?", answer: "We typically close or reduce hours around major holidays. The best way to know is to check our Events page — we post closure and early-close notices there in advance.", category: "hours" },
  { _id: "faq-hours-03", question: "Do both locations have the same hours?", answer: "No — the hours are different. Appleton is the brewhouse and is open Wednesday through Sunday. Menomonee Falls is open Tuesday through Saturday. See our Locations pages for full details.", category: "hours" },

  // ── Food ──────────────────────────────────────────────────────────────────
  { _id: "faq-food-01", question: "What kind of food do you serve?", answer: "We specialize in wood-fired pizza. Both locations have specialty pies, a build-your-own option, and a dessert pizza. Appleton is the full menu location — The Falls focuses primarily on pizza.", category: "food" },
  { _id: "faq-food-02", question: "Is the pizza made from scratch?", answer: "Almost entirely — the dough is the exception. Everything else — sauces, toppings, combinations — is house-made.", category: "food" },
  { _id: "faq-food-03", question: "Do you have gluten-free options?", answer: "We don't offer a gluten-free pizza crust. However, we do carry gluten-free beverages. If you have dietary concerns, our bartenders can walk you through what's available.", category: "food" },
  { _id: "faq-food-04", question: "Can I customize my pizza?", answer: "Yes — we have a Build Your Own option. Start with a base and add toppings from the menu. See the Food menu for full details.", category: "food" },
  { _id: "faq-food-05", question: "Do you deliver or offer takeout?", answer: "You can order online for pickup through Toast at both locations. We don't currently offer delivery.", category: "food" },
  { _id: "faq-food-06", question: "Do you use local ingredients?", answer: "Where we can, yes. We work with several local Wisconsin businesses — including The Meat Block in Greenville and Let It BEE honey, also from Greenville. Ask your bartender about what's local on any given day.", category: "food" },

  // ── Drinks ────────────────────────────────────────────────────────────────
  { _id: "faq-drinks-01", question: "What beers do you have on tap?", answer: "Our tap list rotates regularly. The best way to see what's currently pouring is to check the Untappd embed on our Drinks menu page — it updates in real time.", category: "drinks" },
  { _id: "faq-drinks-02", question: "Where is the beer brewed?", answer: "All of our beer is brewed at our Appleton location, which is the brewhouse for both taprooms.", category: "drinks" },
  { _id: "faq-drinks-03", question: "Do you serve wine?", answer: "Yes — we carry a rotating selection of reds, whites, rosés, and bubbles at both locations. Menomonee Falls also offers wine by the bottle.", category: "drinks" },
  { _id: "faq-drinks-04", question: "Do you have non-alcoholic options?", answer: "Yes, quite a few. We carry non-alcoholic beers, wines, sparkling options, craft sodas, and canned water. See our Drinks menu for the full list.", category: "drinks" },
  { _id: "faq-drinks-05", question: "Do you do beer flights?", answer: "Ask your bartender — flight availability depends on what's on tap and how busy we are. We're happy to help you find something you'll like.", category: "drinks" },
  { _id: "faq-drinks-06", question: "Do the two locations have the same tap list?", answer: "Not always. Both locations pour Hop Yard beers, but the tap list can differ. Appleton is the brewhouse so it often has the freshest and broadest selection.", category: "drinks" },

  // ── Events ────────────────────────────────────────────────────────────────
  { _id: "faq-events-01", question: "How can I find out about upcoming events?", answer: "The best place is our Events page on this site. We also post updates on Instagram and Facebook. Live music is primarily at the Appleton location.", category: "events" },
  { _id: "faq-events-02", question: "Do you host live music?", answer: "Yes — we have live music most Sundays at Appleton. Check the Events page for confirmed dates and artists.", category: "events" },
  { _id: "faq-events-03", question: "Can I host a private event or large group?", answer: "Reach out via the Contact page and select 'Private event / large group' as your subject. Tell us your date, group size, and which location you have in mind and we'll go from there.", category: "events" },

  // ── Contact / General ─────────────────────────────────────────────────────
  { _id: "faq-contact-01", question: "Do you have a phone number?", answer: "We don't have phones at either location. The best way to reach us is through the Contact form on this site, or by messaging us on Instagram or Facebook.", category: "contact" },
  { _id: "faq-contact-02", question: "Who owns Hop Yard Ale Works?", answer: "Hop Yard Ale Works is owned and operated by Oliver and Amy Behm, who grew up in the Fox Valley and built this place out of a shared love for good food, good beer, and good community.", category: "general" },
  { _id: "faq-contact-03", question: "Do you have a loyalty program or merch?", answer: "Not at the moment, but it's something we think about. Follow us on social media for announcements.", category: "general" },
];

console.log(`Seeding ${FAQS.length} FAQs...`);
let ok = 0;
for (const faq of FAQS) {
  try {
    await client.createOrReplace({ ...faq, _type: "faq" });
    process.stdout.write(".");
    ok++;
  } catch (e) {
    console.error(`\n✗ ${faq._id}: ${e.message}`);
  }
}
console.log(`\n✅ Seeded ${ok} FAQs.`);
