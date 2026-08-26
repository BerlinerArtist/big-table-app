import { useEffect, useState } from "react";
import { OCCASIONS } from "./data/loader";
import type { UnitSystem } from "./data/types";
import { load, save } from "./lib/storage";
import { initSync } from "./lib/sync";
import type { SavedMenu } from "./lib/menus";
import TopBar from "./ui/TopBar";
import Toc from "./ui/Toc";
import Recipe from "./ui/Recipe";

/** Deep links: every occasion is pin-addressable via #/occasion-id (38 free landing pages). */
function readHash(): string | null {
  const h = window.location.hash.replace(/^#\/?/, "");
  return h && (h === "toc" || OCCASIONS.some((o) => o.id === h)) ? h : null;
}

export default function App() {
  const [view, setViewState] = useState<string>(() => readHash() ?? load("view", "toc"));
  const [system, setSystemState] = useState<UnitSystem>(() => load("units", "metric"));
  const [servesByPage, setServesByPage] = useState<Record<number, number>>(() => load("serves", {}));
  const [serveAtByPage, setServeAtByPage] = useState<Record<number, string>>(() => load("serveAtMap", {}));
  const [loggedIn, setLoggedIn] = useState(false);
  const [, setUnlockTick] = useState(0);

  useEffect(() => {
    const onHash = () => {
      const h = readHash();
      if (h) { setViewState(h); save("view", h); window.scrollTo(0, 0); }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    initSync(setLoggedIn);
    const bump = () => setUnlockTick((t) => t + 1);
    window.addEventListener("tbt-unlocked", bump);
    return () => window.removeEventListener("tbt-unlocked", bump);
  }, []);

  const setView = (v: string) => {
    setViewState(v);
    save("view", v);
    const target = v === "toc" ? "#/" : "#/" + v;
    if (window.location.hash !== target) window.location.hash = target;
    window.scrollTo(0, 0);
  };
  const setSystem = (s: UnitSystem) => { setSystemState(s); save("units", s); };

  const openMenu = (m: SavedMenu) => {
    const occ = OCCASIONS.find((o) => o.id === m.occasion_id);
    if (!occ) return;
    const serves = { ...servesByPage, [occ.page]: m.guest_count };
    setServesByPage(serves); save("serves", serves);
    if (m.data?.serveAt) {
      const at = { ...serveAtByPage, [occ.page]: m.data.serveAt };
      setServeAtByPage(at); save("serveAtMap", at);
    }
    setView(occ.id);
  };

  const occ = view === "toc" ? null : OCCASIONS.find((o) => o.id === view) ?? null;

  return (
    <>
      <TopBar
        system={system}
        setSystem={setSystem}
        onContents={() => setView("toc")}
        showContents={occ !== null}
      />
      {occ ? (
        <Recipe
          key={occ.id}
          occ={occ}
          system={system}
          loggedIn={loggedIn}
          serves={servesByPage[occ.page] ?? occ.slider.default}
          setServes={(v) => {
            const next = { ...servesByPage, [occ.page]: v };
            setServesByPage(next);
            save("serves", next);
          }}
          serveAt={serveAtByPage[occ.page] ?? "19:00"}
          setServeAt={(t) => {
            const next = { ...serveAtByPage, [occ.page]: t };
            setServeAtByPage(next);
            save("serveAtMap", next);
          }}
          onUnlocked={() => setUnlockTick((t) => t + 1)}
        />
      ) : (
        <Toc onOpen={setView} loggedIn={loggedIn} onOpenMenu={openMenu} />
      )}
    </>
  );
}
