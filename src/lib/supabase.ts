import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Without keys: null → the app runs in local-only mode.
 * With keys: magic-link login + cloud sync become available.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const cloudEnabled = supabase !== null;

export async function signInWithMagicLink(email: string): Promise<string> {
  if (!supabase) return "Cloud is not configured in this build.";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  return error ? error.message : "Login link is on its way — check your inbox.";
}
