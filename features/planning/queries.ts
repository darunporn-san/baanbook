import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { PriceBasis } from "@/features/planning/pricing";

export type ComparisonOption = {
  id: string;
  comparison_plan_id: string;
  home_id: string;
  provider_name: string;
  item_name: string | null;
  product_price_minor: number;
  product_price_basis: PriceBasis;
  quantity: number;
  installation_price_minor: number;
  installation_price_basis: PriceBasis;
  currency: string;
  product_url: string | null;
  notes: string | null;
  is_selected: boolean;
};

export type ComparisonPlan = {
  id: string;
  home_id: string;
  room_id: string | null;
  shopping_item_id: string | null;
  title: string;
  destination_type: "shopping" | "maintenance" | "renovation";
  status: "comparing" | "confirmed";
  notes: string | null;
  selected_option_id: string | null;
  destination_id: string | null;
  confirmed_at: string | null;
  options: ComparisonOption[];
};

export async function listComparisonPlans(
  homeId?: string,
): Promise<ComparisonPlan[]> {
  if (!hasSupabaseEnv() || !homeId) return [];

  const supabase = await createClient();
  const { data: plans, error } = await supabase
    .from("comparison_plans")
    .select(
      "id,home_id,room_id,shopping_item_id,title,destination_type,status,notes,selected_option_id,destination_id,confirmed_at",
    )
    .eq("home_id", homeId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error || !plans?.length) return [];

  const shoppingItemIds = [
    ...new Set(
      plans
        .map((plan) => plan.shopping_item_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const { data: activeShoppingItems } = shoppingItemIds.length
    ? await supabase
        .from("shopping_items")
        .select("id")
        .in("id", shoppingItemIds)
        .is("deleted_at", null)
    : { data: [] };
  const activeShoppingItemIds = new Set(
    (activeShoppingItems ?? []).map((item) => item.id),
  );
  const activePlans = plans.filter(
    (plan) =>
      !plan.shopping_item_id ||
      activeShoppingItemIds.has(plan.shopping_item_id),
  );
  if (!activePlans.length) return [];

  const { data: options } = await supabase
    .from("comparison_options")
    .select(
      "id,comparison_plan_id,home_id,provider_name,item_name,product_price_minor,product_price_basis,quantity,installation_price_minor,installation_price_basis,currency,product_url,notes,is_selected",
    )
    .in(
      "comparison_plan_id",
      activePlans.map((plan) => plan.id),
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  return activePlans.map((plan) => ({
    ...plan,
    options: (options ?? []).filter(
      (option) => option.comparison_plan_id === plan.id,
    ),
  })) as ComparisonPlan[];
}
