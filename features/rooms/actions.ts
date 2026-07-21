"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addTimelineEvent } from "@/features/timeline/add-event";
import { createClient } from "@/lib/supabase/server";

function homePath(homeId: string) {
  return homeId ? `/homes/${homeId}` : "/homes";
}

function optionalNumber(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function countNumber(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return 0;

  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : 0;
}

function positiveInteger(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return 1;

  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 1;
}

async function syncRoomOpeningCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  roomId: string,
) {
  const { data, error } = await supabase
    .from("room_openings")
    .select("opening_type,quantity")
    .eq("room_id", roomId)
    .is("deleted_at", null);

  if (error) return;

  const counts = {
    window_count: 0,
    door_count: 0,
    balcony_count: 0,
  };

  for (const opening of data ?? []) {
    const quantity = Number(opening.quantity) || 0;
    if (opening.opening_type === "window") counts.window_count += quantity;
    if (opening.opening_type === "door") counts.door_count += quantity;
    if (opening.opening_type === "balcony") counts.balcony_count += quantity;
  }

  await supabase.from("rooms").update(counts).eq("id", roomId);
}

export async function createRoom(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!homeId || !name) redirect("/homes");

  const floor = String(formData.get("floor") ?? "").trim() || null;
  const supabase = await createClient();
  const payload = {
    home_id: homeId,
    name,
    floor,
    width_m: optionalNumber(formData, "width_m"),
    length_m: optionalNumber(formData, "length_m"),
    height_m: optionalNumber(formData, "height_m"),
    window_count: countNumber(formData, "window_count"),
    door_count: countNumber(formData, "door_count"),
    balcony_count: countNumber(formData, "balcony_count"),
  };
  let { data } = await supabase
    .from("rooms")
    .insert(payload)
    .select("id")
    .single();
  if (!data) {
    const fallback = await supabase
      .from("rooms")
      .insert({ home_id: homeId, name, floor })
      .select("id")
      .single();
    data = fallback.data;
  }

  if (data) {
    await addTimelineEvent(supabase, {
      home_id: homeId,
      event_type: "room_added",
      title: `เพิ่มห้อง: ${name}`,
      source_type: "room",
      source_id: data.id,
    });
  }

  revalidatePath("/homes");
  revalidatePath(homePath(homeId));
  revalidatePath("/dashboard");
  revalidatePath("/timeline");
  redirect(homePath(homeId));
}

export async function createRoomOpening(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const roomId = String(formData.get("room_id") ?? "");
  const openingType = String(formData.get("opening_type") ?? "");

  if (!homeId || !roomId) redirect("/homes");

  const allowedTypes = ["window", "door", "balcony", "other"];
  const supabase = await createClient();
  const { data } = await supabase
    .from("room_openings")
    .insert({
      home_id: homeId,
      room_id: roomId,
      opening_type: allowedTypes.includes(openingType) ? openingType : "window",
      label: String(formData.get("label") ?? "").trim() || null,
      width_m: optionalNumber(formData, "width_m"),
      height_m: optionalNumber(formData, "height_m"),
      quantity: positiveInteger(formData, "quantity"),
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (data) {
    await syncRoomOpeningCounts(supabase, roomId);
  }

  revalidatePath(homePath(homeId));
  revalidatePath("/dashboard");
  redirect(homePath(homeId));
}

export async function updateRoomOpening(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const roomId = String(formData.get("room_id") ?? "");
  const openingType = String(formData.get("opening_type") ?? "");

  if (!id || !roomId) redirect(homePath(homeId));

  const allowedTypes = ["window", "door", "balcony", "other"];
  const supabase = await createClient();
  await supabase
    .from("room_openings")
    .update({
      opening_type: allowedTypes.includes(openingType) ? openingType : "window",
      label: String(formData.get("label") ?? "").trim() || null,
      width_m: optionalNumber(formData, "width_m"),
      height_m: optionalNumber(formData, "height_m"),
      quantity: positiveInteger(formData, "quantity"),
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id);

  await syncRoomOpeningCounts(supabase, roomId);

  revalidatePath(homePath(homeId));
  revalidatePath("/dashboard");
  redirect(homePath(homeId));
}

export async function deleteRoomOpening(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const roomId = String(formData.get("room_id") ?? "");
  if (!id || !roomId) redirect(homePath(homeId));

  const supabase = await createClient();
  await supabase
    .from("room_openings")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  await syncRoomOpeningCounts(supabase, roomId);

  revalidatePath(homePath(homeId));
  revalidatePath("/dashboard");
  redirect(homePath(homeId));
}

export async function deleteRoom(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  if (!id) redirect("/homes");

  const supabase = await createClient();
  await supabase.from("rooms").update({ deleted_at: new Date().toISOString() }).eq("id", id);

  revalidatePath("/homes");
  revalidatePath(homePath(homeId));
  revalidatePath("/dashboard");
  redirect(homePath(homeId));
}

export async function updateRoom(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) redirect("/homes");

  const supabase = await createClient();
  await supabase
    .from("rooms")
    .update({
      name,
      floor: String(formData.get("floor") ?? "").trim() || null,
      width_m: optionalNumber(formData, "width_m"),
      length_m: optionalNumber(formData, "length_m"),
      height_m: optionalNumber(formData, "height_m"),
      window_count: countNumber(formData, "window_count"),
      door_count: countNumber(formData, "door_count"),
      balcony_count: countNumber(formData, "balcony_count"),
    })
    .eq("id", id);

  revalidatePath("/homes");
  revalidatePath(homePath(homeId));
  revalidatePath("/dashboard");
  redirect(homePath(homeId));
}
