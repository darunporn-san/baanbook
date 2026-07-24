"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getHome } from "@/features/homes/queries";
import { addTimelineEvent } from "@/features/timeline/add-event";
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
      status: "planned",
      priority: String(formData.get("priority") ?? "medium") || "medium",
      estimated_price_minor: optionalMoney(formData, "estimated_price"),
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

export async function markShoppingItemBought(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const actualPrice = Number(String(formData.get("actual_price") ?? ""));
  const additionalExpense = Number(
    String(formData.get("additional_expense") ?? "0"),
  );
  const home = await getHome(homeId);

  if (
    !id ||
    !home ||
    !Number.isFinite(actualPrice) ||
    actualPrice <= 0 ||
    !Number.isFinite(additionalExpense) ||
    additionalExpense < 0
  ) {
    redirect(path(homeId));
  }

  const supabase = await createClient();
  const [{ data: item }, { data: pendingPlan }] = await Promise.all([
    supabase
      .from("shopping_items")
      .select("id,home_id,room_id,title,status,vendor")
      .eq("id", id)
      .eq("home_id", home.id)
      .eq("status", "planned")
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("comparison_plans")
      .select("id")
      .eq("shopping_item_id", id)
      .eq("home_id", home.id)
      .eq("status", "comparing")
      .is("deleted_at", null)
      .maybeSingle(),
  ]);

  if (!item || pendingPlan) redirect(path(home.id));

  const amountMinor =
    Math.round(actualPrice * 100) + Math.round(additionalExpense * 100);
  const { data: boughtItem } = await supabase
    .from("shopping_items")
    .update({ status: "bought", actual_price_minor: amountMinor })
    .eq("id", item.id)
    .eq("status", "planned")
    .select("id")
    .maybeSingle();

  if (!boughtItem) redirect(path(home.id));

  const expenseDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: home.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const expensePayload = {
    home_id: home.id,
    room_id: item.room_id,
    title: item.title,
    category: "household_supply",
    amount_minor: amountMinor,
    currency: home.default_currency,
    expense_date: expenseDate,
    notes: item.vendor ? `ซื้อจาก ${item.vendor}` : null,
    is_paid: true,
  };
  const insertedExpense = await supabase
    .from("expenses")
    .insert({
      ...expensePayload,
      shopping_item_id: item.id,
    })
    .select("id")
    .single();
  let expense = insertedExpense.data;
  let expenseError = insertedExpense.error;

  if (expenseError?.message.includes("shopping_item_id")) {
    const fallback = await supabase
      .from("expenses")
      .insert(expensePayload)
      .select("id")
      .single();
    expense = fallback.data;
    expenseError = fallback.error;
  }

  if (expenseError || !expense) {
    await supabase
      .from("shopping_items")
      .update({ status: "planned", actual_price_minor: null })
      .eq("id", item.id);
    redirect(path(home.id));
  }

  await addTimelineEvent(supabase, {
    home_id: home.id,
    room_id: item.room_id,
    event_type: "expense_added",
    title: `เพิ่มค่าใช้จ่าย: ${item.title}`,
    source_type: "expense",
    source_id: expense.id,
  });

  revalidatePath("/shopping");
  revalidatePath("/expenses");
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
  const deletedAt = new Date().toISOString();
  const { data: item } = await supabase
    .from("shopping_items")
    .select("id,title,status,room_id,actual_price_minor")
    .eq("id", id)
    .eq("home_id", homeId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!item) redirect(path(homeId));

  const planDeletes = await Promise.all([
    supabase
      .from("comparison_plans")
      .update({ deleted_at: deletedAt })
      .eq("shopping_item_id", item.id)
      .eq("home_id", homeId)
      .is("deleted_at", null),
    supabase
      .from("comparison_plans")
      .update({ deleted_at: deletedAt })
      .eq("destination_type", "shopping")
      .eq("destination_id", item.id)
      .eq("home_id", homeId)
      .is("deleted_at", null),
  ]);
  if (planDeletes.some((result) => result.error)) redirect(path(homeId));

  const { data: linkedExpense } = await supabase
    .from("expenses")
    .select("id")
    .eq("shopping_item_id", item.id)
    .is("deleted_at", null)
    .maybeSingle();
  let expenseId = linkedExpense?.id;

  if (!expenseId && item.status === "bought") {
    let fallbackQuery = supabase
      .from("expenses")
      .select("id")
      .eq("home_id", homeId)
      .eq("title", item.title)
      .eq("category", "household_supply")
      .eq("amount_minor", item.actual_price_minor ?? 0)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1);
    fallbackQuery = item.room_id
      ? fallbackQuery.eq("room_id", item.room_id)
      : fallbackQuery.is("room_id", null);
    const { data: fallbackExpense } = await fallbackQuery.maybeSingle();
    expenseId = fallbackExpense?.id;
  }

  if (expenseId) {
    const { error } = await supabase
      .from("expenses")
      .update({ deleted_at: deletedAt })
      .eq("id", expenseId);
    if (error) redirect(path(homeId));
  }

  const { error } = await supabase
    .from("shopping_items")
    .update({ deleted_at: deletedAt })
    .eq("id", item.id)
    .eq("home_id", homeId);
  if (error) redirect(path(homeId));

  revalidatePath("/shopping");
  revalidatePath("/planning");
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/timeline");
  redirect(path(homeId));
}
