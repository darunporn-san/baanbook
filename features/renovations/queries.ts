import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type RenovationProject = {
  id: string;
  home_id: string;
  room_id: string | null;
  name: string;
  status: string;
  contractor_name: string | null;
  budget_minor: number;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
};

export async function listRenovationProjects(homeId?: string): Promise<RenovationProject[]> {
  if (!hasSupabaseEnv() || !homeId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("renovation_projects")
    .select("id,home_id,room_id,name,status,contractor_name,budget_minor,start_date,end_date,notes")
    .eq("home_id", homeId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return [];

  return data ?? [];
}
