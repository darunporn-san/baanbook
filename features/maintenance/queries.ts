import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type MaintenanceTask = {
  id: string;
  home_id: string;
  room_id: string | null;
  appliance_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
};

export async function listMaintenanceTasks(homeId?: string): Promise<MaintenanceTask[]> {
  if (!hasSupabaseEnv() || !homeId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_tasks")
    .select("id,home_id,room_id,appliance_id,title,description,status,priority,due_date,completed_at")
    .eq("home_id", homeId)
    .is("deleted_at", null)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) return [];

  return data ?? [];
}
