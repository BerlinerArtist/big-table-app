# The Big Table — Premium Web-App

**Stand:** Phasen 0–2, 5 ✓ · Preview-Gate ✓ · PWA/Offline ✓ · Phase 3 (Sync + My Menus) code-komplett, Live-Test braucht die Keys unten · Phase 4 (Gumroad) verdrahtet, braucht Produkt-ID + Ping-Secret.

**Preview-Gate:** Frei ist „Romantic Anniversary Dinner" (deckungsgleich mit dem Landing-Page-Funnel); die 37 anderen zeigen Teaser + Unlock-Panel mit Gumroad-CTA ($27). Freischaltung per License-Key oder — nach Login — automatisch über die Kauf-E-Mail (Entitlement aus dem Ping-Webhook). Hinweis: UI-Gate; harter Server-Gate der Rezeptdaten folgt in Phase 3/4 mit Live-Keys.

Local-first Web-App: läuft komplett im Browser wie die heutige HTML-Datei.
Konto (Magic Link) und Cloud-Sync sind **optional** und schalten sich zu,
sobald Keys gesetzt sind. Freischaltung der Vollversion per **Gumroad
License Key** — Gumroad bleibt Kauf-Plattform und Merchant of Record.

## 1 · Lokal starten (0 Keys nötig)

```bash
npm install
npm run dev
```

→ http://localhost:5173 — Slider, Skalierung, Smart Swaps, US/Metric,
Einkaufsliste, Plan-Your-Day und PDF-Export laufen sofort (Beispieldaten).
Hinweis: Die License-Key-Prüfung braucht Netlify Functions; lokal dafür
`npx netlify dev` statt `npm run dev` verwenden.

## 2 · Supabase anlegen (~5 Min)

1. https://supabase.com → New project
2. SQL Editor → Inhalt von `supabase/schema.sql` einfügen → Run
3. Project Settings → API → kopieren:
   - Project URL → `VITE_SUPABASE_URL` **und** `SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (**nur** Netlify-Env, nie in Code/Git)
4. Authentication → Providers → Email: "Magic Link" aktiv lassen

## 3 · Gumroad verbinden (~3 Min)

1. Produkt (cohkxs) → Einstellungen → **"Generate a unique license key per sale"** aktivieren
2. Produkt-ID kopieren → `GUMROAD_PRODUCT_ID`
3. Settings → Advanced → **Ping** → URL eintragen:
   `https://DEINE-SITE.netlify.app/api/gumroad-webhook?secret=DEIN_PING_SECRET`
4. `PING_SECRET` = frei gewähltes langes Passwort (identisch in Netlify-Env)

## 4 · Netlify deployen

1. Repo zu GitHub pushen → Netlify → "Import from Git" (build: `npm run build`, publish: `dist` — steht schon in `netlify.toml`)
2. Site settings → Environment variables → alle Werte aus `.env.example` eintragen
3. Deploy → Testkauf über den `/foryou`-Link → Key in der App prüfen

## Phase 0: erledigt ✓

- `src/data/occasions.json` → alle 38 Anlässe, 509 Zutaten, 38 Timelines aus der Original-HTML extrahiert
- Engine (`src/engine/`) → 1:1-Port der Original-Rundung, Planner-Logik und Uhrzeitformate (Parität: 496/509, Rest siehe PHASE0-REPORT.md)
- `migrateLegacyStorage()` → übernimmt `tbt_v4_state` (Gästezahlen + Einheiten) von Bestandsnutzern automatisch

## Architektur in einem Satz

Rezeptdaten liegen im Client-Bundle (wie heute), Nutzerdaten (Menüs, Notizen,
Einstellungen) local-first in localStorage mit optionalem Supabase-Sync,
Käufe kommen per Gumroad-Ping in `entitlements`, Freischaltung per License-Key
über eine Netlify Function — kein eigener Server, keine laufenden Fixkosten.
