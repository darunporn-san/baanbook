"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getHome } from "@/features/homes/queries";
import { addTimelineEvent } from "@/features/timeline/actions";
import { createClient } from "@/lib/supabase/server";

function maintenancePath(homeId: string) {
  return homeId ? `/maintenance?homeId=${homeId}` : "/maintenance";
}

async function validLinkIds(homeId: string, roomId: string | null, applianceId: string | null) {
  const supabase = await createClient();
  const { data: room } = roomId
    ? await supabase
        .from("rooms")
        .select("id")
        .eq("id", roomId)
        .eq("home_id", homeId)
        .is("deleted_at", null)
        .maybeSingle()
    : { data: null };
  const { data: appliance } = applianceId
    ? await supabase
        .from("appliances")
        .select("id")
        .eq("id", applianceId)
        .eq("home_id", homeId)
        .is("deleted_at", null)
        .maybeSingle()
    : { data: null };

  return { supabase, roomId: room?.id ?? null, applianceId: appliance?.id ?? null };
}

export async function createMaintenanceTask(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const home = await getHome(homeId);
  const title = String(formData.get("title") ?? "").trim();

  if (!home || !title) redirect("/maintenance");

  const { supabase, roomId, applianceId } = await validLinkIds(
    home.id,
    String(formData.get("room_id") ?? "") || null,
    String(formData.get("appliance_id") ?? "") || null,
  );
  const { data } = await supabase
    .from("maintenance_tasks")
    .insert({
      home_id: home.id,
      room_id: roomId,
      appliance_id: applianceId,
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      status: String(formData.get("status") ?? "todo") || "todo",
      priority: String(formData.get("priority") ?? "medium") || "medium",
      due_date: String(formData.get("due_date") ?? "") || null,
    })
    .select("id")
    .single();

  if (data) {
    await addTimelineEvent(supabase, {
      home_id: home.id,
      room_id: roomId,
      event_type: "maintenance_added",
      title: `เพิ่มงานบำรุงรักษา: ${title}`,
      source_type: "maintenance_task",
      source_id: data.id,
    });
  }

  revalidatePath("/maintenance");
  revalidatePath("/dashboard");
  revalidatePath("/timeline");
  redirect(maintenancePath(home.id));
}

export async function updateMaintenanceTask(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !homeId || !title) redirect("/maintenance");

  const { supabase, roomId, applianceId } = await validLinkIds(
    homeId,
    String(formData.get("room_id") ?? "") || null,
    String(formData.get("appliance_id") ?? "") || null,
  );
  const status = String(formData.get("status") ?? "todo") || "todo";

  await supabase
    .from("maintenance_tasks")
    .update({
      title,
      room_id: roomId,
      appliance_id: applianceId,
      description: String(formData.get("description") ?? "").trim() || null,
      status,
      priority: String(formData.get("priority") ?? "medium") || "medium",
      due_date: String(formData.get("due_date") ?? "") || null,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("home_id", homeId);

  revalidatePath("/maintenance");
  revalidatePath("/dashboard");
  redirect(maintenancePath(homeId));
}

export async function completeMaintenanceTask(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const title = String(formData.get("title") ?? "งานบำรุงรักษา");
  if (!id || !homeId) redirect("/maintenance");

  const supabase = await createClient();
  await supabase
    .from("maintenance_tasks")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("home_id", homeId);
  await addTimelineEvent(supabase, {
    home_id: homeId,
    event_type: "maintenance_completed",
    title: `งานบำรุงรักษาเสร็จแล้ว: ${title}`,
    source_type: "maintenance_task",
    source_id: id,
  });

  revalidatePath("/maintenance");
  revalidatePath("/dashboard");
  revalidatePath("/timeline");
  redirect(maintenancePath(homeId));
}

export async function deleteMaintenanceTask(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  if (!id) redirect("/maintenance");

  const supabase = await createClient();
  await supabase
    .from("maintenance_tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("home_id", homeId);

  revalidatePath("/maintenance");
  revalidatePath("/dashboard");
  redirect(maintenancePath(homeId));
}
