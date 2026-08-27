import { getLicense } from "./license";
import { load } from "./storage";
import { supabase } from "./supabase";
import type { OccasionData } from "../data/types";

/**
 * Preview gate — now backed by a real server-side check.
 *
 * canView() / isUnlocked() are unchanged and still drive the UI (locked
 * badges in the ToC, the LockPanel in Recipe.tsx). What's new is
 * fetchFullOccasion(): the actual recipe data (ingredients, method, swaps,
 * timeline) for anything other than the free occasion no longer ships in
 * the client bundle. It's requested from the get-occasion Netlify Function,
 * which re-checks entitlement server-side before returning anything.
 *
 * This closes the gap noted before: a determined user could previously
 * read the full recipe straight out of the bundled occasions.json
 * regardless of what the UI showed. Now the data simply isn't there to
 * read — the function is the only source, and it enforces the same
 * entitlements table Gumroad's webhook already writes to.
 */
export const FREE_OCCASION_IDS = ["romantic-anniversary-dinner"];
export const GUMROAD_URL = "https://mindabovemess.gumroad.com/l/cohkxs";
export const PRICE_LABEL = "$27";

export function isUnlocked(): boolean {
  return getLicense() !== null || load<boolean>("entitled", false);
}

export function canView(occasionId: string): boolean {
  return isUnlocked() || FREE_OCCASION_IDS.includes(occasionId);
}

/**
 * Fetches the full recipe record for an occasion from the server.
 * - For the free occasion, the preview bundle already has everything, so
 *   callers can skip this and use the local record directly.
 * - For everything else, this is the ONLY way to get ingredients/phases/
 *   swaps/timeline. Returns null if the server rejects the request
 *   (not entitled) — callers should fall back to the LockPanel in that case.
 */
export async function fetchFullOccasion(occasionId: string): Promise<OccasionData | null> {
  const licenseKey = getLicense()?.key;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch("/api/get-occasion", {
    method: "POST",
    headers,
    body: JSON.stringify({ occasionId, licenseKey }),
  });

  if (!res.ok) return null;
  const body = (await res.json()) as { ok: boolean; occasion?: OccasionData };
  return body.ok && body.occasion ? body.occasion : null;
}
