import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type ShoppingItem = {
  id: string;
  home_id: string;
  room_id: string | null;
  renovation_project_id: string | null;
  title: string;
  status: string;
  priority: string;
  estimated_price_minor: number | null;
  actual_price_minor: number | null;
  vendor: string | null;
  product_url: string | null;
  notes: string | null;
};

export async function listShoppingItems(homeId?: string): Promise<ShoppingItem[]> {
  if (!hasSupabaseEnv() || !homeId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shopping_items")
    .select("id,home_id,room_id,renovation_project_id,title,status,priority,estimated_price_minor,actual_price_minor,vendor,product_url,notes")
    .eq("home_id", homeId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return [];

  return data ?? [];
}

export async function listShoppingItemsAwaitingSelection(homeId?: string) {
  if (!hasSupabaseEnv() || !homeId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comparison_plans")
    .select("shopping_item_id")
    .eq("home_id", homeId)
    .eq("status", "comparing")
    .is("deleted_at", null)
    .not("shopping_item_id", "is", null);

  if (error) return [];

  return data.map((plan) => plan.shopping_item_id as string);
}
