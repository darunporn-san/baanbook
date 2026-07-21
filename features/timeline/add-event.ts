import type { SupabaseClient } from "@supabase/supabase-js";

export async function addTimelineEvent(
  supabase: SupabaseClient,
  event: {
    home_id: string;
    event_type: string;
    title: string;
    description?: string | null;
    source_type?: string | null;
    source_id?: string | null;
    room_id?: string | null;
  },
) {
  await supabase.from("timeline_events").insert(event);
}
