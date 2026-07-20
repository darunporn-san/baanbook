import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type Expense = {
  id: string;
  home_id: string;
  room_id: string | null;
  title: string;
  category: string;
  amount_minor: number;
  currency: string;
  expense_date: string;
  notes: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
};

export async function listExpenses(homeId?: string): Promise<Expense[]> {
  if (!hasSupabaseEnv() || !homeId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("id,home_id,room_id,title,category,amount_minor,currency,expense_date,notes,appointment_date,appointment_time")
    .eq("home_id", homeId)
    .is("deleted_at", null)
    .order("expense_date", { ascending: false })
    .limit(50);

  if (
    error?.message.includes("notes") ||
    error?.message.includes("appointment_date") ||
    error?.message.includes("appointment_time")
  ) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("expenses")
      .select("id,home_id,room_id,title,category,amount_minor,currency,expense_date")
      .eq("home_id", homeId)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false })
      .limit(50);

    if (fallbackError) return [];

    return (fallbackData ?? []).map((expense) => ({
      ...expense,
      notes: null,
      appointment_date: null,
      appointment_time: null,
    }));
  }

  if (error) return [];

  return data ?? [];
}
