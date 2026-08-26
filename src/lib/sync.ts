import { supabase } from "./supabase";
import { load, save } from "./storage";

/**
 * Phase 3 — cloud sync (code-complete, live test pending keys).
 * Local-first stays the law: localStorage is the source of truth on this
 * device. On login we PULL and fill local gaps, then PUSH the full local
 * state; afterwards every change pushes debounced. Other devices pick the
 * state up on their next login/refresh.
 */

let active = false;
let timer: number | undefined;

export function initSync(onAuth: (loggedIn: boolean) => void): void {
  if (!supabase) { onAuth(false); return; }
  supabase.auth.onAuthStateChange((_event, session) => {
    active = !!session;
    onAuth(active);
    if (session) fullSync().catch((e) => console.error("sync:", e));
  });
  window.addEventListener("tbt-dirty", schedulePush);
}

function schedulePush(): void {
  if (!active || !supabase) return;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => push().catch((e) => console.error("push:", e)), 800);
}

async function userId(): Promise<string | null> {
  const { data } = await supabase!.auth.getUser();
  return data.user?.id ?? null;
}

/* ── pull: fill local gaps from the cloud ── */
async function pull(): Promise<void> {
  const { data: st } = await supabase!.from("settings").select("*").maybeSingle();
  if (st) {
    if (localStorage.getItem("tbt:units") === null) save("units", st.units);
    const prefs = (st.prefs ?? {}) as {
      servesByPage?: Record<string, number>;
      serveAtByPage?: Record<string, string>;
      checks?: Record<string, Record<string, true>>;
    };
    fillMap("serves", prefs.servesByPage);
    fillMap("serveAtMap", prefs.serveAtByPage);
    for (const [page, checks] of Object.entries(prefs.checks ?? {})) {
      const key = "tbt-shop-" + page;
      if (localStorage.getItem(key) === null && Object.keys(checks).length) {
        localStorage.setItem(key, JSON.stringify(checks));
      }
    }
  }
  const { data: notes } = await supabase!.from("notes").select("recipe_id, body");
  for (const n of notes ?? []) {
    const key = "tbt-note-" + n.recipe_id;
    if (localStorage.getItem(key) === null && n.body) localStorage.setItem(key, n.body);
  }
}

function fillMap(localKey: string, remote?: Record<string, unknown>): void {
  if (!remote) return;
  const local = load<Record<string, unknown>>(localKey, {});
  let changed = false;
  for (const [k, v] of Object.entries(remote)) {
    if (!(k in local)) { local[k] = v; changed = true; }
  }
  if (changed) save(localKey, local);
}

/* ── push: full local state to the cloud ── */
async function push(): Promise<void> {
  const uid = await userId();
  if (!uid) return;

  const checks: Record<string, Record<string, true>> = {};
  const noteRows: { user_id: string; recipe_id: string; body: string; updated_at: string }[] = [];
  const now = new Date().toISOString();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    if (key.startsWith("tbt-shop-")) {
      try { checks[key.slice(9)] = JSON.parse(localStorage.getItem(key) || "{}"); } catch { /* skip */ }
    } else if (key.startsWith("tbt-note-")) {
      const body = localStorage.getItem(key) || "";
      if (body.trim()) noteRows.push({ user_id: uid, recipe_id: key.slice(9), body, updated_at: now });
    }
  }

  await supabase!.from("settings").upsert(
    {
      user_id: uid,
      units: load("units", "metric"),
      prefs: {
        servesByPage: load("serves", {}),
        serveAtByPage: load("serveAtMap", {}),
        checks,
      },
      updated_at: now,
    },
    { onConflict: "user_id" }
  );
  if (noteRows.length) {
    await supabase!.from("notes").upsert(noteRows, { onConflict: "user_id,recipe_id" });
  }
}

/* ── entitlement: purchase email logged in ⇒ unlock without a key ── */
async function checkEntitlement(): Promise<void> {
  const { data } = await supabase!
    .from("entitlements")
    .select("id, refunded")
    .eq("refunded", false)
    .limit(1);
  if (data && data.length > 0) {
    save("entitled", true);
    window.dispatchEvent(new Event("tbt-unlocked"));
  }
}

async function fullSync(): Promise<void> {
  await pull();
  await push();
  await checkEntitlement();
}
