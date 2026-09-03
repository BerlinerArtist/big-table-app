import { useEffect, useMemo, useState } from "react";
import type { OccasionData, UnitSystem } from "../data/types";
import { scaledDisplay } from "../engine/scale";
import { fmtOven } from "../engine/format";
import { planBackwards, stepTime, durText } from "../engine/planner";
import { buildShoppingList } from "../engine/shoppingList";
import {
  loadNote, saveNote, getShopChecks, saveShopCheck, clearShopChecks,
} from "../lib/legacy";
import { canView, fetchFullOccasion, GUMROAD_URL, PRICE_LABEL } from "../lib/access";
import { activateLicense } from "../lib/license";
import { saveMenu } from "../lib/menus";
import TopBar from "./TopBar";

/**
 * CHANGED: occ arriving as a prop may now be metadata-only (locked
 * occasions no longer ship full detail in the bundle — see
 * data/loader.ts and lib/access.ts). This component now fetches the
 * full record from the server when needed:
 *
 *   - Free occasion, or already unlocked client-side (license/entitled
 *     flag cached from a previous session): try the server fetch so a
 *     legitimately unlocked user always gets live data; fall back to the
 *     metadata-only prop's LockPanel only if that fetch is rejected
 *     (e.g. cache was stale, entitlement since refunded).
 *   - Not unlocked at all: skip the fetch, show LockPanel immediately —
 *     no point calling the server for a 403 we already expect.
 */
export default function Recipe(props: {
  occ: OccasionData;
  system: UnitSystem;
  setSystem: (s: UnitSystem) => void;
  onContents: () => void;
  serves: number;
  setServes: (v: number) => void;
  serveAt: string;
  setServeAt: (t: string) => void;
  loggedIn: boolean;
  onUnlocked: () => void;
}) {
  const { system, serves, setServes, serveAt, setServeAt } = props;
  const [menuMsg, setMenuMsg] = useState<string | null>(null);

  // How many of `serves` guests are eating each swap version, keyed by
  // category. Everyone NOT accounted for here eats the main dish — the
  // main-dish count is always the computed remainder, never entered
  // directly, so there's only ever addition to verify, never subtraction.
  const [swapCounts, setSwapCounts] = useState<Record<string, number>>({});
  const [swapsExpanded, setSwapsExpanded] = useState(false);

  // Full-detail occasion record, once (if) fetched from the server.
  const [fullOcc, setFullOcc] = useState<OccasionData | null>(
    canView(props.occ.id) && props.occ.ingredients?.length > 0 ? props.occ : null
  );
  const [loading, setLoading] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFullOcc(canView(props.occ.id) && props.occ.ingredients?.length > 0 ? props.occ : null);
    setFetchFailed(false);

    if (!canView(props.occ.id)) return; // not entitled locally — don't bother calling the server
    if (props.occ.ingredients?.length > 0) return; // free occasion, already complete

    setLoading(true);
    fetchFullOccasion(props.occ.id)
      .then((full) => {
        if (cancelled) return;
        if (full) setFullOcc(full);
        else setFetchFailed(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.occ.id]);

  // A stale split from a previous guest count could silently outlive a
  // change to `serves` (e.g. slider drops from 11 to 6 after "3 veg + 2
  // pescatarian" was set) and produce a wrong or even negative remainder.
  // Clamp: if the total of all swap counts now exceeds `serves`, scale
  // them back down proportionally so they never exceed the new total.
  useEffect(() => {
    setSwapCounts((prev) => {
      const sum = Object.values(prev).reduce((a, b) => a + b, 0);
      if (sum <= serves) return prev;
      if (sum === 0) return prev;
      const ratio = serves / sum;
      const next: Record<string, number> = {};
      for (const [k, v] of Object.entries(prev)) next[k] = Math.floor(v * ratio);
      return next;
    });
  }, [serves]);

  const occ = fullOcc ?? props.occ;
  const accent = occ.tier === "around-the-table" ? "att" : "ftr";

  const swapCountSum = Object.values(swapCounts).reduce((a, b) => a + b, 0);
  const mainDishCount = Math.max(0, serves - swapCountSum);
  const activeSwapExtras = useMemo(
    () =>
      occ.swaps
        .map((sw) => ({ ingredients: sw.ingredients ?? [], count: swapCounts[sw.category] ?? 0 }))
        .filter((e) => e.count > 0 && e.ingredients.length > 0),
    [occ.swaps, swapCounts]
  );
  const shopping = useMemo(
    () => (fullOcc ? buildShoppingList(occ, mainDishCount, system, activeSwapExtras) : []),
    [occ, mainDishCount, system, fullOcc, activeSwapExtras]
  );
  const plan = useMemo(() => {
    const [h, m] = serveAt.split(":").map(Number);
    return planBackwards(occ.timeline, (h || 19) * 60 + (m || 0));
  }, [occ, serveAt]);
  const stars = occ.difficulty
    ? "★".repeat(occ.difficulty) + "☆".repeat(Math.max(0, 3 - occ.difficulty))
    : null;

  const [note, setNote] = useState(() => loadNote(occ.page));
  const [checks, setChecks] = useState<Record<string, true>>(() => getShopChecks(occ.page));

  const toggleCheck = (name: string) => {
    saveShopCheck(occ.page, name, !checks[name]);
    setChecks(getShopChecks(occ.page));
  };
  const clearAll = () => { clearShopChecks(occ.page); setChecks({}); };
  const onNote = (v: string) => { setNote(v); saveNote(occ.page, v); };
  const exportPack = async () => {
    const { exportKitchenPack } = await import("../lib/pdf");
    exportKitchenPack(occ, serves, system, serveAt, note, mainDishCount, activeSwapExtras);
  };
  const exportShopping = async () => {
    const { exportShoppingList } = await import("../lib/pdf");
    exportShoppingList(occ, serves, system, mainDishCount, activeSwapExtras);
  };

  const locked = !canView(props.occ.id) || (loading && !fullOcc) || (fetchFailed && !fullOcc);

  if (locked) {
    return (
      <div className={"page-wrap recipe " + accent}>
        <TopBar system={props.system} setSystem={props.setSystem} onContents={props.onContents} showContents inline />
        <header className="r-hero">
          <div className="eyebrow">
            <span className="tier-dot" />
            {occ.occasion} · {occ.tier === "around-the-table" ? "Around the Table" : "Fill the Room"}
          </div>
          <h1 className="r-title">{occ.recipeTitle}</h1>
          <div className="r-cuisine">{occ.cuisine}</div>
        </header>
        <div className="chips">
          {occ.stats.map((st) => (
            <div className="chip" key={st.label}>
              <div className="chip-val">{/Difficulty/.test(st.label) && stars ? stars : st.value}</div>
              <div className="chip-lbl">{st.label}</div>
            </div>
          ))}
        </div>
        {loading ? (
          <p className="status">Checking your access…</p>
        ) : (
          <LockPanel onUnlocked={props.onUnlocked} />
        )}
      </div>
    );
  }

  return (
    <div className={"page-wrap recipe " + accent}>
      <TopBar system={props.system} setSystem={props.setSystem} onContents={props.onContents} showContents inline />
      <header className="r-hero">
        <div className="eyebrow">
          <span className="tier-dot" />
          {occ.occasion} · {occ.tier === "around-the-table" ? "Around the Table" : "Fill the Room"}
        </div>
        <h1 className="r-title">{occ.recipeTitle}</h1>
        <div className="r-cuisine">{occ.cuisine}</div>
        {occ.swaps.length > 0 && (
          <p className="diet-hint">
            Cooking for a mix of diets? This recipe covers {occ.swaps.map((sw) => sw.category.toLowerCase()).join(", ")}
            , alongside the main dish — use the diet counters in Smart Swaps below, and each portion
            scales to exactly how many guests chose it. Every dish is timed to cook together, so read the
            full method once before you start.
          </p>
        )}
      </header>

      <div className="chips">
        {occ.ovenCelsius !== null && (
          <div className="chip">
            <div className="chip-val">{fmtOven(occ.ovenCelsius, system)}</div>
            <div className="chip-lbl">Oven</div>
          </div>
        )}
        {occ.stats.filter((s) => !/Temp/.test(s.label)).map((s) => (
          <div className="chip" key={s.label}>
            <div className="chip-val">{/Difficulty/.test(s.label) && stars ? stars : s.value}</div>
            <div className="chip-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="panel control">
        <div className="serves-row">
          <div className="serves-count">{serves} <em>people</em></div>
          <div className="serves-range">
            scales {occ.slider.min}–{occ.slider.max}{occ.forTwo ? " · written for two" : ""}
          </div>
        </div>
        <input
          className="slider"
          type="range"
          min={occ.slider.min}
          max={occ.slider.max}
          value={serves}
          onChange={(e) => setServes(+e.target.value)}
        />
        <div className="shop-actions" style={{ marginTop: 14 }}>
          <button className="primary" onClick={exportPack}>Export Kitchen Pack · PDF</button>
          {props.loggedIn && (
            <button
              className="ghost"
              onClick={async () => {
                const name = window.prompt("Name this menu:", occ.occasion);
                if (!name) return;
                const ok = await saveMenu(name, occ.id, serves, serveAt);
                setMenuMsg(ok ? "Saved — find it under My Menus." : "Could not save (are you signed in?).");
              }}
            >
              Save menu
            </button>
          )}
        </div>
        {menuMsg && <p className="status">{menuMsg}</p>}
      </section>

      <div className="cols">
        <section className="panel">
          <div className="panel-lbl">The Method</div>
          {swapCountSum > 0 && (
            <p className="method-swap-note">
              These steps are for the {mainDishCount === 1 ? "1 guest" : `${mainDishCount} guests`} eating{" "}
              {occ.recipeTitle}.
            </p>
          )}
          {occ.phases.map((ph) => (
            <div className="phase" key={ph.name}>
              <div className="phase-ico">{ph.icon}</div>
              <div className="phase-body">
                <div className="phase-top">
                  <span className="phase-name">{ph.name}</span>
                  {ph.pill && <span className="pill">{ph.pill}</span>}
                </div>
                <div className="phase-desc">{ph.desc}</div>
              </div>
            </div>
          ))}

          {occ.swaps
            .filter((sw) => (swapCounts[sw.category] ?? 0) > 0)
            .map((sw) => (
              <div className="swap-method-block" key={sw.category}>
                <div className="swap-method-lbl">
                  {sw.category} — for {swapCounts[sw.category]}{" "}
                  {swapCounts[sw.category] === 1 ? "guest" : "guests"}
                </div>
                {sw.phases && sw.phases.length > 0 ? (
                  sw.phases.map((ph) => (
                    <div className="phase" key={sw.category + ph.name}>
                      <div className="phase-ico">{ph.icon}</div>
                      <div className="phase-body">
                        <div className="phase-top">
                          <span className="phase-name">{ph.name}</span>
                          {ph.pill && <span className="pill">{ph.pill}</span>}
                        </div>
                        <div className="phase-desc">{ph.desc}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="method-swap-note">
                    Full steps for this swap aren't written up yet — for now: {sw.text}
                  </p>
                )}
              </div>
            ))}
        </section>

        <section className="panel">
          <div className="panel-lbl">Ingredients</div>
          <div className="panel-sub">
            {mainDishCount === serves ? "scaled to your table" : `scaled to ${mainDishCount} eating the main dish`}
          </div>
          {swapCountSum > 0 && mainDishCount === 0 && (
            <p className="method-swap-note main-dish-low-warning">
              Nobody's on the main dish — {occ.recipeTitle} won't be served at all tonight, only the
              swap(s) below. If that's intentional, ignore this. Otherwise, move at least one person back
              to the main dish.
            </p>
          )}
          {swapCountSum > 0 && mainDishCount > 0 && mainDishCount < occ.slider.min && (
            <p className="method-swap-note main-dish-low-warning">
              This recipe is written for {occ.slider.min}+ people. At {mainDishCount} on the main dish,
              some quantities below may round to zero or to amounts too small to actually buy — check the
              list below before shopping, or move everyone to a swap instead.
            </p>
          )}
          <ul className="ing">
            {occ.ingredients.map((ing) => (
              <li key={ing.name}>
                <span className="ing-name">{ing.name}</span>
                <span className="ing-qty">{scaledDisplay(ing, mainDishCount, system)}</span>
              </li>
            ))}
          </ul>
          {occ.swaps.length > 0 && (
            <div className="swaps">
              <div className="swaps-lbl">Smart Swaps · Nobody Left Behind</div>

              {!swapsExpanded && (
                <button
                  type="button"
                  className="swaps-toggle"
                  onClick={() => setSwapsExpanded(true)}
                >
                  + Different diets at this table
                </button>
              )}

              {swapsExpanded && (
                <>
                  <div className="swaps-total-row">
                    <span>{serves} people, total</span>
                    <button
                      type="button"
                      className="swaps-hide"
                      onClick={() => setSwapsExpanded(false)}
                    >
                      hide diets
                    </button>
                  </div>

                  <div className="swap-main-row">
                    <span>Main dish{fullOcc ? ` (${occ.recipeTitle})` : ""}</span>
                    <span className="ing-qty">{mainDishCount}</span>
                  </div>

                  {occ.swaps.map((sw) => {
                    const count = swapCounts[sw.category] ?? 0;
                    return (
                      <div className="swap-stepper-row" key={sw.category}>
                        <div className="swap-stepper-label">
                          <strong>{sw.category}</strong>
                          <span className="swap-stepper-desc">{sw.text}</span>
                        </div>
                        <div className="swap-stepper-control">
                          <button
                            type="button"
                            aria-label={`Fewer ${sw.category}`}
                            disabled={count <= 0}
                            onClick={() =>
                              setSwapCounts((prev) => ({
                                ...prev,
                                [sw.category]: Math.max(0, (prev[sw.category] ?? 0) - 1),
                              }))
                            }
                          >
                            −
                          </button>
                          <span>{count}</span>
                          <button
                            type="button"
                            aria-label={`More ${sw.category}`}
                            disabled={mainDishCount <= 0}
                            onClick={() =>
                              setSwapCounts((prev) => {
                                // Guard against overshoot inside the functional
                                // update itself, not just via the `disabled`
                                // attribute — two "+" clicks on different rows
                                // fired before a re-render would both read the
                                // same stale mainDishCount otherwise, letting
                                // the true sum exceed `serves`.
                                const sum = Object.values(prev).reduce((a, b) => a + b, 0);
                                if (sum >= serves) return prev;
                                return { ...prev, [sw.category]: (prev[sw.category] ?? 0) + 1 };
                              })
                            }
                          >
                            +
                          </button>
                        </div>
                        {sw.ingredients && sw.ingredients.length > 0 && count > 0 && (
                          <ul className="swap-ing-list">
                            {sw.ingredients.map((ing) => (
                              <li key={ing.name}>
                                <span>{ing.name}</span>
                                <span className="ing-qty">{scaledDisplay(ing, count, system)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                  <p className="swaps-sum-hint">
                    {mainDishCount} + {occ.swaps.map((sw) => swapCounts[sw.category] ?? 0).join(" + ")} = {serves}, added up as you go
                  </p>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-lbl">⏳ Plan Your Day</div>
        <div className="serve-row">
          <label>Serve at</label>
          <input type="time" value={serveAt} onChange={(e) => setServeAt(e.target.value)} />
        </div>
        <div className="tl">
          {plan.map((st, i) => (
            <div className="tl-step" key={i}>
              <div className={"tl-dot" + (st.isServe ? " serve" : "")} />
              <div className="tl-time">{stepTime(st, system)}</div>
              <div className="tl-name">
                {st.name}
                {st.dur > 0 && <span className="tl-dur">{durText(st.dur)}</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="notes">
          <label>Your notes</label>
          <textarea
            value={note}
            onChange={(e) => onNote(e.target.value)}
            placeholder="Timings, tweaks, who sat where…"
            rows={3}
          />
        </div>
      </section>

      <section className="panel">
        <div className="panel-lbl">Shopping List</div>
        <ul className="shop">
          {shopping.map((it) => (
            <li key={it.name} className={checks[it.name] ? "done" : ""} onClick={() => toggleCheck(it.name)}>
              <span className="box">{checks[it.name] ? "✓" : ""}</span>
              <span className="ing-name">{it.name}</span>
              <span className="ing-qty">{it.qty}</span>
            </li>
          ))}
        </ul>
        <div className="shop-actions">
          <button className="primary" onClick={exportShopping}>
            Export as PDF
          </button>
          <button className="ghost" onClick={clearAll}>Clear check-offs</button>
        </div>
      </section>

      {(occ.pairings.length > 0 || occ.notes.length > 0 || Object.keys(occ.nutritionPerServing).length > 0) && (
        <section className="panel">
          <div className="panel-lbl">To Drink & Good to Know</div>
          {occ.pairings.map((t) => <div className="line" key={t}>🍷 {t}</div>)}
          {occ.notes.map((t) => <div className="line" key={t}>· {t}</div>)}
          {Object.keys(occ.nutritionPerServing).length > 0 && (
            <div className="nutr">
              {Object.entries(occ.nutritionPerServing).map(([k, v]) => `${v} ${k}`).join(" · ")}
              <span className="dim"> · per serving, approximate</span>
            </div>
          )}
        </section>
      )}
    </div>
  );
}


function LockPanel({ onUnlocked }: { onUnlocked: () => void }) {
  const [key, setKey] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <section className="panel lock-panel">
      <div className="panel-lbl">This table is still set behind the door</div>
      <p className="lock-pitch">
        The Big Table holds 38 occasions like this one — every recipe scaling
        live from an intimate two to a room of sixty, with Smart Swaps, a
        day planner that thinks backwards from serving time, and printable
        Kitchen Packs.
      </p>
      <a className="primary lock-cta" href={GUMROAD_URL} target="_blank" rel="noreferrer">
        Unlock all 38 occasions · {PRICE_LABEL}
      </a>
      <div className="lock-divider">Already at the table?</div>
      <div className="row">
        <div>
          <label>Gumroad license key</label>
          <input
            type="text"
            value={key}
            placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
            onChange={(e) => setKey(e.target.value)}
          />
        </div>
        <button
          className="primary"
          onClick={async () => {
            const r = await activateLicense(key);
            setMsg(r.message);
            if (r.ok) { window.dispatchEvent(new Event("tbt-unlocked")); onUnlocked(); }
          }}
        >
          Verify
        </button>
      </div>
      {msg && <p className="status warn">{msg}</p>}
    </section>
  );
}
