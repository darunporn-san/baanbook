"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getHome } from "@/features/homes/queries";
import { priceTotal, type PriceBasis } from "@/features/planning/pricing";
import { addTimelineEvent } from "@/features/timeline/add-event";
import { createClient } from "@/lib/supabase/server";

function path(homeId: string, error?: string) {
  const params = new URLSearchParams();
  if (homeId) params.set("homeId", homeId);
  if (error) params.set("error", error);
  const query = params.toString();
  return query ? `/planning?${query}` : "/planning";
}

function insertErrorPath(homeId: string, code?: string) {
  return path(
    homeId,
    ["PGRST205", "PGRST204", "42P01", "42703"].includes(code ?? "")
      ? "ยังไม่ได้ติดตั้งตารางวางแผนในฐานข้อมูล กรุณารัน migration ล่าสุดก่อน"
      : "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  );
}

const destinationRoutes = {
  shopping: "/shopping",
  maintenance: "/maintenance",
  renovation: "/renovations",
} as const;

const destinationEvents = {
  shopping: {
    eventType: "shopping_added",
    title: "เพิ่มรายการซื้อ",
    sourceType: "shopping_item",
  },
  maintenance: {
    eventType: "maintenance_added",
    title: "เพิ่มงานบำรุงรักษา",
    sourceType: "maintenance_task",
  },
  renovation: {
    eventType: "renovation_added",
    title: "เพิ่มโปรเจกต์รีโนเวท",
    sourceType: "renovation_project",
  },
} as const;

function money(formData: FormData, key: string) {
  const value = Number(String(formData.get(key) ?? "0"));
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) : 0;
}

function quantity(formData: FormData) {
  const value = Number(formData.get("quantity"));
  return Number.isInteger(value) && value >= 1 ? value : 1;
}

function priceBasis(
  formData: FormData,
  key: string,
  fallback: PriceBasis,
): PriceBasis {
  const value = String(formData.get(key) ?? "");
  return value === "per_unit" || value === "total" ? value : fallback;
}

export async function createComparisonPlan(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const home = await getHome(homeId);
  const title = String(formData.get("title") ?? "").trim();
  const destinationType = String(formData.get("destination_type") ?? "");
  if (
    !home ||
    !title ||
    !["shopping", "maintenance", "renovation"].includes(destinationType)
  ) {
    redirect("/planning");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("comparison_plans").insert({
    home_id: home.id,
    room_id: String(formData.get("room_id") ?? "") || null,
    title,
    destination_type: destinationType,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  if (error) redirect(insertErrorPath(home.id, error.code));

  revalidatePath("/planning");
  redirect(path(home.id));
}

export async function updateComparisonPlan(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const destinationType = String(formData.get("destination_type") ?? "");
  if (
    !id ||
    !homeId ||
    !title ||
    !["shopping", "maintenance", "renovation"].includes(destinationType)
  ) {
    redirect(path(homeId));
  }

  const supabase = await createClient();
  const roomId = String(formData.get("room_id") ?? "");
  if (roomId) {
    const { data: room } = await supabase
      .from("rooms")
      .select("id")
      .eq("id", roomId)
      .eq("home_id", homeId)
      .is("deleted_at", null)
      .maybeSingle();
    if (!room) redirect(path(homeId));
  }

  const { error } = await supabase
    .from("comparison_plans")
    .update({
      title,
      room_id: roomId || null,
      destination_type: destinationType,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id)
    .eq("home_id", homeId)
    .eq("status", "comparing")
    .is("deleted_at", null);
  if (error) redirect(insertErrorPath(homeId, error.code));

  revalidatePath("/planning");
  redirect(path(homeId));
}

export async function createComparisonOption(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const planId = String(formData.get("comparison_plan_id") ?? "");
  const providerName = String(formData.get("provider_name") ?? "").trim();
  if (!homeId || !planId || !providerName) redirect(path(homeId));

  const home = await getHome(homeId);
  if (!home) redirect("/planning");

  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("comparison_plans")
    .select("id")
    .eq("id", planId)
    .eq("home_id", homeId)
    .eq("status", "comparing")
    .is("deleted_at", null)
    .maybeSingle();
  if (!plan) redirect(path(homeId));

  const { error } = await supabase.from("comparison_options").insert({
    comparison_plan_id: plan.id,
    home_id: homeId,
    provider_name: providerName,
    item_name: String(formData.get("item_name") ?? "").trim() || null,
    product_price_minor: money(formData, "product_price"),
    product_price_basis: priceBasis(
      formData,
      "product_price_basis",
      "per_unit",
    ),
    quantity: quantity(formData),
    installation_price_minor: money(formData, "installation_price"),
    installation_price_basis: priceBasis(
      formData,
      "installation_price_basis",
      "total",
    ),
    currency: home.default_currency,
    product_url: String(formData.get("product_url") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  if (error) redirect(insertErrorPath(homeId, error.code));

  revalidatePath("/planning");
  redirect(path(homeId));
}

export async function updateComparisonOption(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const planId = String(formData.get("comparison_plan_id") ?? "");
  const providerName = String(formData.get("provider_name") ?? "").trim();
  if (!id || !homeId || !planId || !providerName) redirect(path(homeId));

  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("comparison_plans")
    .select("id")
    .eq("id", planId)
    .eq("home_id", homeId)
    .eq("status", "comparing")
    .is("deleted_at", null)
    .maybeSingle();
  if (!plan) redirect(path(homeId));

  const { error } = await supabase
    .from("comparison_options")
    .update({
      provider_name: providerName,
      item_name: String(formData.get("item_name") ?? "").trim() || null,
      product_price_minor: money(formData, "product_price"),
      product_price_basis: priceBasis(
        formData,
        "product_price_basis",
        "per_unit",
      ),
      quantity: quantity(formData),
      installation_price_minor: money(formData, "installation_price"),
      installation_price_basis: priceBasis(
        formData,
        "installation_price_basis",
        "total",
      ),
      product_url: String(formData.get("product_url") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id)
    .eq("comparison_plan_id", plan.id)
    .eq("home_id", homeId)
    .eq("is_selected", false)
    .is("deleted_at", null);
  if (error) redirect(insertErrorPath(homeId, error.code));

  revalidatePath("/planning");
  redirect(path(homeId));
}

export async function confirmComparisonOption(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const planId = String(formData.get("comparison_plan_id") ?? "");
  const optionId = String(formData.get("option_id") ?? "");
  if (!homeId || !planId || !optionId) redirect(path(homeId));

  const supabase = await createClient();
  const [{ data: plan }, { data: option }] = await Promise.all([
    supabase
      .from("comparison_plans")
      .select("id,home_id,room_id,title,destination_type,status,notes")
      .eq("id", planId)
      .eq("home_id", homeId)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("comparison_options")
      .select(
        "id,comparison_plan_id,provider_name,item_name,product_price_minor,product_price_basis,quantity,installation_price_minor,installation_price_basis,product_url,notes",
      )
      .eq("id", optionId)
      .eq("comparison_plan_id", planId)
      .is("deleted_at", null)
      .maybeSingle(),
  ]);
  if (!plan || !option || plan.status !== "comparing") redirect(path(homeId));

  const productTotal = priceTotal(
    option.product_price_minor,
    option.quantity,
    option.product_price_basis,
  );
  const installationTotal = priceTotal(
    option.installation_price_minor,
    option.quantity,
    option.installation_price_basis,
  );
  const total = productTotal + installationTotal;
  const detail = [`เลือกจาก ${option.provider_name}`, option.notes, plan.notes]
    .filter(Boolean)
    .join(" · ");
  let destinationId: string | undefined;

  if (plan.destination_type === "shopping") {
    const { data } = await supabase
      .from("shopping_items")
      .insert({
        home_id: homeId,
        room_id: plan.room_id,
        title: option.item_name || plan.title,
        status: "planned",
        priority: "medium",
        estimated_price_minor: total,
        vendor: option.provider_name,
        product_url: option.product_url,
        notes: detail || null,
      })
      .select("id")
      .single();
    destinationId = data?.id;
  } else if (plan.destination_type === "maintenance") {
    const { data } = await supabase
      .from("maintenance_tasks")
      .insert({
        home_id: homeId,
        room_id: plan.room_id,
        title: plan.title,
        description: [detail, `งบประมาณ ${total / 100}`]
          .filter(Boolean)
          .join(" · "),
        status: "todo",
        priority: "medium",
      })
      .select("id")
      .single();
    destinationId = data?.id;
  } else {
    const { data } = await supabase
      .from("renovation_projects")
      .insert({
        home_id: homeId,
        room_id: plan.room_id,
        name: plan.title,
        status: "planning",
        contractor_name: option.provider_name,
        budget_minor: total,
        notes: detail || null,
      })
      .select("id")
      .single();
    destinationId = data?.id;
  }

  if (!destinationId) redirect(path(homeId));

  await supabase
    .from("comparison_options")
    .update({ is_selected: true })
    .eq("id", option.id);
  await supabase
    .from("comparison_plans")
    .update({
      status: "confirmed",
      selected_option_id: option.id,
      destination_id: destinationId,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", plan.id)
    .eq("status", "comparing");

  const destinationType =
    plan.destination_type as keyof typeof destinationRoutes;
  const event = destinationEvents[destinationType];
  await addTimelineEvent(supabase, {
    home_id: homeId,
    room_id: plan.room_id,
    event_type: event.eventType,
    title: `${event.title}: ${plan.title}`,
    source_type: event.sourceType,
    source_id: destinationId,
  });

  revalidatePath("/planning");
  revalidatePath(destinationRoutes[destinationType]);
  revalidatePath("/dashboard");
  revalidatePath("/timeline");
  redirect(path(homeId));
}

export async function deleteComparisonOption(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  if (!id) redirect(path(homeId));

  const supabase = await createClient();
  await supabase
    .from("comparison_options")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("home_id", homeId)
    .eq("is_selected", false);
  revalidatePath("/planning");
  redirect(path(homeId));
}

export async function deleteComparisonPlan(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  if (!id) redirect(path(homeId));

  const supabase = await createClient();
  await supabase
    .from("comparison_plans")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("home_id", homeId);
  revalidatePath("/planning");
  redirect(path(homeId));
}
