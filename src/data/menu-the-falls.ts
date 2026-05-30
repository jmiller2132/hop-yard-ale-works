// The Falls drinks menu — wine, ciders, seltzers, NA, and soda options.
// Note: Beer (On Tap) is handled by Untappd embed — not stored here.

import type { WineItemSeed } from "./menu-appleton";

// ── Wine ─────────────────────────────────────────────────────────────────────
// The Falls serves wine by the glass OR the bottle (Appleton is glass only).

export const FALLS_WINE_MENU: WineItemSeed[] = [
  // Red
  {
    name: "Clous De Fous Pinot Noir",
    producer: "Clous De Fous",
    location: "Chile",
    description: "Pinot Noir. Medium bodied, crisp light finish.",
    price: "$12 G · $46 B",
    section: "Red",
    displayOrder: 1,
  },
  {
    name: "Cline Zinfandel",
    producer: "Cline",
    location: "Sonoma County",
    description:
      "Zinfandel. Bold wine with intense flavors of black cherry, black currant, and cinnamon.",
    price: "$12 G · $46 B",
    section: "Red",
    displayOrder: 2,
  },
  // White
  {
    name: "Johannes Leitz 'Dragonstone'",
    producer: "Johannes Leitz",
    location: "Rheingau, Germany",
    description:
      "Riesling. Vibrant and slightly sweet. Fresh aromas of peach, green apple, and citrus with crisp acidity and a distinct mineral finish.",
    price: "$12 G · $46 B",
    section: "White",
    displayOrder: 3,
  },
  {
    name: "Innocent Bystander Sauvignon Blanc",
    producer: "Innocent Bystander",
    location: "Marlborough, New Zealand",
    description:
      "Sauvignon Blanc. Ruby grapefruit, gooseberry, lemon/lime citrus, and passion fruit. Vibrant and refreshingly crisp.",
    price: "$11 G · $42 B",
    section: "White",
    displayOrder: 4,
  },
  {
    name: "Christopher Michael Chardonnay",
    producer: "Christopher Michael",
    location: "Washington",
    description:
      "Chardonnay. Bright and fresh with ripe flavors of melon, pear, and white peach. Clean and lively with a crisp finish.",
    price: "$12 G · $46 B",
    section: "White",
    displayOrder: 5,
  },
  {
    name: "La Perrier Rosé",
    producer: "La Perrier",
    location: "France",
    description:
      "Dry Rosé. Deep rosé, an exemplary Rhône rosé with a range of red berry notes. Aromas of strawberry and raspberry.",
    price: "$10 G · $38 B",
    section: "White",
    displayOrder: 6,
  },
  // Bubbles
  {
    name: "Pizzolato Sparkling Prosecco Rosé",
    producer: "Pizzolato",
    location: "Veneto, Italy",
    description: "Lemon Chiffon & Ripe Apple · Strawberry & Peach · Lean & Dry Finish",
    price: "$10 / split",
    section: "Bubbles",
    displayOrder: 7,
  },
  {
    name: "Pizzolato Sparkling Moscato",
    producer: "Pizzolato",
    location: "Veneto, Italy",
    description: "Sweet · Delicate bubbles",
    price: "$11 G",
    section: "Bubbles",
    displayOrder: 8,
  },
];

// ── Ciders & Seltzers ────────────────────────────────────────────────────────

export interface DrinkItemSeed {
  name: string;
  description: string;
  price: string;
  section: string;
  tags?: string[];
  displayOrder: number;
}

export const FALLS_CIDERS_SELTZERS: DrinkItemSeed[] = [
  {
    name: "Wyder's Semi Dry Raspberry",
    description: "Hard cider — semi dry raspberry.",
    price: "$7",
    section: "Ciders & Seltzers",
    displayOrder: 1,
  },
  {
    name: "DownEast Cider — Rotating Flavors",
    description: "Hard cider — ask your bartender what's available.",
    price: "$7",
    section: "Ciders & Seltzers",
    displayOrder: 2,
  },
  {
    name: "Untitled Art: Florida Seltzer — Blood Orange Pomegranate",
    description: "Hard seltzer made with real fruit juice. Rich, fruit-forward flavor. 12 oz can.",
    price: "$7",
    section: "Ciders & Seltzers",
    displayOrder: 3,
  },
  {
    name: "Untitled Art: Florida Seltzer — Blackberry Agave",
    description: "Hard seltzer made with real fruit juice. Rich, fruit-forward flavor. 12 oz can.",
    price: "$7",
    section: "Ciders & Seltzers",
    displayOrder: 4,
  },
  {
    name: "Humble Forager: Humble Bumble",
    description:
      "Gluten-free buzzed seltzer made with 100% real fruit & honey. Rotating flavors. 16 oz can.",
    price: "$7",
    section: "Ciders & Seltzers",
    tags: ["glutenFree"],
    displayOrder: 5,
  },
  {
    name: "SURFSIDE Iced Tea + Vodka",
    description: "Ready-to-drink cocktail made with premium vodka and natural juice. 12 oz can.",
    price: "$8",
    section: "Ciders & Seltzers",
    displayOrder: 6,
  },
  {
    name: "SURFSIDE Raspberry Lemonade + Vodka",
    description: "Ready-to-drink cocktail made with premium vodka and natural juice. 12 oz can.",
    price: "$8",
    section: "Ciders & Seltzers",
    displayOrder: 7,
  },
  {
    name: "Hinterland: Saving Gracie Vienna Lager",
    description: "Gluten-free beer. 5% ABV. 12 oz can.",
    price: "$5",
    section: "Ciders & Seltzers",
    tags: ["glutenFree"],
    displayOrder: 8,
  },
];

// ── Non-Alcoholic ────────────────────────────────────────────────────────────

export const FALLS_NA: DrinkItemSeed[] = [
  {
    name: "Eins-Zwei-Zero Sparkling Rosé",
    description: "Non-alcoholic wine. Alcohol-free and gluten-free. 250mL can.",
    price: "$5",
    section: "Non-Alcoholic",
    tags: ["glutenFree"],
    displayOrder: 1,
  },
  {
    name: "Athletic Brewing Co — Lite Lager",
    description:
      "Craft non-alcoholic lite lager. Less than 0.5% alcohol, 50 calories. 12 oz can.",
    price: "$5",
    section: "Non-Alcoholic",
    displayOrder: 2,
  },
  {
    name: "Athletic Brewing Co — N/A Hazy",
    description: "Non-alcoholic hazy IPA. Citrus-forward, low bitterness. 12 oz can.",
    price: "$5",
    section: "Non-Alcoholic",
    displayOrder: 3,
  },
  {
    name: "Untitled Art — N/A Mango Dragonfruit Sour",
    description: "Non-alcoholic sour. 12 oz can.",
    price: "$5",
    section: "Non-Alcoholic",
    displayOrder: 4,
  },
  {
    name: "Untitled Art — N/A Orange Wit",
    description: "Non-alcoholic wheat beer. Light, crisp, flavored with orange peels. 12 oz can.",
    price: "$5",
    section: "Non-Alcoholic",
    displayOrder: 5,
  },
  {
    name: "Untitled Art — N/A Chocolate Dark",
    description:
      "Non-alcoholic dark beer. Chocolate, roasted malt, and coffee notes. 12 oz can.",
    price: "$5",
    section: "Non-Alcoholic",
    displayOrder: 6,
  },
  {
    name: "Liquid Death Canned Water",
    description:
      "Sparkling flavored water. Available in: Regular, Sparkling, Tangerine, Lime, Cherry. 16 oz can.",
    price: "$2",
    section: "Non-Alcoholic",
    displayOrder: 7,
  },
  {
    name: "Liquid Death Canned Iced Tea",
    description: "Lightly sweetened. Available in: Peach Tea, Arnold Palmer. 19 oz can.",
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
    description: "Diet Coke · Sprite · Lemonade · Capri Sun. 12 oz can.",
    price: "$1",
    section: "Non-Alcoholic",
    displayOrder: 12,
  },
];

// ── Non-Alcoholic Wine ───────────────────────────────────────────────────────

export const FALLS_NA_WINE: WineItemSeed[] = [
  {
    name: "Non-Alcoholic Sparkling Prosecco",
    producer: "",
    location: "",
    description: "Non-alcoholic sparkling wine.",
    price: "$5",
    section: "Non-Alcoholic",
    displayOrder: 1,
  },
];
