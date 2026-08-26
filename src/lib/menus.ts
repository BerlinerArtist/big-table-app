import { supabase } from "./supabase";

/** Phase 3 — saved menus (code-complete, live test pending keys). */
export interface SavedMenu {
  id: string;
  name: string;
  occasion_id: string;
  guest_count: number;
  data: { serveAt?: string };
}

export async function listMenus(): Promise<SavedMenu[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("menus")
    .select("id, name, occasion_id, guest_count, data")
    .order("updated_at", { ascending: false });
  return (data as SavedMenu[]) ?? [];
}

export async function saveMenu(
  name: string, occasionId: string, guests: number, serveAt: string
): Promise<boolean> {
  if (!supabase) return false;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return false;
  const { error } = await supabase.from("menus").insert({
    user_id: u.user.id,
    name,
    occasion_id: occasionId,
    guest_count: guests,
    data: { serveAt },
  });
  return !error;
}

export async function deleteMenu(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from("menus").delete().eq("id", id);
}
