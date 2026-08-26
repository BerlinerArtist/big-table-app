import raw from "./occasions-preview.json";
import type { BookData, OccasionData } from "./types";

/**
 * All 38 occasions — but only the free one has full recipe detail here.
 * The rest are metadata-only (title, cuisine, guest range, stats) so the
 * Table of Contents can render without shipping locked recipe content to
 * the client. Full detail for locked occasions comes from
 * lib/access.ts::fetchFullOccasion() at view-time, after a server-side
 * entitlement check.
 *
 * (Previously this imported occasions.json directly, which contained all
 * 38 full recipes regardless of purchase status — see scripts/split-occasions.py.)
 */
export const BOOK = raw as unknown as BookData;

export const OCCASIONS: OccasionData[] = BOOK.occasions;

export function byId(id: string): OccasionData {
  const o = OCCASIONS.find((x) => x.id === id);
  if (!o) throw new Error(`Unknown occasion: ${id}`);
  return o;
}
