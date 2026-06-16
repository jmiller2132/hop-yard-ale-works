// Seeds: Employee Picks + Global Config
// Run with: node scripts/seed-extras.mjs
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

const locRef = (id) => ({ _type: "reference", _ref: id });

const EMPLOYEE_PICKS = [
  {
    _id: "ep-appleton-devon",
    _type: "employeePick",
    employeeName: "Devon",
    location: locRef("location-appleton"),
    pickType: "drinking",
    itemName: "Flight of the Nectaron",
    message: "Every single time.",
    staffBio: "Devon has been behind the Appleton bar long enough to have strong opinions about hop varieties. The Nectaron always wins.",
    isActive: true,
  },
  {
    _id: "ep-appleton-jeff",
    _type: "employeePick",
    employeeName: "Jeff",
    location: locRef("location-appleton"),
    pickType: "eating",
    itemName: "Catalina Wine Mixer",
    message: "Don't overthink it.",
    staffBio: "Jeff will tell you he's tried every pizza on the menu. He's not wrong. The Catalina Wine Mixer keeps coming out on top.",
    isActive: true,
  },
  {
    _id: "ep-appleton-shandi",
    _type: "employeePick",
    employeeName: "Shandi",
    location: locRef("location-appleton"),
    pickType: "drinking",
    itemName: "Overzealous Mariachi Band",
    message: "The name alone should sell you.",
    staffBio: "Shandi picked this one before she even finished the pint. Says the name matches the energy.",
    isActive: true,
  },
  {
    _id: "ep-falls-paris",
    _type: "employeePick",
    employeeName: "Paris",
    location: locRef("location-the-falls"),
    pickType: "drinking",
    itemName: "Mossie's Irish Stout",
    message: "Smooth every time. No notes.",
    staffBio: "Paris has been at The Falls since nearly the beginning. Her go-to hasn't changed in months.",
    isActive: true,
  },
  {
    _id: "ep-falls-riley",
    _type: "employeePick",
    employeeName: "Riley",
    location: locRef("location-the-falls"),
    pickType: "eating",
    itemName: "Should'a Been a Cowboy",
    message: "Get the ranch on the side. Trust me.",
    staffBio: "Riley will recommend this pizza to literally anyone who asks. And some who don't.",
    isActive: true,
  },
  {
    _id: "ep-falls-dave",
    _type: "employeePick",
    employeeName: "Dave",
    location: locRef("location-the-falls"),
    pickType: "drinking",
    itemName: "Running Teeth First",
    message: "Ask me what's in it. I dare you.",
    staffBio: "Dave has been pouring at The Falls long enough to know that the answer is always Running Teeth First.",
    isActive: true,
  },
];

const GLOBAL_CONFIG = {
  _id: "globalConfig",
  _type: "globalConfig",
  siteName: "Hop Yard Ale Works",
  footerMessages: [
    { _key: "fm1", text: "Thanks for supporting local." },
    { _key: "fm2", text: "See you at the bar." },
    { _key: "fm3", text: "Pizza + Pints = Perfect Night." },
    { _key: "fm4", text: "Brewed in Wisconsin. Loved everywhere." },
    { _key: "fm5", text: "We'll save you a stool." },
    { _key: "fm6", text: "Still pouring." },
    { _key: "fm7", text: "Two locations. One vibe." },
  ],
};

async function seed() {
  let ok = 0, fail = 0;

  const docs = [...EMPLOYEE_PICKS, GLOBAL_CONFIG];
  console.log(`Seeding ${docs.length} documents...`);

  for (const doc of docs) {
    try {
      await client.createOrReplace(doc);
      process.stdout.write(".");
      ok++;
    } catch (e) {
      console.error(`\n✗ ${doc._id}: ${e.message}`);
      fail++;
    }
  }

  console.log(`\n✅ Seeded ${ok} documents. ${fail > 0 ? `⚠️  ${fail} failed.` : "All good!"}`);
}

seed().catch((e) => { console.error(e); process.exit(1); });
