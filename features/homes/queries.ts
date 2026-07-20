import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type HomeSummary = {
  id: string;
  name: string;
  home_type: string | null;
  default_currency: string;
  timezone: string;
};

export async function listHomes(): Promise<HomeSummary[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homes")
    .select("id,name,home_type,default_currency,timezone")
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  if (error) return [];

  return data ?? [];
}

export async function getFirstHome() {
  const homes = await listHomes();
  return homes[0] ?? null;
}

export async function getHome(homeId: string) {
  const homes = await listHomes();
  return homes.find((home) => home.id === homeId) ?? null;
}
