import type { Tier } from "./types";

/**
 * Occasion registry — extracted from the Gumroad product page (July 2026).
 * PHASE 0 attaches each entry's recipes from the original product HTML
 * and reconciles titles/order/emojis with the product.
 */
export interface OccasionMeta {
  id: string;
  title: string;
  tier: Tier;
  emoji?: string;
}

/** Guest ranges per tier (slider bounds per occasion). */
export const TIER_RANGE: Record<Tier, { min: number; max: number }> = {
  "around-the-table": { min: 2, max: 16 },
  "fill-the-room": { min: 16, max: 60 },
};

export const OCCASIONS: OccasionMeta[] = [
  // 🟥 Around The Table — 2–16 guests (14 occasions)
  { id: "first-date-night-in", title: "First Date Night In", tier: "around-the-table", emoji: "🌙" },
  { id: "valentines-dinner", title: "Valentine's Dinner", tier: "around-the-table", emoji: "💘" },
  { id: "romantic-anniversary", title: "Romantic Anniversary", tier: "around-the-table", emoji: "🕯️" },
  { id: "shabbat-dinner", title: "Shabbat Dinner", tier: "around-the-table", emoji: "🕍" },
  { id: "nowruz", title: "Nowruz", tier: "around-the-table", emoji: "🌸" },
  { id: "mothers-day-brunch", title: "Mother's Day Brunch", tier: "around-the-table", emoji: "💐" },
  { id: "chosen-family-dinner", title: "Chosen Family Dinner", tier: "around-the-table", emoji: "🤝" },
  { id: "graduation-supper", title: "Graduation Supper", tier: "around-the-table", emoji: "🎓" },
  { id: "promotion-celebration", title: "Promotion Celebration", tier: "around-the-table", emoji: "🥂" },
  { id: "engagement-dinner", title: "Engagement Dinner", tier: "around-the-table", emoji: "💍" },
  { id: "welcome-home-feast", title: "Welcome Home Feast", tier: "around-the-table", emoji: "🏡" },
  { id: "farewell-going-away", title: "Farewell & Going Away", tier: "around-the-table", emoji: "🧳" },
  { id: "upscale-dinner-party", title: "Upscale Dinner Party", tier: "around-the-table", emoji: "🍷" },
  { id: "funeral-wake-commemoration", title: "Funeral, Wake & Commemoration", tier: "around-the-table", emoji: "🕊️" },

  // 🟦 Fill The Room — 16–60+ guests (24 occasions)
  { id: "kids-birthday", title: "Kids' Birthday", tier: "fill-the-room", emoji: "🎈" },
  { id: "adult-birthday", title: "Adult Birthday", tier: "fill-the-room", emoji: "🎉" },
  { id: "baby-shower", title: "Baby Shower", tier: "fill-the-room", emoji: "👶" },
  { id: "gender-reveal", title: "Gender Reveal", tier: "fill-the-room", emoji: "🎀" },
  { id: "midsommar", title: "Midsommar", tier: "fill-the-room", emoji: "☀️" },
  { id: "garden-party-bbq", title: "Garden Party & BBQ", tier: "fill-the-room", emoji: "🌿" },
  { id: "cocktail-party", title: "Cocktail Party", tier: "fill-the-room", emoji: "🍸" },
  { id: "lunar-new-year", title: "Lunar New Year", tier: "fill-the-room", emoji: "🧧" },
  { id: "diwali", title: "Diwali", tier: "fill-the-room", emoji: "🪔" },
  { id: "carnival-mardi-gras", title: "Carnival / Mardi Gras", tier: "fill-the-room", emoji: "🎭" },
  { id: "juneteenth", title: "Juneteenth", tier: "fill-the-room", emoji: "🌺" },
  { id: "halloween", title: "Halloween", tier: "fill-the-room", emoji: "🎃" },
  { id: "dia-de-los-muertos", title: "Día de los Muertos", tier: "fill-the-room", emoji: "🌼" },
  { id: "housewarming", title: "Housewarming", tier: "fill-the-room", emoji: "🔑" },
  { id: "home-wedding-reception", title: "Home Wedding Reception", tier: "fill-the-room", emoji: "💒" },
  { id: "eid-al-fitr", title: "Eid al-Fitr", tier: "fill-the-room", emoji: "🌙" },
  { id: "thanksgiving-harvest", title: "Thanksgiving & Harvest", tier: "fill-the-room", emoji: "🍂" },
  { id: "christmas-dinner", title: "Christmas Dinner", tier: "fill-the-room", emoji: "🎄" },
  { id: "new-years-eve", title: "New Year's Eve", tier: "fill-the-room", emoji: "🥂" },
  { id: "spring-table", title: "Spring Table", tier: "fill-the-room", emoji: "🌷" },
  { id: "fathers-day-bbq", title: "Father's Day BBQ", tier: "fill-the-room", emoji: "🔥" },
  { id: "the-big-match", title: "The Big Match", tier: "fill-the-room", emoji: "⚽" },
  { id: "retirement", title: "Retirement", tier: "fill-the-room", emoji: "🌅" },
  { id: "open-house", title: "Open House", tier: "fill-the-room", emoji: "🚪" },
];
