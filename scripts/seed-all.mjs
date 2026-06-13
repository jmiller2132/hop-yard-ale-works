// Comprehensive Sanity seed script
// Run with: node scripts/seed-all.mjs
// Requires SANITY_API_WRITE_TOKEN in .env.local (Editor permissions or higher)

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const token =
  env.match(/SANITY_API_WRITE_TOKEN=(.+)/)?.[1]?.trim() ??
  env.match(/SANITY_API_READ_TOKEN=(.+)/)?.[1]?.trim();

if (!token) {
  console.error("No token found. Add SANITY_API_WRITE_TOKEN=<editor-token> to .env.local");
  process.exit(1);
}

const client = createClient({
  projectId: "huwr3nhe",
  dataset: "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

async function upsert(doc) {
  return client.createOrReplace(doc);
}

// ─── LOCATIONS ────────────────────────────────────────────────────────────────
const LOCATIONS = [
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
      { _key: "mon", day: "Monday",    open: "",        close: "",         isClosed: true  },
      { _key: "tue", day: "Tuesday",   open: "4:00 PM", close: "10:00 PM", isClosed: false },
      { _key: "wed", day: "Wednesday", open: "4:00 PM", close: "10:00 PM", isClosed: false },
      { _key: "thu", day: "Thursday",  open: "4:00 PM", close: "10:00 PM", isClosed: false },
      { _key: "fri", day: "Friday",    open: "11:00 AM", close: "10:00 PM", isClosed: false },
      { _key: "sat", day: "Saturday",  open: "11:00 AM", close: "10:00 PM", isClosed: false },
    ],
    sundayHours: { open: "", close: "", isClosed: true },
  },
];

// ─── EVENTS ───────────────────────────────────────────────────────────────────
const locRef = (slug) =>
  slug === "appleton"
    ? { _type: "reference", _ref: "location-appleton" }
    : slug === "the-falls"
    ? { _type: "reference", _ref: "location-the-falls" }
    : undefined;

const EVENTS = [
  { _id: "event-jun-14", title: "Live Music: Jackson Mankowski", date: "2026-06-14", time: "6:00 PM", category: "Live Music", locationSlug: "appleton", description: "Appleton singer-songwriter blending folk, pop, R&B, and blues. Free to attend.", artistLinks: [{ _key: "spotify", label: "Spotify", url: "https://open.spotify.com/artist/6oMfxwBYVpGlYBNfVqPeZ9" }], isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-jun-20-ipa", title: "Wisconsin West Coast IPA Invitational", date: "2026-06-20", time: "2:00 PM – 6:30 PM", category: "Out & About", description: "Hop Yard is one of 11 Wisconsin breweries pouring at McFleshman's birthday bash turned statewide showcase. Taste through a lineup of West Coast IPAs, doubles, triples, and sessions — then vote for your favorite. Every ticket includes a commemorative tasting glass. Music in the beer garden starts at 7 PM.", externalUrl: "https://www.hometowntickets.com/events/wisconsin-west-coast-ipa-invitational", isRecurring: false, requiresTicket: true, ticketUrl: "https://www.hometowntickets.com/events/wisconsin-west-coast-ipa-invitational", isActive: true },
  { _id: "event-jun-21", title: "Live Music: Sam of Foocoustics", date: "2026-06-21", time: "6:00 PM", category: "Live Music", locationSlug: "appleton", description: "Live acoustic performance. Free to attend.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-jun-28", title: "Live Music: Acoustic Jukebox", date: "2026-06-28", time: "6:00 PM", category: "Live Music", locationSlug: "appleton", description: "Live acoustic performance. Free to attend.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-jul-03-app", title: "Closing Early Tonight — Last Call at 8 PM", date: "2026-07-03", category: "Closure", locationSlug: "appleton", description: "We're closing at 8 PM tonight. Both locations closed July 4–7. Happy 4th — go blow something up responsibly.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-jul-03-falls", title: "Closing Early Tonight — Last Call at 8 PM", date: "2026-07-03", category: "Closure", locationSlug: "the-falls", description: "We're closing at 8 PM tonight. Both locations closed July 4–7. See you the following week.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-jul-12", title: "Live Music: Brady James", date: "2026-07-12", time: "6:00 PM", category: "Live Music", locationSlug: "appleton", description: "Live acoustic performance. Free to attend.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-jul-16-paperfest", title: "Paperfest — Craft Beer & Food Truck Rally", date: "2026-07-16", time: "July 16–19", category: "Out & About", description: "Hop Yard is pouring at the Paperfest Craft Beer Tent — find us at Sunset Park in Kimberly. Sip our Here's My Number, Call Me Hazy and Maui Waui Seltzer alongside brews from other local Wisconsin breweries. Free admission. 100% of beverage proceeds benefit local nonprofits.", externalUrl: "https://www.paperfest.com", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-jul-17-flix", title: "Flicks & Sips: Back to the Future", date: "2026-07-17", time: "6:00 PM", category: "Out & About", locationSlug: "appleton", description: "Outdoor movie night at Jones Park Amphitheater, Appleton. Hop Yard Ale Works is pouring — grab a beer, grab a blanket, and watch Marty McFly sort out his parents. Food and drinks start at 6 PM, movie at 7 PM. Bring a lawn chair.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-jul-19", title: "Live Music: Adrian Lambrecht", date: "2026-07-19", time: "6:00 PM", category: "Live Music", locationSlug: "appleton", description: "Live acoustic performance. Free to attend.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-jul-26", title: "Live Music: Michael Grabner", date: "2026-07-26", time: "6:00 PM", category: "Live Music", locationSlug: "appleton", description: "Live acoustic performance. Free to attend.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-aug-01", title: "Tap Release: Summer Haze IPA", date: "2026-08-01", time: "12:00 PM", category: "Tap Release", locationSlug: "appleton", description: "Our summer seasonal hits the taps. Hazy, juicy, low bitterness — brewed for days like this. Available at both locations while it lasts.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-aug-02", title: "Live Music: Jake Wheeler", date: "2026-08-02", time: "6:00 PM", category: "Live Music", locationSlug: "appleton", description: "Live acoustic performance. Free to attend.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-aug-13", title: "Trivia Night", date: "2026-08-13", time: "7:00 PM", category: "Special", locationSlug: "the-falls", description: "Pub trivia at The Falls. Teams up to 6. No signup required — just show up. Prizes for the top three teams.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-aug-16", title: "Live Music: The Foxcroft Duo", date: "2026-08-16", time: "6:00 PM", category: "Live Music", locationSlug: "appleton", description: "Live acoustic performance. Free to attend.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-sep-12-tap", title: "Tap Release: Oktoberfest Märzen", date: "2026-09-12", time: "12:00 PM", category: "Tap Release", locationSlug: "appleton", description: "Our fall seasonal is here. Malty, toasty, clean finish — everything a Märzen should be. Brewed in-house, available at both locations.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-sep-12-flix", title: "Flicks & Sips: Hot Rod", date: "2026-09-12", time: "6:00 PM", category: "Out & About", locationSlug: "appleton", description: "Outdoor movie night at Jones Park Amphitheater, Appleton. Hop Yard Ale Works is pouring. Food and drinks start at 6 PM, movie at 7 PM. Bring a lawn chair.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-sep-13", title: "Live Music: Danny Malone", date: "2026-09-13", time: "6:00 PM", category: "Live Music", locationSlug: "appleton", description: "Live acoustic performance. Free to attend.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-sep-20", title: "Tap Takeover: Guest Brewery Night", date: "2026-09-20", time: "4:00 PM", category: "Special", locationSlug: "the-falls", description: "We're pulling a few guest taps and letting another Wisconsin brewery take up some real estate. Details coming soon.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-sep-27", title: "Live Music: River City Blues", date: "2026-09-27", time: "6:00 PM", category: "Live Music", locationSlug: "appleton", description: "Live acoustic performance. Free to attend.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-oct-03", title: "Oktoberfest Party", date: "2026-10-03", time: "12:00 PM", category: "Special", locationSlug: "appleton", description: "Lederhosen optional. Märzen required. Seasonal specials and a good excuse to be outside before it gets cold.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-oct-11", title: "Live Music: Mike Patterson", date: "2026-10-11", time: "6:00 PM", category: "Live Music", locationSlug: "appleton", description: "Live acoustic performance. Free to attend.", isRecurring: false, requiresTicket: false, isActive: true },
  { _id: "event-oct-25", title: "Halloween Pre-Party + Costume Contest", date: "2026-10-25", time: "5:00 PM", category: "Special", locationSlug: "appleton", description: "Come in costume. Prizes for best dressed. Seasonal beer, pizza, and the general chaos of a Saturday night in October.", isRecurring: false, requiresTicket: false, isActive: true },
];

// ─── MENU ITEMS ───────────────────────────────────────────────────────────────
function menuDoc(id, name, description, price, locationId, menuType, section, displayOrder, tags = [], extras = {}) {
  return {
    _id: id,
    _type: "menuItem",
    name,
    description,
    price,
    location: { _type: "reference", _ref: locationId },
    menuType,
    section,
    displayOrder,
    tags,
    isActive: true,
    ...extras,
  };
}

const APPLETON_ID = "location-appleton";
const FALLS_ID = "location-the-falls";

const MENU_ITEMS = [
  // ── Appleton Food ─────────────────────────────────────────────────────────
  menuDoc("mi-app-food-01", "Watermelon Sugar Pie", "Oil · Garlic · Herb Chèvre · Smoked Tomato · Jalapeño · Mint · Watermelon · Jalapeño-Lime Vinaigrette · Honey Crystals", "$16", APPLETON_ID, "food", "Specialty Pizzas", 1, ["vegetarian"]),
  menuDoc("mi-app-food-02", "Should'a Been a Cowboy", "Jalapeño Aioli · Cheddar · Meat Block Hot Dogs · Bacon · Sautéed Onion · BBQ · Chili Cheese Fritos", "$17", APPLETON_ID, "food", "Specialty Pizzas", 2),
  menuDoc("mi-app-food-03", "Catalina Wine Mixer", "Red Sauce · Herb Chèvre · Garlic · Basil · Oregano · Sautéed Onion · Bacon · Orange Honey", "$17", APPLETON_ID, "food", "Specialty Pizzas", 3),
  menuDoc("mi-app-food-04", "Cheeseburger in Paradise", "Mac Sauce · Cheddar · Ground Beef · Onion · Pickles · Tomato · Lettuce · House-Made Ketchup · Sesame Seeds", "$18", APPLETON_ID, "food", "Specialty Pizzas", 4),
  menuDoc("mi-app-food-05", "The Italian Job", "Pesto · Fresh Mozzarella · Garlic · Sliced Tomato · Blackberry-Ginger Balsamic", "$16", APPLETON_ID, "food", "Specialty Pizzas", 5),
  menuDoc("mi-app-food-06", "Big Bang-Bang Theory", "Bang Sauce · Mozzarella · Chicken · Onion · Red Pepper · Fresh Cucumber · Sugar Snap Pea Pods · Cilantro", "$17", APPLETON_ID, "food", "Specialty Pizzas", 6),
  menuDoc("mi-app-food-07", "Italian Dunkers", "EVOO · Garlic · Mozzarella · Red Sauce as Dip (Cut in Strips)", "$12", APPLETON_ID, "food", "Specialty Pizzas", 7, ["vegetarian"]),
  menuDoc("mi-app-food-08", "Fancy Pants (Cheese!)", "Red Sauce · Mozzarella", "$12", APPLETON_ID, "food", "Specialty Pizzas", 8, ["vegetarian"]),
  menuDoc("mi-app-food-09", "My Fav", "Red Sauce · Mozzarella · Garlic · Tomatoes · Basil", "$13", APPLETON_ID, "food", "Specialty Pizzas", 9, ["vegetarian"]),
  menuDoc("mi-app-food-10", "First Timer", "Red Sauce · Mozzarella · Pepperoni · Sausage", "$16", APPLETON_ID, "food", "Specialty Pizzas", 10),
  menuDoc("mi-app-food-11", "Old Reliable", "Red Sauce · Mozzarella · Pepperoni · Sausage · Onion · Mushroom", "$17", APPLETON_ID, "food", "Specialty Pizzas", 11),
  menuDoc("mi-app-food-12", "Bits & Bobs", "Red Sauce · Mozzarella · Sausage · Mushroom", "$14", APPLETON_ID, "food", "Specialty Pizzas", 12),
  menuDoc("mi-app-food-13", "Winner Winner Chicken Dinner", "White Sauce · Mozzarella · Chicken · Mushroom · Garlic · Basil · Wine", "$16", APPLETON_ID, "food", "Specialty Pizzas", 13),
  menuDoc("mi-app-food-14", "99 Corvette", "Red Sauce · Mozzarella · Garlic · Basil · Pepperoni · Ricotta · Hot Honey", "$17", APPLETON_ID, "food", "Specialty Pizzas", 14),
  menuDoc("mi-app-food-15", "White Lightning", "White Sauce · Mozzarella · Pepperoni · Garlic · Basil · Jalapeño · Pepperoncini", "$16", APPLETON_ID, "food", "Specialty Pizzas", 15),
  menuDoc("mi-app-food-16", "Cookie-Za", "Double Chocolate Cookie · Whipped Vanilla Frosting · Banana · Strawberry · Pineapple Boba · Hershey's Syrup · Cherry on Top (served cold)", "$15", APPLETON_ID, "food", "Dessert", 16),
  menuDoc("mi-app-food-17", "Build Your Own — Base", "House-made, wood-fired tomato sauce & Mozzarella Cheese. Add toppings below.", "$12", APPLETON_ID, "food", "Build Your Own", 17, ["vegetarian"]),

  // ── Appleton Wine ─────────────────────────────────────────────────────────
  menuDoc("mi-app-wine-01", "Tommasi 'Rafaèl'", "Valpolicella Blend. Fresh and elegant Italian red with aromas of cherry, dried spice, and sage. Bright red fruit, velvety tannins, lively acidity.", "$11", APPLETON_ID, "wine", "Red", 1),
  menuDoc("mi-app-wine-02", "Hedges Family Estate", "Cabernet Sauvignon, Merlot & Syrah Blend. Rich and structured with aromas of black cherry, raspberry, cocoa, and warm spice.", "$11", APPLETON_ID, "wine", "Red", 2),
  menuDoc("mi-app-wine-03", "Selbach 'Incline'", "Riesling. Bright off-dry Riesling from steep slate slopes. Floral, waxy nose with juicy fruit flavors, vibrant acidity, and a clean mineral-driven finish.", "$10", APPLETON_ID, "wine", "White", 3),
  menuDoc("mi-app-wine-04", "Kings Ridge", "Pinot Gris. Fragrant nose of green apple, white pear, and honeysuckle. Fresh and crisp with a medium body and a subtle herbal note on the finish.", "$10", APPLETON_ID, "wine", "White", 4),
  menuDoc("mi-app-wine-05", "Garofoli Rosé", "Dry Rosé — Montepulciano. Bright aromas of strawberry, cherry, and white peach. Lively, savory acidity with a touch of sea salt on the finish.", "$10", APPLETON_ID, "wine", "White", 5),
  menuDoc("mi-app-wine-06", "Pizzolato Sparkling Prosecco Rosé", "Lemon Chiffon & Ripe Apple · Strawberry & Peach · Lean & Dry finish", "$10 / split", APPLETON_ID, "wine", "Bubbles", 6),
  menuDoc("mi-app-wine-07", "Pizzolato Sparkling Moscato", "Sweet · Delicate bubbles", "$10 / split", APPLETON_ID, "wine", "Bubbles", 7),

  // ── Appleton Ciders & Seltzers ────────────────────────────────────────────
  menuDoc("mi-app-cider-01", "Untitled Art: Florida Seltzer — Blood Orange Pomegranate", "Hard seltzer made with real fruit juice. Rich, fruit-forward flavor. 12 oz can.", "$7", APPLETON_ID, "cider", "Ciders & Seltzers", 1),
  menuDoc("mi-app-cider-02", "Untitled Art: Florida Seltzer — Blackberry Agave", "Hard seltzer made with real fruit juice. Rich, fruit-forward flavor. 12 oz can.", "$7", APPLETON_ID, "cider", "Ciders & Seltzers", 2),
  menuDoc("mi-app-cider-03", "Humble Forager: Humble Bumble", "Gluten-free buzzed seltzer made with 100% real fruit and natural honey. Rotating flavors. 16 oz can.", "$7", APPLETON_ID, "cider", "Ciders & Seltzers", 3, ["glutenFree"]),
  menuDoc("mi-app-cider-04", "Hard Ciders — Rotating Flavors", "Ask your bartender what's available. 12 oz can.", "$7", APPLETON_ID, "cider", "Ciders & Seltzers", 4),
  menuDoc("mi-app-cider-05", "Hinterland: Saving Gracie Vienna Lager", "Gluten-free beer. 5% ABV. 12 oz can.", "$5", APPLETON_ID, "cider", "Ciders & Seltzers", 5, ["glutenFree"]),

  // ── Appleton Non-Alcoholic ────────────────────────────────────────────────
  menuDoc("mi-app-na-01", "Buzzkill N/A Sauvignon Blanc", "Non-alcoholic wine. Gluten-free. 250mL can.", "$5", APPLETON_ID, "na", "Non-Alcoholic", 1, ["glutenFree"]),
  menuDoc("mi-app-na-02", "Buzzkill N/A Sparkling Sauvignon Blanc", "Non-alcoholic sparkling wine. Gluten-free. 250mL can.", "$5", APPLETON_ID, "na", "Non-Alcoholic", 2, ["glutenFree"]),
  menuDoc("mi-app-na-03", "Untitled Art — N/A Grapefruit Radler", "Non-alcoholic beer. 12 oz can.", "$5", APPLETON_ID, "na", "Non-Alcoholic", 3),
  menuDoc("mi-app-na-04", "Untitled Art — N/A Italian Pilsner", "Non-alcoholic beer. 12 oz can.", "$5", APPLETON_ID, "na", "Non-Alcoholic", 4),
  menuDoc("mi-app-na-05", "Untitled Art — N/A Juicy IPA", "Non-alcoholic IPA. 12 oz can.", "$5", APPLETON_ID, "na", "Non-Alcoholic", 5),
  menuDoc("mi-app-na-06", "Untitled Art — N/A Mango Dragonfruit Sour", "Non-alcoholic sour. 12 oz can.", "$5", APPLETON_ID, "na", "Non-Alcoholic", 6),
  menuDoc("mi-app-na-07", "Liquid Death Canned Water", "Sparkling flavored water. Regular · Sparkling · Tangerine · Lime · Cherry · Doctor Death. 16 oz can.", "$2", APPLETON_ID, "na", "Non-Alcoholic", 7),
  menuDoc("mi-app-na-08", "Liquid Death Canned Iced Tea", "Arnold Palmer or Peach Tea. 16 oz can.", "$3", APPLETON_ID, "na", "Non-Alcoholic", 8),
  menuDoc("mi-app-na-09", "Potosi Root Beer", "Craft root beer from Potosi Brewing Co. 12 oz bottle.", "$3.50", APPLETON_ID, "na", "Non-Alcoholic", 9),
  menuDoc("mi-app-na-10", "Potosi Orange Cream Soda", "Craft orange cream soda from Potosi Brewing Co. 12 oz bottle.", "$3.50", APPLETON_ID, "na", "Non-Alcoholic", 10),
  menuDoc("mi-app-na-11", "Mexican Coca-Cola", "Classic Coca-Cola in a glass bottle. 12 oz bottle.", "$3.50", APPLETON_ID, "na", "Non-Alcoholic", 11),
  menuDoc("mi-app-na-12", "Can Soda", "Diet Coke · Sprite · Lemonade. 12 oz can.", "$1", APPLETON_ID, "na", "Non-Alcoholic", 12),

  // ── The Falls Wine ────────────────────────────────────────────────────────
  menuDoc("mi-falls-wine-01", "Clous De Fous Pinot Noir", "Pinot Noir. Medium bodied, crisp light finish.", "$12 G · $46 B", FALLS_ID, "wine", "Red", 1),
  menuDoc("mi-falls-wine-02", "Cline Zinfandel", "Zinfandel. Bold wine with intense flavors of black cherry, black currant, and cinnamon.", "$12 G · $46 B", FALLS_ID, "wine", "Red", 2),
  menuDoc("mi-falls-wine-03", "Johannes Leitz 'Dragonstone'", "Riesling. Vibrant and slightly sweet. Fresh aromas of peach, green apple, and citrus with crisp acidity and a distinct mineral finish.", "$12 G · $46 B", FALLS_ID, "wine", "White", 3),
  menuDoc("mi-falls-wine-04", "Innocent Bystander Sauvignon Blanc", "Sauvignon Blanc. Ruby grapefruit, gooseberry, lemon/lime citrus, and passion fruit. Vibrant and refreshingly crisp.", "$11 G · $42 B", FALLS_ID, "wine", "White", 4),
  menuDoc("mi-falls-wine-05", "Christopher Michael Chardonnay", "Chardonnay. Bright and fresh with ripe flavors of melon, pear, and white peach. Clean and lively with a crisp finish.", "$12 G · $46 B", FALLS_ID, "wine", "White", 5),
  menuDoc("mi-falls-wine-06", "La Perrier Rosé", "Dry Rosé. Deep rosé with a range of red berry notes. Aromas of strawberry and raspberry.", "$10 G · $38 B", FALLS_ID, "wine", "White", 6),
  menuDoc("mi-falls-wine-07", "Pizzolato Sparkling Prosecco Rosé", "Lemon Chiffon & Ripe Apple · Strawberry & Peach · Lean & Dry Finish", "$10 / split", FALLS_ID, "wine", "Bubbles", 7),
  menuDoc("mi-falls-wine-08", "Pizzolato Sparkling Moscato", "Sweet · Delicate bubbles", "$11 G", FALLS_ID, "wine", "Bubbles", 8),

  // ── The Falls Ciders & Seltzers ───────────────────────────────────────────
  menuDoc("mi-falls-cider-01", "Wyder's Semi Dry Raspberry", "Hard cider — semi dry raspberry.", "$7", FALLS_ID, "cider", "Ciders & Seltzers", 1),
  menuDoc("mi-falls-cider-02", "DownEast Cider — Rotating Flavors", "Hard cider — ask your bartender what's available.", "$7", FALLS_ID, "cider", "Ciders & Seltzers", 2),
  menuDoc("mi-falls-cider-03", "Untitled Art: Florida Seltzer — Blood Orange Pomegranate", "Hard seltzer made with real fruit juice. Rich, fruit-forward flavor. 12 oz can.", "$7", FALLS_ID, "cider", "Ciders & Seltzers", 3),
  menuDoc("mi-falls-cider-04", "Untitled Art: Florida Seltzer — Blackberry Agave", "Hard seltzer made with real fruit juice. Rich, fruit-forward flavor. 12 oz can.", "$7", FALLS_ID, "cider", "Ciders & Seltzers", 4),
  menuDoc("mi-falls-cider-05", "Humble Forager: Humble Bumble", "Gluten-free buzzed seltzer made with 100% real fruit & honey. Rotating flavors. 16 oz can.", "$7", FALLS_ID, "cider", "Ciders & Seltzers", 5, ["glutenFree"]),
  menuDoc("mi-falls-cider-06", "SURFSIDE Iced Tea + Vodka", "Ready-to-drink cocktail made with premium vodka and natural juice. 12 oz can.", "$8", FALLS_ID, "cider", "Ciders & Seltzers", 6),
  menuDoc("mi-falls-cider-07", "SURFSIDE Raspberry Lemonade + Vodka", "Ready-to-drink cocktail made with premium vodka and natural juice. 12 oz can.", "$8", FALLS_ID, "cider", "Ciders & Seltzers", 7),
  menuDoc("mi-falls-cider-08", "Hinterland: Saving Gracie Vienna Lager", "Gluten-free beer. 5% ABV. 12 oz can.", "$5", FALLS_ID, "cider", "Ciders & Seltzers", 8, ["glutenFree"]),

  // ── The Falls Non-Alcoholic ───────────────────────────────────────────────
  menuDoc("mi-falls-na-01", "Eins-Zwei-Zero Sparkling Rosé", "Non-alcoholic wine. Alcohol-free and gluten-free. 250mL can.", "$5", FALLS_ID, "na", "Non-Alcoholic", 1, ["glutenFree"]),
  menuDoc("mi-falls-na-02", "Athletic Brewing Co — Lite Lager", "Craft non-alcoholic lite lager. Less than 0.5% alcohol, 50 calories. 12 oz can.", "$5", FALLS_ID, "na", "Non-Alcoholic", 2),
  menuDoc("mi-falls-na-03", "Athletic Brewing Co — N/A Hazy", "Non-alcoholic hazy IPA. Citrus-forward, low bitterness. 12 oz can.", "$5", FALLS_ID, "na", "Non-Alcoholic", 3),
  menuDoc("mi-falls-na-04", "Untitled Art — N/A Mango Dragonfruit Sour", "Non-alcoholic sour. 12 oz can.", "$5", FALLS_ID, "na", "Non-Alcoholic", 4),
  menuDoc("mi-falls-na-05", "Untitled Art — N/A Orange Wit", "Non-alcoholic wheat beer. Light, crisp, flavored with orange peels. 12 oz can.", "$5", FALLS_ID, "na", "Non-Alcoholic", 5),
  menuDoc("mi-falls-na-06", "Untitled Art — N/A Chocolate Dark", "Non-alcoholic dark beer. Chocolate, roasted malt, and coffee notes. 12 oz can.", "$5", FALLS_ID, "na", "Non-Alcoholic", 6),
  menuDoc("mi-falls-na-07", "Liquid Death Canned Water", "Sparkling flavored water. Regular, Sparkling, Tangerine, Lime, Cherry. 16 oz can.", "$2", FALLS_ID, "na", "Non-Alcoholic", 7),
  menuDoc("mi-falls-na-08", "Liquid Death Canned Iced Tea", "Lightly sweetened. Peach Tea or Arnold Palmer. 19 oz can.", "$3", FALLS_ID, "na", "Non-Alcoholic", 8),
  menuDoc("mi-falls-na-09", "Potosi Root Beer", "Craft root beer from Potosi Brewing Co. 12 oz bottle.", "$3.50", FALLS_ID, "na", "Non-Alcoholic", 9),
  menuDoc("mi-falls-na-10", "Potosi Orange Cream Soda", "Craft orange cream soda from Potosi Brewing Co. 12 oz bottle.", "$3.50", FALLS_ID, "na", "Non-Alcoholic", 10),
  menuDoc("mi-falls-na-11", "Mexican Coca-Cola", "Classic Coca-Cola in a glass bottle. 12 oz bottle.", "$3.50", FALLS_ID, "na", "Non-Alcoholic", 11),
  menuDoc("mi-falls-na-12", "Can Soda", "Diet Coke · Sprite · Lemonade · Capri Sun. 12 oz can.", "$1", FALLS_ID, "na", "Non-Alcoholic", 12),
];

// ─── RUN ──────────────────────────────────────────────────────────────────────
async function seed() {
  let ok = 0, fail = 0;

  const run = async (label, docs, docType) => {
    console.log(`\n── ${label} (${docs.length}) ──`);
    for (const doc of docs) {
      try {
        const d = { ...doc };
        // Inject _type if not already set
        if (!d._type && docType) d._type = docType;
        // Resolve locationSlug → reference for events
        if (d.locationSlug) {
          const ref = locRef(d.locationSlug);
          if (ref) d.location = ref;
          delete d.locationSlug;
        }
        await upsert(d);
        process.stdout.write(".");
        ok++;
      } catch (e) {
        console.error(`\n✗ ${doc._id ?? doc.title}: ${e.message}`);
        if (e.statusCode === 403) {
          console.error("\nInsufficient permissions — make sure your token has Editor access.");
          process.exit(1);
        }
        fail++;
      }
    }
    console.log(` done`);
  };

  await run("Locations", LOCATIONS);
  await run("Events", EVENTS, "event");
  await run("Menu Items", MENU_ITEMS);

  console.log(`\n✅ Seeded ${ok} documents. ${fail > 0 ? `⚠️  ${fail} failed.` : "All good!"}`);
}

seed().catch((e) => { console.error(e); process.exit(1); });
