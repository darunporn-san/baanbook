import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type ComparisonOption = {
  id: string;
  comparison_plan_id: string;
  home_id: string;
  provider_name: string;
  item_name: string | null;
  product_price_minor: number;
  quantity: number;
  installation_price_minor: number;
  currency: string;
  product_url: string | null;
  notes: string | null;
  is_selected: boolean;
};

export type ComparisonPlan = {
  id: string;
  home_id: string;
  room_id: string | null;
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
      "id,home_id,room_id,title,destination_type,status,notes,selected_option_id,destination_id,confirmed_at",
    )
    .eq("home_id", homeId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error || !plans?.length) return [];

  const { data: options } = await supabase
    .from("comparison_options")
    .select(
      "id,comparison_plan_id,home_id,provider_name,item_name,product_price_minor,quantity,installation_price_minor,currency,product_url,notes,is_selected",
    )
    .in(
      "comparison_plan_id",
      plans.map((plan) => plan.id),
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  return plans.map((plan) => ({
    ...plan,
    options: (options ?? []).filter(
      (option) => option.comparison_plan_id === plan.id,
    ),
  })) as ComparisonPlan[];
}
