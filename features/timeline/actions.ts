import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function timelinePath(homeId: string) {
  return homeId ? `/timeline?homeId=${homeId}` : "/timeline";
}

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

export async function createTimelineEvent(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!homeId || !title) redirect("/timeline");

  const eventDate = String(formData.get("event_date") ?? "") || new Date().toISOString();
  const eventTime = String(formData.get("event_time") ?? "").trim();
  const dateTime = eventTime ? `${eventDate}T${eventTime}:00` : `${eventDate}T00:00:00`;
  const supabase = await createClient();

  await supabase.from("timeline_events").insert({
    home_id: homeId,
    event_type: String(formData.get("event_type") ?? "manual") || "manual",
    title,
    description: String(formData.get("description") ?? "").trim() || null,
    event_date: dateTime,
    source_type: "manual",
  });

  revalidatePath("/timeline");
  revalidatePath("/dashboard");
  redirect(timelinePath(homeId));
}

export async function updateTimelineEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !homeId || !title) redirect(timelinePath(homeId));

  const eventDate = String(formData.get("event_date") ?? "") || new Date().toISOString().slice(0, 10);
  const eventTime = String(formData.get("event_time") ?? "").trim();
  const dateTime = eventTime ? `${eventDate}T${eventTime}:00` : `${eventDate}T00:00:00`;
  const supabase = await createClient();

  await supabase
    .from("timeline_events")
    .update({
      event_type: String(formData.get("event_type") ?? "manual") || "manual",
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      event_date: dateTime,
    })
    .eq("id", id)
    .eq("home_id", homeId);

  revalidatePath("/timeline");
  revalidatePath("/dashboard");
  redirect(timelinePath(homeId));
}

export async function deleteTimelineEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  if (!id) redirect(timelinePath(homeId));

  const supabase = await createClient();
  await supabase.from("timeline_events").delete().eq("id", id).eq("home_id", homeId);

  revalidatePath("/timeline");
  revalidatePath("/dashboard");
  redirect(timelinePath(homeId));
}
