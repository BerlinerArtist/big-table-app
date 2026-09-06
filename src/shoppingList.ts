import type { Ingredient, OccasionData, UnitSystem } from "../data/types";
import { scaledDisplay } from "./scale";

export interface ShoppingItem {
  name: string;
  qty: string;
}

/**
 * The original shopping list is per occasion: every ingredient, scaled to
 * the chosen guest count, with check-off state persisted per item
 * (localStorage 'tbt-shop-*'). One occasion = one recipe = one list.
 *
 * `extras` covers Smart Swaps: each active swap's own ingredients, scaled
 * to however many guests chose that swap (not the full guest count).
 * Ingredients are combined BY NAME across the main dish and every extra —
 * if a swap happens to use an ingredient the main dish also uses (e.g.
 * both need garlic), the two scaled amounts are summed into one line
 * rather than listed twice, so nothing is silently under- or double-
 * bought at the shop.
 */
export function buildShoppingList(
  occasion: OccasionData,
  mainDishServes: number,
  system: UnitSystem,
  extras: { ingredients: Ingredient[]; count: number }[] = []
): ShoppingItem[] {
  // metric base amount per unit, summed by name, before formatting —
  // formatting must happen once at the end so rounding isn't compounded
  const totals = new Map<string, { unit: string; metricAmount: number }>();

  const add = (ing: Ingredient, count: number) => {
    const metricAmount = (ing.base / ing.baseServes) * count;
    const existing = totals.get(ing.name);
    if (existing) {
      existing.metricAmount += metricAmount;
    } else {
      totals.set(ing.name, { unit: ing.unit, metricAmount });
    }
  };

  for (const ing of occasion.ingredients) add(ing, mainDishServes);
  for (const extra of extras) {
    for (const ing of extra.ingredients) add(ing, extra.count);
  }

  return Array.from(totals.entries())
    .filter(([, { metricAmount }]) => metricAmount > 0)
    .map(([name, { unit, metricAmount }]) => ({
      name,
      qty: scaledDisplay({ name, base: metricAmount, baseServes: 1, unit }, 1, system),
    }));
}
