/**
 * Local-first persistence. localStorage remains the primary store — exactly
 * like the original product. Cloud sync (lib/supabase.ts) layers on top.
 */
const PREFIX = "tbt:";

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    window.dispatchEvent(new Event("tbt-dirty"));
  } catch {
    /* quota / private mode: intentionally silent, app stays usable */
  }
}

export function remove(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

/**
 * One-time migration from the original book's state.
 * Original keys (found in Phase 0):
 *   'tbt_v4_state'  → { current, globalUnit, rState: { [page]: { serves, mode, unit } } }
 *   'tbt-note-*'    → per-recipe notes (read as-is when the notes UI lands, Phase 2)
 *   'tbt-shop-*'    → shopping check-offs (read as-is, Phase 2)
 * Owners who used the HTML book in the same browser keep their guest counts
 * and unit choice automatically.
 */
export function migrateLegacyStorage(): void {
  try {
    if (localStorage.getItem(PREFIX + "migrated-v4")) return;
    const raw = localStorage.getItem("tbt_v4_state");
    if (raw) {
      const snap = JSON.parse(raw) as {
        globalUnit?: string;
        rState?: Record<string, { serves?: number }>;
      };
      if (snap.globalUnit === "us" || snap.globalUnit === "metric") {
        save("units", snap.globalUnit);
      }
      if (snap.rState) {
        const serves: Record<number, number> = {};
        for (const [page, st] of Object.entries(snap.rState)) {
          if (st && typeof st.serves === "number") serves[Number(page)] = st.serves;
        }
        save("serves", serves);
      }
    }
    localStorage.setItem(PREFIX + "migrated-v4", "1");
  } catch {
    /* never block startup on migration */
  }
}
