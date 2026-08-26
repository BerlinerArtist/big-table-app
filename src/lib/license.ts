import { load, save } from "./storage";

export interface LicenseState {
  key: string;
  activatedAt: string;
  email?: string;
}

export function getLicense(): LicenseState | null {
  return load<LicenseState | null>("license", null);
}

/**
 * Unlocks the full version via Gumroad license key.
 * The actual check runs server-side (netlify/functions/verify-license)
 * so the Gumroad product ID never ships in the client.
 */
export async function activateLicense(
  key: string
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch("/api/verify-license", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey: key.trim() }),
    });
    const data = (await res.json()) as {
      ok: boolean;
      message?: string;
      email?: string;
    };
    if (data.ok) {
      save<LicenseState>("license", {
        key: key.trim(),
        activatedAt: new Date().toISOString(),
        email: data.email,
      });
      return { ok: true, message: "Unlocked. Welcome to the big table." };
    }
    return { ok: false, message: data.message ?? "Key was not accepted." };
  } catch {
    return {
      ok: false,
      message:
        "Verification unreachable (requires Netlify Functions — run `npx netlify dev` instead of plain Vite dev).",
    };
  }
}
