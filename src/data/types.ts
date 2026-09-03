/**
 * Data model — PHASE 0 FINAL, derived from the real product (TheBigTable.html).
 *
 * Key finding: the original stores ONE metric base amount per ingredient
 * (data-base at data-serves people) and converts to US on the fly via
 * exact formatting rules (see engine/format.ts). No dual storage.
 */

export type UnitSystem = "us" | "metric";
export type Tier = "around-the-table" | "fill-the-room";

export interface Ingredient {
  name: string;
  /** metric base amount at baseServes people (single source of truth) */
  base: number;
  baseServes: number;
  /** '', 'kg', 'g', 'ml', 'tbsp', 'tsp', 'bunch', 'bunches', 'heads', ... */
  unit: string;
  /** original rendered text at default serves — for regression checks */
  display?: string;
}

export interface Swap {
  /** "Vegetarian" | "Pescatarian" | "Pasta Purists" | "Meat" | ... */
  category: string;
  text: string;
  /**
   * Optional: this swap's own scalable ingredients, same shape and same
   * scaling function (engine/scale.ts::scaledDisplay) as the main dish.
   * Undefined means the swap has no separate shopping list yet (older
   * occasions not yet migrated) — UI should fall back to showing `text`
   * only, exactly as it does today.
   */
  ingredients?: Ingredient[];
  /**
   * Optional: this swap's own method, coordinated to finish alongside the
   * main dish's timeline (see Recipe.tsx method section). Undefined means
   * no separate method has been authored yet — UI shows a notice pointing
   * back to this swap's one-line `text` instead of fabricating steps.
   */
  phases?: Phase[];
}

export interface Phase {
  name: string;
  pill: string;
  desc: string;
  icon: string;
}

/** ["Braise in oven", 270] — minutes; 0-duration steps pin to serve time. */
export type TimelineStep = [string, number];

export interface ChipStat { label: string; value: string; }

export interface OccasionData {
  page: number;
  id: string;
  occasion: string;
  tier: Tier;
  recipeTitle: string;
  cuisine: string;
  forTwo: boolean;
  mode: "att" | "ftr";
  slider: { min: number; max: number; default: number };
  ovenCelsius: number | null;
  difficulty: number | null;
  stats: ChipStat[];
  details: ChipStat[];
  ingredients: Ingredient[];
  swaps: Swap[];
  phases: Phase[];
  nutritionPerServing: Record<string, string>;
  pairings: string[];
  notes: string[];
  timeline: TimelineStep[];
}

export interface BookData {
  meta: { source: string; occasions: number; ingredientsTotal: number };
  occasions: OccasionData[];
}
