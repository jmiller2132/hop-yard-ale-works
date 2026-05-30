// Appleton food menu — structured for Sanity ingestion.
// menuType: "food" | section: "Specialty Pizzas" | "Sharables" | "Build Your Own" | "Dessert"
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
  // ── Specialty Pizzas ─────────────────────────────────────────────
  {
    name: "Watermelon Sugar Pie",
    description:
      "Oil · Garlic · Herb Chèvre · Smoked Tomato · Jalapeño · Mint · Watermelon · Jalapeño-Lime Vinaigrette · Honey Crystals",
    price: "$16",
    section: "Specialty Pizzas",
    tags: ["vegetarian"],
    displayOrder: 1,
  },
  {
    name: "Should'a Been a Cowboy",
    description:
      "Jalapeño Aioli · Cheddar · Meat Block Hot Dogs · Bacon · Sautéed Onion · BBQ · Chili Cheese Fritos",
    price: "$17",
    section: "Specialty Pizzas",
    tags: [],
    displayOrder: 2,
  },
  {
    name: "Catalina Wine Mixer",
    description:
      "Red Sauce · Herb Chèvre · Garlic · Basil · Oregano · Sautéed Onion · Bacon · Orange Honey",
    price: "$17",
    section: "Specialty Pizzas",
    tags: [],
    displayOrder: 3,
  },
  {
    name: "Cheeseburger in Paradise",
    description:
      "Mac Sauce · Cheddar · Ground Beef · Onion · Pickles · Tomato · Lettuce · House-Made Ketchup · Sesame Seeds",
    price: "$18",
    section: "Specialty Pizzas",
    tags: [],
    displayOrder: 4,
  },
  {
    name: "The Italian Job",
    description:
      "Pesto · Fresh Mozzarella · Garlic · Sliced Tomato · Blackberry-Ginger Balsamic",
    price: "$16",
    section: "Specialty Pizzas",
    tags: [],
    displayOrder: 5,
  },
  {
    name: "Big Bang-Bang Theory",
    description:
      "Bang Sauce · Mozzarella · Chicken · Onion · Red Pepper · Fresh Cucumber · Sugar Snap Pea Pods · Cilantro",
    price: "$17",
    section: "Specialty Pizzas",
    tags: [],
    displayOrder: 6,
  },
  {
    name: "Italian Dunkers",
    description:
      "EVOO · Garlic · Mozzarella · Red Sauce as Dip (Cut in Strips)",
    price: "$12",
    section: "Specialty Pizzas",
    tags: ["vegetarian"],
    displayOrder: 7,
  },
  {
    name: "Fancy Pants (Cheese!)",
    description: "Red Sauce · Mozzarella",
    price: "$12",
    section: "Specialty Pizzas",
    tags: ["vegetarian"],
    displayOrder: 8,
  },
  {
    name: "My Fav",
    description: "Red Sauce · Mozzarella · Garlic · Tomatoes · Basil",
    price: "$13",
    section: "Specialty Pizzas",
    tags: ["vegetarian"],
    displayOrder: 9,
  },
  {
    name: "First Timer",
    description: "Red Sauce · Mozzarella · Pepperoni · Sausage",
    price: "$16",
    section: "Specialty Pizzas",
    tags: [],
    displayOrder: 10,
  },
  {
    name: "Old Reliable",
    description: "Red Sauce · Mozzarella · Pepperoni · Sausage · Onion · Mushroom",
    price: "$17",
    section: "Specialty Pizzas",
    tags: [],
    displayOrder: 11,
  },
  {
    name: "Bits & Bobs",
    description: "Red Sauce · Mozzarella · Sausage · Mushroom",
    price: "$14",
    section: "Specialty Pizzas",
    tags: [],
    displayOrder: 12,
  },
  {
    name: "Winner Winner Chicken Dinner",
    description:
      "White Sauce · Mozzarella · Chicken · Mushroom · Garlic · Basil · Wine",
    price: "$16",
    section: "Specialty Pizzas",
    tags: [],
    displayOrder: 13,
  },
  {
    name: "99 Corvette",
    description:
      "Red Sauce · Mozzarella · Garlic · Basil · Pepperoni · Ricotta · Hot Honey",
    price: "$17",
    section: "Specialty Pizzas",
    tags: [],
    displayOrder: 14,
  },
  {
    name: "White Lightning",
    description:
      "White Sauce · Mozzarella · Pepperoni · Garlic · Basil · Jalapeño · Pepperoncini",
    price: "$16",
    section: "Specialty Pizzas",
    tags: [],
    displayOrder: 15,
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

export const APPLETON_NA: WineItemSeed[] = [
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
