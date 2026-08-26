import { useEffect, useState } from "react";
import { OCCASIONS } from "../data/loader";
import type { OccasionData } from "../data/types";
import { canView } from "../lib/access";
import { listMenus, deleteMenu, type SavedMenu } from "../lib/menus";
import Account from "./Account";

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
}) {
  const around = OCCASIONS.filter((o) => o.tier === "around-the-table");
  const fill = OCCASIONS.filter((o) => o.tier === "fill-the-room");
  const [menus, setMenus] = useState<SavedMenu[]>([]);

  useEffect(() => {
    if (props.loggedIn) listMenus().then(setMenus);
    else setMenus([]);
  }, [props.loggedIn]);

  const occName = (id: string) => OCCASIONS.find((o) => o.id === id)?.occasion ?? id;

  return (
    <div className="page-wrap">
      <header className="toc-hero">
        <div className="eyebrow">An interactive kitchen guide</div>
        <h1>The Big Table</h1>
        <p className="toc-tagline">Make room for more.</p>
      </header>

      {props.loggedIn && menus.length > 0 && (
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

      <Account loggedIn={props.loggedIn} />
      <footer className="foot">38 occasions · every culture · every gathering</footer>
    </div>
  );
}
