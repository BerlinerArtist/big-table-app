import type { OccasionData, UnitSystem } from "../data/types";
import { scaledDisplay } from "./scale";

export interface ShoppingItem {
  name: string;
  qty: string;
}

/**
 * The original shopping list is per occasion: every ingredient, scaled to
 * the chosen guest count, with check-off state persisted per item
 * (localStorage 'tbt-shop-*'). One occasion = one recipe = one list.
 */
export function buildShoppingList(
  occasion: OccasionData,
  serves: number,
  system: UnitSystem
): ShoppingItem[] {
  return occasion.ingredients.map((ing) => ({
    name: ing.name,
    qty: scaledDisplay(ing, serves, system),
  }));
}
