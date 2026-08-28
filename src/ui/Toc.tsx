import { useEffect, useMemo, useState } from "react";
import { OCCASIONS } from "../data/loader";
import type { OccasionData, UnitSystem } from "../data/types";
import { canView } from "../lib/access";
import { listMenus, deleteMenu, type SavedMenu } from "../lib/menus";
import Account from "./Account";
import TopBar from "./TopBar";

function Card({ o, onOpen }: { o: OccasionData; onOpen: (id: string) => void }) {
  const stars = o.difficulty
    ? "★".repeat(o.difficulty) + "☆".repeat(Math.max(0, 3 - o.difficulty))
    : "";
  const open = canView(o.id);
  return (
    <button
      className={"occ-card " + (o.tier === "around-the-table" ? "att" : "ftr") + (open ? "" : " locked")}
      onClick={() => onOpen(o.id)}
    >
      <div className="occ-name">{o.occasion}{!open && <span className="lock"> 🔒</span>}</div>
      <div className="occ-recipe">{o.recipeTitle}</div>
      <div className="occ-meta">
        <span>{o.slider.min}–{o.slider.max} guests</span>
        {stars && <span className="occ-stars">{stars}</span>}
      </div>
    </button>
  );
}

export default function Toc(props: {
  onOpen: (id: string) => void;
  loggedIn: boolean;
  onOpenMenu: (m: SavedMenu) => void;
  system: UnitSystem;
  setSystem: (s: UnitSystem) => void;
}) {
  const around = OCCASIONS.filter((o) => o.tier === "around-the-table");
  const fill = OCCASIONS.filter((o) => o.tier === "fill-the-room");
  const [menus, setMenus] = useState<SavedMenu[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (props.loggedIn) listMenus().then(setMenus);
    else setMenus([]);
  }, [props.loggedIn]);

  const occName = (id: string) => OCCASIONS.find((o) => o.id === id)?.occasion ?? id;

  // Search matches on occasion name, recipe title, and cuisine — same
  // fields the original book's search covered. Empty query shows nothing
  // filtered (normal two-tier view below stays as-is).
  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return null;
    return OCCASIONS.filter(
      (o) =>
        o.occasion.toLowerCase().includes(q) ||
        o.recipeTitle.toLowerCase().includes(q) ||
        o.cuisine.toLowerCase().includes(q)
    );
  }, [q]);

  return (
    <div className="page-wrap">
      <TopBar system={props.system} setSystem={props.setSystem} onContents={() => {}} showContents={false} inline />
      <header className="toc-hero">
        <div className="eyebrow">An interactive kitchen guide</div>
        <h1>The Big Table</h1>
        <p className="toc-tagline">Make room for more.</p>
        <div className="toc-search">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search occasions — try "Christmas" or "birthday"…'
            aria-label="Search occasions"
          />
          {query && (
            <button className="toc-search-clear" onClick={() => setQuery("")} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
      </header>

      {results && (
        <section className="tier">
          <div className="tier-head att">
            <span className="tier-dot" />
            {results.length === 0 ? "No matches" : `${results.length} match${results.length === 1 ? "" : "es"}`}
          </div>
          {results.length > 0 && (
            <div className="occ-grid">
              {results.map((o) => <Card key={o.id} o={o} onOpen={props.onOpen} />)}
            </div>
          )}
        </section>
      )}

      {!results && props.loggedIn && menus.length > 0 && (
        <section className="tier">
          <div className="tier-head att"><span className="tier-dot" />My Menus</div>
          <div className="menus">
            {menus.map((m) => (
              <div className="menu-row" key={m.id}>
                <button className="menu-open" onClick={() => props.onOpenMenu(m)}>
                  <strong>{m.name}</strong>
                  <span> · {occName(m.occasion_id)} · {m.guest_count} guests</span>
                </button>
                <button
                  className="menu-del"
                  onClick={() => deleteMenu(m.id).then(() => listMenus().then(setMenus))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {!results && (
        <>
          <section className="tier">
            <div className="tier-head att">
              <span className="tier-dot" />Around the Table <em>· 2–16 guests</em>
            </div>
            <div className="occ-grid">
              {around.map((o) => <Card key={o.id} o={o} onOpen={props.onOpen} />)}
            </div>
          </section>

          <section className="tier">
            <div className="tier-head ftr">
              <span className="tier-dot" />Fill the Room <em>· 16–60 guests</em>
            </div>
            <div className="occ-grid">
              {fill.map((o) => <Card key={o.id} o={o} onOpen={props.onOpen} />)}
            </div>
          </section>
        </>
      )}

      <Account loggedIn={props.loggedIn} />
      <footer className="foot">38 occasions · every culture · every gathering</footer>
    </div>
  );
}
