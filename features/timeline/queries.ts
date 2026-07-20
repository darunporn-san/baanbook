import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type TimelineEvent = {
  id: string;
  home_id: string;
  event_type: string;
  title: string;
  description: string | null;
  event_date: string;
};

export async function listTimelineEvents(homeId?: string, limit = 50): Promise<TimelineEvent[]> {
  if (!hasSupabaseEnv() || !homeId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timeline_events")
    .select("id,home_id,event_type,title,description,event_date")
    .eq("home_id", homeId)
    .order("event_date", { ascending: false })
    .limit(limit);

  if (error) return [];

  return data ?? [];
}
