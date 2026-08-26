import { createClient } from "@supabase/supabase-js";

/**
 * Verifies a Gumroad license key server-side and marks the
 * entitlement as activated.
 *
 * Prerequisite in Gumroad: enable "Generate a unique license key per
 * sale" on the product. Set GUMROAD_PRODUCT_ID in the Netlify env.
 */
export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { licenseKey } = (await req.json().catch(() => ({}))) as {
    licenseKey?: string;
  };
  if (!licenseKey) return json({ ok: false, message: "No key provided." }, 400);

  const gumroadRes = await fetch("https://api.gumroad.com/v2/licenses/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      product_id: process.env.GUMROAD_PRODUCT_ID ?? "",
      license_key: licenseKey,
      increment_uses_count: "false",
    }),
  });

  const data = (await gumroadRes.json().catch(() => null)) as {
    success?: boolean;
    purchase?: { email?: string; refunded?: boolean; chargebacked?: boolean };
  } | null;

  if (!data?.success || !data.purchase) {
    return json({ ok: false, message: "Key invalid or unknown." }, 200);
  }
  if (data.purchase.refunded || data.purchase.chargebacked) {
    return json({ ok: false, message: "Purchase was refunded — key inactive." }, 200);
  }

  // Log the activation (best effort — unlocking does not depend on it)
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabase
      .from("entitlements")
      .update({ activated_at: new Date().toISOString() })
      .eq("license_key", licenseKey);
  } catch (e) {
    console.error("activation log failed:", e);
  }

  return json({ ok: true, email: data.purchase.email }, 200);
};

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config = { path: "/api/verify-license" };
