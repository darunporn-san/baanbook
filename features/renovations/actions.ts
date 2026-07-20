"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getHome } from "@/features/homes/queries";
import { addTimelineEvent } from "@/features/timeline/actions";
import { createClient } from "@/lib/supabase/server";

function path(homeId: string) {
  return homeId ? `/renovations?homeId=${homeId}` : "/renovations";
}

function money(formData: FormData, key: string) {
  const value = Number(String(formData.get(key) ?? "0"));
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

export async function createRenovationProject(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const home = await getHome(homeId);
  const name = String(formData.get("name") ?? "").trim();
  if (!home || !name) redirect("/renovations");

  const supabase = await createClient();
  const { data } = await supabase
    .from("renovation_projects")
    .insert({
      home_id: home.id,
      room_id: String(formData.get("room_id") ?? "") || null,
      name,
      status: String(formData.get("status") ?? "planning") || "planning",
      contractor_name: String(formData.get("contractor_name") ?? "").trim() || null,
      budget_minor: money(formData, "budget"),
      start_date: String(formData.get("start_date") ?? "") || null,
      end_date: String(formData.get("end_date") ?? "") || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (data) {
    await addTimelineEvent(supabase, {
      home_id: home.id,
      event_type: "renovation_added",
      title: `เพิ่มโปรเจกต์รีโนเวท: ${name}`,
      source_type: "renovation_project",
      source_id: data.id,
    });
  }

  revalidatePath("/renovations");
  revalidatePath("/dashboard");
  revalidatePath("/timeline");
  redirect(path(home.id));
}

export async function updateRenovationProject(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !homeId || !name) redirect("/renovations");

  const supabase = await createClient();
  await supabase
    .from("renovation_projects")
    .update({
      room_id: String(formData.get("room_id") ?? "") || null,
      name,
      status: String(formData.get("status") ?? "planning") || "planning",
      contractor_name: String(formData.get("contractor_name") ?? "").trim() || null,
      budget_minor: money(formData, "budget"),
      start_date: String(formData.get("start_date") ?? "") || null,
      end_date: String(formData.get("end_date") ?? "") || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id)
    .eq("home_id", homeId);

  revalidatePath("/renovations");
  revalidatePath("/dashboard");
  redirect(path(homeId));
}

export async function deleteRenovationProject(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  if (!id) redirect("/renovations");

  const supabase = await createClient();
  await supabase.from("renovation_projects").update({ deleted_at: new Date().toISOString() }).eq("id", id);

  revalidatePath("/renovations");
  revalidatePath("/dashboard");
  redirect(path(homeId));
}
