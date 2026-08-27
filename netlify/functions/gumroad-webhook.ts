import { createClient } from "@supabase/supabase-js";

/**
 * Gumroad "Ping": called by Gumroad via POST
 * (application/x-www-form-urlencoded) on every sale.
 *
 * Set up in Gumroad → Settings → Advanced → Ping:
 *   https://YOUR-SITE.netlify.app/api/gumroad-webhook?secret=PING_SECRET
 *
 * Creates one entitlement record per purchase. The buyer later unlocks
 * the app via license key OR by logging in with the same email.
 */
export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== process.env.PING_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }

  const body = new URLSearchParams(await req.text());
  const email = body.get("email");
  const licenseKey = body.get("license_key");
  const saleId = body.get("sale_id");
  const refunded = body.get("refunded") === "true";

  if (!email) return new Response("Missing email", { status: 400 });

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.from("entitlements").upsert(
    {
      email: email.toLowerCase(),
      license_key: licenseKey,
      gumroad_sale_id: saleId,
      refunded,
      source: "gumroad",
    },
    { onConflict: "email" }
  );

  if (error) {
    console.error("entitlement upsert failed:", error.message);
    return new Response("Server error", { status: 500 });
  }
  return new Response("OK", { status: 200 });
};

export const config = { path: "/api/gumroad-webhook" };
