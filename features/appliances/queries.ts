import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type Appliance = {
  id: string;
  home_id: string;
  room_id: string | null;
  name: string;
  brand: string | null;
  model: string | null;
  purchase_date: string | null;
  warranty_end_date: string | null;
};

export async function listAppliances(homeId?: string): Promise<Appliance[]> {
  if (!hasSupabaseEnv() || !homeId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appliances")
    .select("id,home_id,room_id,name,brand,model,purchase_date,warranty_end_date")
    .eq("home_id", homeId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];

  return data ?? [];
}

