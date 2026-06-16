// Appleton food menu — structured for Sanity ingestion.
// menuType: "food" | section: "The Basics" | "Our Creations" | "Snacks" | "Build Your Own" | "Dessert"
// tags: ("vegetarian" | "vegan" | "glutenFree")[]
// Note: emoji flags from WordPress = vegetarian 🍅, vegan 🌱, gluten-free 🌾, spicy 🔥, nuts 🥜, eggs 🥚

export interface MenuItemSeed {
  name: string;
  description: string;
  price: string;
  section: string;
  tags: string[];
  isFanFavorite?: boolean;
  isStaffPick?: boolean;
  displayOrder: number;
}

export const APPLETON_FOOD_MENU: MenuItemSeed[] = [
  // ── The Basics (steadfast) ────────────────────────────────────────
  {
    name: "Italian Dunkers",
    description:
      "EVOO · Garlic · Mozzarella · Red Sauce as Dip (Cut in Strips)",
    price: "$12",
    section: "The Basics",
    tags: ["vegetarian"],
    displayOrder: 7,
  },
  {
    name: "Fancy Pants (Cheese!)",
    description: "Red Sauce · Mozzarella",
    price: "$12",
    section: "The Basics",
    tags: ["vegetarian"],
    displayOrder: 8,
  },
  {
    name: "My Fav",
    description: "Red Sauce · Mozzarella · Garlic · Tomatoes · Basil",
    price: "$13",
    section: "The Basics",
    tags: ["vegetarian"],
    displayOrder: 9,
  },
  {
    name: "First Timer",
    description: "Red Sauce · Mozzarella · Pepperoni · Sausage",
    price: "$16",
    section: "The Basics",
    tags: [],
    displayOrder: 10,
  },
  {
    name: "Bits & Bobs",
    description: "Red Sauce · Mozzarella · Sausage · Mushroom",
    price: "$14",
    section: "The Basics",
    tags: [],
    displayOrder: 12,
  },
  {
    name: "Old Reliable",
    description: "Red Sauce · Mozzarella · Pepperoni · Sausage · Onion · Mushroom",
    price: "$17",
    section: "The Basics",
    tags: [],
    displayOrder: 11,
  },
  {
    name: "Winner Winner Chicken Dinner",
    description:
      "White Sauce · Mozzarella · Chicken · Mushroom · Garlic · Basil · Wine",
    price: "$16",
    section: "The Basics",
    tags: [],
    displayOrder: 13,
  },
  // ── Our Creations (rotating ~every 2 months) ──────────────────────
  {
    name: "Watermelon Sugar Pie",
    description:
      "Oil · Garlic · Herb Chèvre · Smoked Tomato · Jalapeño · Mint · Watermelon · Jalapeño-Lime Vinaigrette · Honey Crystals",
    price: "$16",
    section: "Our Creations",
    tags: ["vegetarian"],
    displayOrder: 1,
  },
  {
    name: "Should'a Been a Cowboy",
    description:
      "Jalapeño Aioli · Cheddar · Meat Block Hot Dogs · Bacon · Sautéed Onion · BBQ · Chili Cheese Fritos",
    price: "$17",
    section: "Our Creations",
    tags: [],
    displayOrder: 2,
  },
  {
    name: "Catalina Wine Mixer",
    description:
      "Red Sauce · Herb Chèvre · Garlic · Basil · Oregano · Sautéed Onion · Bacon · Orange Honey",
    price: "$17",
    section: "Our Creations",
    tags: [],
    displayOrder: 3,
  },
  {
    name: "Cheeseburger in Paradise",
    description:
      "Mac Sauce · Cheddar · Ground Beef · Onion · Pickles · Tomato · Lettuce · House-Made Ketchup · Sesame Seeds",
    price: "$18",
    section: "Our Creations",
    tags: [],
    displayOrder: 4,
  },
  {
    name: "The Italian Job",
    description:
      "Pesto · Fresh Mozzarella · Garlic · Sliced Tomato · Blackberry-Ginger Balsamic",
    price: "$16",
    section: "Our Creations",
    tags: [],
    displayOrder: 5,
  },
  {
    name: "Big Bang-Bang Theory",
    description:
      "Bang Sauce · Mozzarella · Chicken · Onion · Red Pepper · Fresh Cucumber · Sugar Snap Pea Pods · Cilantro",
    price: "$17",
    section: "Our Creations",
    tags: [],
    displayOrder: 6,
  },
  {
    name: "99 Corvette",
    description:
      "Red Sauce · Mozzarella · Garlic · Basil · Pepperoni · Ricotta · Hot Honey",
    price: "$17",
    section: "Our Creations",
    tags: [],
    displayOrder: 14,
  },
  {
    name: "White Lightning",
    description:
      "White Sauce · Mozzarella · Pepperoni · Garlic · Basil · Jalapeño · Pepperoncini",
    price: "$16",
    section: "Our Creations",
    tags: [],
    displayOrder: 15,
  },
  // ── Snacks ────────────────────────────────────────────────────────
  {
    name: "Popcorn",
    description: "House popcorn.",
    price: "$5",
    section: "Snacks",
    tags: ["vegan", "glutenFree"],
    displayOrder: 20,
  },
  {
    name: "Chips",
    description: "Bar chips.",
    price: "$2",
    section: "Snacks",
    tags: ["vegan", "glutenFree"],
    displayOrder: 21,
  },
  // ── Dessert ──────────────────────────────────────────────────────
  {
    name: "Cookie-Za",
    description:
      "Double Chocolate Cookie · Whipped Vanilla Frosting · Banana · Strawberry · Pineapple Boba · Hershey's Syrup · Cherry on Top (served cold)",
    price: "$15",
    section: "Dessert",
    tags: [],
    displayOrder: 16,
  },
  // ── Build Your Own ───────────────────────────────────────────────
  {
    name: "Build Your Own — Base",
    description:
      "House-made, wood-fired tomato sauce & Mozzarella Cheese. Add toppings below.",
    price: "$12",
    section: "Build Your Own",
    tags: ["vegetarian"],
    displayOrder: 17,
  },
];

// Appleton wine / drinks menu
export interface WineItemSeed {
  name: string;
  producer: string;
  location: string;
  description: string;
  price: string;
  section: string;
  displayOrder: number;
}

export const APPLETON_WINE_MENU: WineItemSeed[] = [
  // ── Red ──────────────────────────────────────────────────────────
  {
    name: "Tommasi 'Rafaèl'",
    producer: "Tommasi",
    location: "Valpolicella Classico, Veneto, Italy",
    description:
      "Valpolicella Blend. A fresh and elegant Italian red with aromas of cherry, dried spice, and sage. Bright red fruit flavors are carried by velvety tannins and lively acidity.",
    price: "$11",
    section: "Red",
    displayOrder: 1,
  },
  {
    name: "Hedges Family Estate",
    producer: "Hedges Family Estate",
    location: "Columbia Valley, Washington",
    description:
      "Cabernet Sauvignon, Merlot & Syrah Blend. Rich and structured with aromas of black cherry, raspberry, cocoa, and warm spice. Ripe wild berry fruit, soft tannins, long finish.",
    price: "$11",
    section: "Red",
    displayOrder: 2,
  },
  // ── White ────────────────────────────────────────────────────────
  {
    name: "Selbach 'Incline'",
    producer: "Selbach",
    location: "Mosel, Germany",
    description:
      "Riesling. Bright off-dry Riesling from steep slate slopes. Floral, waxy nose with juicy fruit flavors, vibrant acidity, and a clean mineral-driven finish.",
    price: "$10",
    section: "White",
    displayOrder: 3,
  },
  {
    name: "Kings Ridge",
    producer: "Kings Ridge (by Union Wine Co.)",
    location: "Willamette Valley, Oregon",
    description:
      "Pinot Gris. Fragrant nose of green apple, white pear, and honeysuckle. Fresh and crisp with a medium body and a subtle herbal note on the finish.",
    price: "$10",
    section: "White",
    displayOrder: 4,
  },
  {
    name: "Garofoli Rosé",
    producer: "Garofoli",
    location: "Marche, Italy",
    description:
      "Dry Rosé — Montepulciano. Bright aromas of strawberry, cherry, and white peach. Lively, savory acidity with a touch of sea salt on the finish.",
    price: "$10",
    section: "White",
    displayOrder: 5,
  },
  // ── Bubbles ──────────────────────────────────────────────────────
  {
    name: "Pizzolato Sparkling Prosecco Rosé",
    producer: "Pizzolato",
    location: "Veneto, Italy",
    description: "Lemon Chiffon & Ripe Apple · Strawberry & Peach · Lean & Dry finish",
    price: "$10 / split",
    section: "Bubbles",
    displayOrder: 6,
  },
  {
    name: "Pizzolato Sparkling Moscato",
    producer: "Pizzolato",
    location: "Veneto, Italy",
    description: "Sweet · Delicate bubbles",
    price: "$10 / split",
    section: "Bubbles",
    displayOrder: 7,
  },
];

// Ciders — rotating, so stored separately as CMS-managed items
export const APPLETON_CIDERS: WineItemSeed[] = [
  {
    name: "Wild State — Hazy Pink Pineapple",
    producer: "Wild State",
    location: "Minnesota",
    description: "Hazy, fruity pineapple cider.",
    price: "$7 / can",
    section: "Ciders & Seltzers",
    displayOrder: 1,
  },
  {
    name: "Wild State — Apple Pie",
    producer: "Wild State",
    location: "Minnesota",
    description: "Apple pie cider.",
    price: "$7 / can",
    section: "Ciders & Seltzers",
    displayOrder: 2,
  },
  {
    name: "Down East — Pomegranate",
    producer: "Down East",
    location: "Boston, MA",
    description: "Pomegranate hard cider.",
    price: "$7 / can",
    section: "Ciders & Seltzers",
    displayOrder: 3,
  },
];

export const APPLETON_NA_WINE: WineItemSeed[] = [
  {
    name: "Non-Alcoholic Sauvignon Blanc",
    producer: "",
    location: "",
    description: "Non-alcoholic white wine.",
    price: "$5",
    section: "Non-Alcoholic",
    displayOrder: 1,
  },
  {
    name: "Non-Alcoholic Sparkling Prosecco",
    producer: "",
    location: "",
    description: "Non-alcoholic sparkling wine.",
    price: "$5",
    section: "Non-Alcoholic",
    displayOrder: 2,
  },
];

// ── Appleton Ciders, Seltzers & Other Drinks ─────────────────────────────────
// (Appleton uses same brands as The Falls — imported from there in Phase 2)

import type { DrinkItemSeed } from "./menu-the-falls";
export type { DrinkItemSeed };

export const APPLETON_CIDERS_SELTZERS: DrinkItemSeed[] = [
  {
    name: "Untitled Art: Florida Seltzer — Blood Orange Pomegranate",
    description: "Hard seltzer made with real fruit juice. Rich, fruit-forward flavor. 12 oz can.",
    price: "$7",
    section: "Ciders & Seltzers",
    displayOrder: 1,
  },
  {
    name: "Untitled Art: Florida Seltzer — Blackberry Agave",
    description: "Hard seltzer made with real fruit juice. Rich, fruit-forward flavor. 12 oz can.",
    price: "$7",
    section: "Ciders & Seltzers",
    displayOrder: 2,
  },
  {
    name: "Humble Forager: Humble Bumble",
    description:
      "Gluten-free buzzed seltzer made with 100% real fruit and natural honey. Rotating flavors. 16 oz can.",
    price: "$7",
    section: "Ciders & Seltzers",
    tags: ["glutenFree"],
    displayOrder: 3,
  },
  {
    name: "Hard Ciders — Rotating Flavors",
    description: "Ask your bartender what's available. 12 oz can.",
    price: "$7",
    section: "Ciders & Seltzers",
    displayOrder: 4,
  },
  {
    name: "Hinterland: Saving Gracie Vienna Lager",
    description: "Gluten-free beer. 5% ABV. 12 oz can.",
    price: "$5",
    section: "Ciders & Seltzers",
    tags: ["glutenFree"],
    displayOrder: 5,
  },
];

export const APPLETON_NA: DrinkItemSeed[] = [
  {
    name: "Buzzkill N/A Sauvignon Blanc",
    description: "Non-alcoholic wine. Gluten-free. 250mL can.",
    price: "$5",
    section: "Non-Alcoholic",
    tags: ["glutenFree"],
    displayOrder: 1,
  },
  {
    name: "Buzzkill N/A Sparkling Sauvignon Blanc",
    description: "Non-alcoholic sparkling wine. Gluten-free. 250mL can.",
    price: "$5",
    section: "Non-Alcoholic",
    tags: ["glutenFree"],
    displayOrder: 2,
  },
  {
    name: "Untitled Art — N/A Grapefruit Radler",
    description: "Non-alcoholic beer. 12 oz can.",
    price: "$5",
    section: "Non-Alcoholic",
    displayOrder: 3,
  },
  {
    name: "Untitled Art — N/A Italian Pilsner",
    description: "Non-alcoholic beer. 12 oz can.",
    price: "$5",
    section: "Non-Alcoholic",
    displayOrder: 4,
  },
  {
    name: "Untitled Art — N/A Juicy IPA",
    description: "Non-alcoholic IPA. 12 oz can.",
    price: "$5",
    section: "Non-Alcoholic",
    displayOrder: 5,
  },
  {
    name: "Untitled Art — N/A Mango Dragonfruit Sour",
    description: "Non-alcoholic sour. 12 oz can.",
    price: "$5",
    section: "Non-Alcoholic",
    displayOrder: 6,
  },
  {
    name: "Liquid Death Canned Water",
    description:
      "Sparkling flavored water. Regular · Sparkling · Tangerine · Lime · Cherry · Doctor Death. 16 oz can.",
    price: "$2",
    section: "Non-Alcoholic",
    displayOrder: 7,
  },
  {
    name: "Liquid Death Canned Iced Tea",
    description: "Arnold Palmer or Peach Tea. 16 oz can.",
    price: "$3",
    section: "Non-Alcoholic",
    displayOrder: 8,
  },
  {
    name: "Potosi Root Beer",
    description: "Craft root beer from Potosi Brewing Co. 12 oz bottle.",
    price: "$3.50",
    section: "Non-Alcoholic",
    displayOrder: 9,
  },
  {
    name: "Potosi Orange Cream Soda",
    description: "Craft orange cream soda from Potosi Brewing Co. 12 oz bottle.",
    price: "$3.50",
    section: "Non-Alcoholic",
    displayOrder: 10,
  },
  {
    name: "Mexican Coca-Cola",
    description: "Classic Coca-Cola in a glass bottle. 12 oz bottle.",
    price: "$3.50",
    section: "Non-Alcoholic",
    displayOrder: 11,
  },
  {
    name: "Can Soda",
    description: "Diet Coke · Sprite · Lemonade. 12 oz can.",
    price: "$1",
    section: "Non-Alcoholic",
    displayOrder: 12,
  },
];

