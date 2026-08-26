import type { Ingredient, UnitSystem } from "../data/types";
import { fmtMetric, fmtUS } from "./format";

/**
 * The original scaling core, verbatim:
 *   scaled = (base / baseServes) * serves
 * then formatted with the product's exact rounding rules.
 */
export function scaledDisplay(
  ing: Ingredient,
  serves: number,
  system: UnitSystem
): string {
  const scaled = (ing.base / ing.baseServes) * serves;
  return system === "us" ? fmtUS(scaled, ing.unit) : fmtMetric(scaled, ing.unit);
}
