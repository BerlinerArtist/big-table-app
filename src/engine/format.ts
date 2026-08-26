import type { UnitSystem } from "../data/types";

/**
 * 1:1 TypeScript port of the book's fmtMetric / fmtUS / fmtTime (v4),
 * plus the single authorized v4.1 fix (sub-10g grams — saffron bug).
 * These ARE the product's rounding rules — do not "improve" them.
 * The numbers in the web app must match the HTML book exactly.
 */

export function fmtMetric(v: number, u: string): string {
  if (!u) return String(Math.max(1, Math.round(v)));
  if (u === "kg") {
    if (v < 0.4) return Math.round(v * 1000) + "g";
    const r = Math.round(v * 4) / 4;
    return (r === Math.floor(r) ? r.toFixed(0) : r.toFixed(2).replace(/\.?0+$/, "")) + " kg";
  }
  if (u === "g") {
    // v4.1 fix (also applied to the book): sub-10g ingredients like saffron
    // used to be floored at 10g. Below 10g we now round to whole grams.
    if (v < 10) return Math.max(1, Math.round(v)) + "g";
    return Math.round(v / 5) * 5 + "g";
  }
  if (u === "ml") {
    if (v >= 950) return (Math.round(v / 100) / 10).toFixed(1).replace(/\.0$/, "") + "L";
    return Math.max(10, Math.round(v / 10) * 10) + "ml";
  }
  if (u === "tbsp") {
    const r = Math.max(0.5, Math.round(v * 2) / 2);
    return (r % 1 === 0 ? r.toFixed(0) : r.toFixed(1)) + " tbsp";
  }
  if (u === "tsp") return Math.max(0.25, Math.round(v * 4) / 4) + " tsp";
  if (u === "bunch" || u === "bunches") {
    const n = Math.max(1, Math.ceil(v));
    return n + (n === 1 ? " bunch" : " bunches");
  }
  if (u === "heads") return Math.max(1, Math.ceil(v)) + " heads";
  const r = Math.round(v * 10) / 10;
  return (r === Math.floor(r) ? r.toFixed(0) : r.toFixed(1)) + " " + u;
}

export function fmtUS(v: number, u: string): string {
  if (!u) return String(Math.max(1, Math.round(v)));
  if (u === "kg") {
    const lb = v * 2.20462;
    if (lb < 1) return Math.round(lb * 16) + " oz";
    const lbW = Math.floor(lb);
    const oz = Math.round((lb - lbW) * 16);
    if (oz === 0) return lbW + " lb";
    if (lbW === 0) return oz + " oz";
    return lbW + " lb " + oz + " oz";
  }
  if (u === "g") {
    const oz = v * 0.035274;
    if (oz >= 16) return (oz / 16).toFixed(1).replace(/\.0$/, "") + " lb";
    return oz.toFixed(1).replace(/\.0$/, "") + " oz";
  }
  if (u === "ml") {
    if (v >= 240) {
      const c = v / 236.588;
      const rc = Math.round(c * 4) / 4;
      return rc.toFixed(2).replace(/\.?0+$/, "") + (rc === 1 ? " cup" : " cups");
    }
    return (v * 0.033814).toFixed(1).replace(/\.0$/, "") + " fl oz";
  }
  if (u === "tbsp") {
    const r = Math.max(0.5, Math.round(v * 2) / 2);
    return (r % 1 === 0 ? r.toFixed(0) : r.toFixed(1)) + " tbsp";
  }
  if (u === "tsp") return Math.max(0.25, Math.round(v * 4) / 4) + " tsp";
  if (u === "bunch" || u === "bunches") {
    const n = Math.max(1, Math.ceil(v));
    return n + (n === 1 ? " bunch" : " bunches");
  }
  if (u === "heads") return Math.max(1, Math.ceil(v)) + " heads";
  return String(Math.max(1, Math.round(v)));
}

/** Unit toggle also switches the clock: metric → 24h, US → 12h AM/PM. */
export function fmtTime(totalMin: number, system: UnitSystem): string {
  const n = ((totalMin % 1440) + 1440) % 1440;
  const h = Math.floor(n / 60);
  const m = n % 60;
  if (system === "us") {
    const h12 = h % 12 || 12;
    return h12 + ":" + (m < 10 ? "0" : "") + m + (h < 12 ? " AM" : " PM");
  }
  return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
}

/** Stat chips carry both units in text ("160°C / 320°F") — pick per system. */
export function fmtOven(celsius: number, system: UnitSystem): string {
  if (system === "metric") return `${celsius}°C`;
  return `${Math.round((celsius * 9) / 5 + 32)}°F`;
}
