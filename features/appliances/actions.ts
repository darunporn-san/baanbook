"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getHome } from "@/features/homes/queries";
import { addTimelineEvent } from "@/features/timeline/add-event";
import { createClient } from "@/lib/supabase/server";

function appliancesPath(homeId: string) {
  return homeId ? `/appliances?homeId=${homeId}` : "/appliances";
}

function returnPath(formData: FormData, homeId: string) {
  const path = String(formData.get("redirect_to") ?? "");
  return path.startsWith("/") ? path : appliancesPath(homeId);
}

export async function createAppliance(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const home = await getHome(homeId);
  const name = String(formData.get("name") ?? "").trim();

  if (!home || !name) redirect("/appliances");

  const rawRoomId = String(formData.get("room_id") ?? "") || null;
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const model = String(formData.get("model") ?? "").trim() || null;
  const purchaseDate = String(formData.get("purchase_date") ?? "") || null;
  const warrantyEndDate = String(formData.get("warranty_end_date") ?? "") || null;
  const supabase = await createClient();
  const { data: room } = rawRoomId
    ? await supabase
        .from("rooms")
        .select("id")
        .eq("id", rawRoomId)
        .eq("home_id", home.id)
        .is("deleted_at", null)
        .maybeSingle()
    : { data: null };
  const roomId = room?.id ?? null;
  const { data } = await supabase
    .from("appliances")
    .insert({
      home_id: home.id,
      room_id: roomId,
      name,
      brand,
      model,
      purchase_date: purchaseDate,
      warranty_end_date: warrantyEndDate,
    })
    .select("id")
    .single();

  if (data) {
    await addTimelineEvent(supabase, {
      home_id: home.id,
      room_id: roomId,
      event_type: "appliance_added",
      title: `เพิ่มเครื่องใช้ไฟฟ้า: ${name}`,
      source_type: "appliance",
      source_id: data.id,
    });
  }

  revalidatePath("/appliances");
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/timeline");
  redirect(returnPath(formData, home.id));
}

export async function updateAppliance(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) redirect("/appliances");

  const supabase = await createClient();
  await supabase
    .from("appliances")
    .update({
      name,
      room_id: String(formData.get("room_id") ?? "") || null,
      brand: String(formData.get("brand") ?? "").trim() || null,
      model: String(formData.get("model") ?? "").trim() || null,
      purchase_date: String(formData.get("purchase_date") ?? "") || null,
      warranty_end_date: String(formData.get("warranty_end_date") ?? "") || null,
    })
    .eq("id", id);

  revalidatePath("/appliances");
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  redirect(returnPath(formData, homeId));
}

export async function deleteAppliance(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  if (!id) redirect("/appliances");

  const supabase = await createClient();
  await supabase.from("appliances").update({ deleted_at: new Date().toISOString() }).eq("id", id);

  revalidatePath("/appliances");
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  redirect(returnPath(formData, homeId));
}
