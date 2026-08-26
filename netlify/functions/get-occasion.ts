import { createClient } from "@supabase/supabase-js";
import fullData from "../../server/occasions-full.json" assert { type: "json" };

/**
 * Serves full recipe data (ingredients, method, swaps, timeline) for a
 * single occasion — but ONLY if the caller is entitled.
 *
 * Replaces the old approach where occasions.json (all 38 recipes) shipped
 * in the client bundle regardless of purchase status. That file is now
 * split: src/data/occasions-preview.json (public, metadata-only + the
 * free occasion) ships in the bundle; server/occasions-full.json (this
 * function's data source) never does — see scripts/split-occasions.py.
 *
 * Entitlement is proven one of two ways, matching the existing app:
 *   1. Supabase session — the browser sends its access token, we look up
 *      the user's email against public.entitlements.
 *   2. Gumroad license key — sent directly in the request body, verified
 *      against public.entitlements by license_key.
 *
 * Frontend usage (see src/lib/access.ts patch):
 *   POST /api/get-occasion  { occasionId, licenseKey? }
 *   Authorization: Bearer <supabase access token>   (if logged in)
 */

const FREE_OCCASION_IDS = new Set(["romantic-anniversary-dinner"]);

interface OccasionRecord {
  id: string;
  [key: string]: unknown;
}

const OCCASIONS_BY_ID = new Map<string, OccasionRecord>(
  (fullData as { occasions: OccasionRecord[] }).occasions.map((o) => [o.id, o])
);

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return json({ ok: false, message: "Method not allowed" }, 405);
  }

  const { occasionId, licenseKey } = (await req.json().catch(() => ({}))) as {
    occasionId?: string;
    licenseKey?: string;
  };

  if (!occasionId) return json({ ok: false, message: "Missing occasionId" }, 400);

  const occasion = OCCASIONS_BY_ID.get(occasionId);
  if (!occasion) return json({ ok: false, message: "Unknown occasion" }, 404);

  // The one free occasion is always servable, no check needed.
  if (FREE_OCCASION_IDS.has(occasionId)) {
    return json({ ok: true, occasion }, 200);
  }

  const entitled = await checkEntitlement(req, licenseKey);
  if (!entitled) {
    return json({ ok: false, message: "Not unlocked. Purchase or verify a license key." }, 403);
  }

  return json({ ok: true, occasion }, 200);
};

async function checkEntitlement(req: Request, licenseKey?: string): Promise<boolean> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Path 1: logged-in Supabase session — trust the verified email on the JWT.
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length);
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (!userErr && userData.user?.email) {
      const { data } = await supabase
        .from("entitlements")
        .select("id")
        .eq("refunded", false)
        .ilike("email", userData.user.email)
        .limit(1);
      if (data && data.length > 0) return true;
    }
  }

  // Path 2: license key sent directly (unlock screen, no login required).
  if (licenseKey) {
    const { data } = await supabase
      .from("entitlements")
      .select("id")
      .eq("refunded", false)
      .eq("license_key", licenseKey)
      .limit(1);
    if (data && data.length > 0) return true;
  }

  return false;
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config = { path: "/api/get-occasion" };
