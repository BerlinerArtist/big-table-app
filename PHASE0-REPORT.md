# Phase 0 Report — Code Analysis & Extraction
**Source:** `TheBigTable.html` (574 KB · 6,386 lines · 41 pages: p0–p2 front matter, p3–p40 = the 38 occasions)

## How the original works
- **The DOM is the database.** Every ingredient is `<span class="i-qty" data-base data-serves data-unit>` inside an `.i-item`. 509 ingredients total.
- **Scaling core:** `scaled = (base / baseServes) × serves`, re-rendered on slider input (`updateRecipe`) and unit switch (`setUnit`).
- **Metric is the single source of truth.** US is computed live via `fmtUS`; there is no dual storage.
- **State:** `rState[page] = { serves, mode: 'att'|'ftr', unit }`, persisted as `tbt_v4_state = { current, globalUnit, rState }`. Notes: `tbt-note-*`. Shopping check-offs: `tbt-shop-*`.
- **Device Sync** = `btoa(JSON of every localStorage key starting with 'tbt')`.
- **Plan Your Day:** `window.TL_DATA[page] = [[name, minutes], …]`, scheduled backwards from serve time; 0-duration steps ("Serve") pin to the cursor. The unit toggle also switches the clock: metric → 24h, US → 12h AM/PM.
- **Temperatures** live as text ("160°C / 320°F") in stat chips; `applyTemperatureUnit` rewrites text nodes.
- **Smart Swaps are advisory text lines** (category + instruction), not interactive ingredient replacement.
- **Sliders are per-page** (e.g. Anniversary 2–12, Funeral 6–16, Fill-the-Room 16–60). `FOR_TWO_PAGES = [3, 10, 17]`.
- 5 phase cards per recipe; `updatePhaseCards` injects times from the schedule.

## Extracted → `src/data/occasions.json`
38 occasions · 509 ingredients · 38 timelines · swaps · phases · nutrition per serving · pairings · notes · stat/detail chips · per-page slider ranges & defaults. Zero gaps.

## Ported 1:1 → `src/engine/`
`format.ts` (exact fmtMetric/fmtUS rounding + unit-aware clock), `planner.ts` (backwards scheduler incl. 0-duration pinning), `scale.ts` (scaling core), `shoppingList.ts`, plus legacy-state migration in `lib/storage.ts` (`tbt_v4_state` → app keys; note/shop keys read as-is later).

## Parity regression — 496/509 identical, 13 informative deviations
1. **12× stock quantities ("1000ml" vs "1L"):** the static HTML was hand-typed as "1000ml", but the original engine itself renders "1L" the moment the slider or unit toggle is touched. The port matches the **engine** — the runtime behavior is identical.
2. **1× real bug found in the original (p32 Nowruz, saffron):** `fmtMetric` floors every gram value at **10g** (`Math.max(10, …)`). Hand-typed "2g" of saffron becomes **10g** on first slider touch — a 5× overdose of the most expensive spice in the book, at every guest count. The port reproduces this faithfully. **Recommended fix (both products, one line):** only apply the 10g floor when the base value is ≥ 10g, otherwise round to 1g.

## Open for Phase 2+
Notes & shopping check-off UI (keys compatible) · phase-card time injection · sync import/export UI (superseded by cloud sync) · occasion search (`OCC_MAP`) · front-matter pages & page-flip presentation · lazy-load occasions.json.
