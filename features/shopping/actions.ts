"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getHome } from "@/features/homes/queries";
import { addTimelineEvent } from "@/features/timeline/actions";
import { createClient } from "@/lib/supabase/server";

function path(homeId: string) {
  return homeId ? `/shopping?homeId=${homeId}` : "/shopping";
}

function optionalMoney(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.round(value * 100) : null;
}

export async function createShoppingItem(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const home = await getHome(homeId);
  const title = String(formData.get("title") ?? "").trim();
  if (!home || !title) redirect("/shopping");

  const supabase = await createClient();
  const { data } = await supabase
    .from("shopping_items")
    .insert({
      home_id: home.id,
      room_id: String(formData.get("room_id") ?? "") || null,
      renovation_project_id: String(formData.get("renovation_project_id") ?? "") || null,
      title,
      status: String(formData.get("status") ?? "planned") || "planned",
      priority: String(formData.get("priority") ?? "medium") || "medium",
      estimated_price_minor: optionalMoney(formData, "estimated_price"),
      actual_price_minor: optionalMoney(formData, "actual_price"),
      vendor: String(formData.get("vendor") ?? "").trim() || null,
      product_url: String(formData.get("product_url") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (data) {
    await addTimelineEvent(supabase, {
      home_id: home.id,
      event_type: "shopping_added",
      title: `เพิ่มรายการซื้อ: ${title}`,
      source_type: "shopping_item",
      source_id: data.id,
    });
  }

  revalidatePath("/shopping");
  revalidatePath("/dashboard");
  revalidatePath("/timeline");
  redirect(path(home.id));
}

export async function updateShoppingItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !homeId || !title) redirect("/shopping");

  const supabase = await createClient();
  await supabase
    .from("shopping_items")
    .update({
      room_id: String(formData.get("room_id") ?? "") || null,
      renovation_project_id: String(formData.get("renovation_project_id") ?? "") || null,
      title,
      status: String(formData.get("status") ?? "planned") || "planned",
      priority: String(formData.get("priority") ?? "medium") || "medium",
      estimated_price_minor: optionalMoney(formData, "estimated_price"),
      actual_price_minor: optionalMoney(formData, "actual_price"),
      vendor: String(formData.get("vendor") ?? "").trim() || null,
      product_url: String(formData.get("product_url") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id)
    .eq("home_id", homeId);

  revalidatePath("/shopping");
  revalidatePath("/dashboard");
  redirect(path(homeId));
}

export async function deleteShoppingItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  if (!id) redirect("/shopping");

  const supabase = await createClient();
  await supabase.from("shopping_items").update({ deleted_at: new Date().toISOString() }).eq("id", id);

  revalidatePath("/shopping");
  revalidatePath("/dashboard");
  redirect(path(homeId));
}
