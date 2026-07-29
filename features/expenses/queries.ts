import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type Expense = {
  id: string;
  home_id: string;
  room_id: string | null;
  renovation_project_id: string | null;
  title: string;
  category: string;
  amount_minor: number;
  currency: string;
  expense_date: string;
  notes: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  is_paid: boolean;
  payment_plan_type: "monthly" | "staged" | null;
  installment_months: number | null;
  installment_amount_minor: number | null;
  installment_start_date: string | null;
  installment_end_date: string | null;
};

export type ExpenseInstallmentPayment = {
  id: string;
  expense_id: string;
  payment_date: string;
  amount_minor: number;
};

export async function listExpenses(
  homeId?: string,
  limit = 50,
): Promise<Expense[]> {
  if (!hasSupabaseEnv() || !homeId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select(
      "id,home_id,room_id,renovation_project_id,title,category,amount_minor,currency,expense_date,notes,appointment_date,appointment_time,is_paid,payment_plan_type,installment_months,installment_amount_minor,installment_start_date,installment_end_date",
    )
    .eq("home_id", homeId)
    .is("deleted_at", null)
    .order("expense_date", { ascending: false })
    .limit(limit);

  if (error?.message.includes("renovation_project_id")) {
    const { data: compatibleData, error: compatibleError } = await supabase
      .from("expenses")
      .select(
        "id,home_id,room_id,title,category,amount_minor,currency,expense_date,notes,appointment_date,appointment_time,is_paid,payment_plan_type,installment_months,installment_amount_minor,installment_start_date,installment_end_date",
      )
      .eq("home_id", homeId)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false })
      .limit(limit);

    if (!compatibleError) {
      return (compatibleData ?? []).map((expense) => ({
        ...expense,
        renovation_project_id: null,
      }));
    }
  }

  if (error?.message.includes("payment_plan_type")) {
    const { data: compatibleData, error: compatibleError } = await supabase
      .from("expenses")
      .select(
        "id,home_id,room_id,title,category,amount_minor,currency,expense_date,notes,appointment_date,appointment_time,is_paid,installment_months,installment_amount_minor,installment_start_date,installment_end_date",
      )
      .eq("home_id", homeId)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false })
      .limit(limit);

    if (!compatibleError) {
      return (compatibleData ?? []).map((expense) => ({
        ...expense,
        renovation_project_id: null,
        payment_plan_type: expense.installment_months ? "monthly" : null,
      }));
    }
  }

  if (
    error?.message.includes("installment_start_date") ||
    error?.message.includes("installment_end_date")
  ) {
    const { data: compatibleData, error: compatibleError } = await supabase
      .from("expenses")
      .select(
        "id,home_id,room_id,title,category,amount_minor,currency,expense_date,notes,appointment_date,appointment_time,is_paid,installment_months,installment_amount_minor",
      )
      .eq("home_id", homeId)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false })
      .limit(limit);

    if (!compatibleError) {
      return (compatibleData ?? []).map((expense) => ({
        ...expense,
        renovation_project_id: null,
        payment_plan_type: expense.installment_months ? "monthly" : null,
        installment_start_date: null,
        installment_end_date: null,
      }));
    }
  }

  if (
    error?.message.includes("installment_months") ||
    error?.message.includes("installment_amount_minor") ||
    error?.message.includes("installment_start_date") ||
    error?.message.includes("installment_end_date")
  ) {
    const { data: compatibleData, error: compatibleError } = await supabase
      .from("expenses")
      .select(
        "id,home_id,room_id,title,category,amount_minor,currency,expense_date,notes,appointment_date,appointment_time,is_paid",
      )
      .eq("home_id", homeId)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false })
      .limit(limit);

    if (!compatibleError) {
      return (compatibleData ?? []).map((expense) => ({
        ...expense,
        renovation_project_id: null,
        payment_plan_type: null,
        installment_months: null,
        installment_amount_minor: null,
        installment_start_date: null,
        installment_end_date: null,
      }));
    }
  }

  if (
    error?.message.includes("notes") ||
    error?.message.includes("appointment_date") ||
    error?.message.includes("appointment_time") ||
    error?.message.includes("is_paid") ||
    error?.message.includes("installment_months") ||
    error?.message.includes("installment_amount_minor") ||
    error?.message.includes("installment_start_date") ||
    error?.message.includes("installment_end_date")
  ) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("expenses")
      .select(
        "id,home_id,room_id,title,category,amount_minor,currency,expense_date",
      )
      .eq("home_id", homeId)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false })
      .limit(limit);

    if (fallbackError) return [];

    return (fallbackData ?? []).map((expense) => ({
      ...expense,
      renovation_project_id: null,
      notes: null,
      appointment_date: null,
      appointment_time: null,
      is_paid: true,
      payment_plan_type: null,
      installment_months: null,
      installment_amount_minor: null,
      installment_start_date: null,
      installment_end_date: null,
    }));
  }

  if (error) return [];

  return data ?? [];
}

export async function getExpenseBudget(homeId?: string) {
  if (!hasSupabaseEnv() || !homeId) return null;

  const supabase = await createClient();
  const legacy = await supabase
    .from("expense_budgets")
    .select("amount_minor")
    .eq("home_id", homeId)
    .eq("month_start", "1970-01-01")
    .maybeSingle();

  if (!legacy.error) return legacy.data?.amount_minor ?? null;

  const { data } = await supabase
    .from("expense_budgets")
    .select("amount_minor")
    .eq("home_id", homeId)
    .maybeSingle();

  return data?.amount_minor ?? null;
}

export async function listExpenseInstallmentPayments(
  expenseIds: string[],
): Promise<ExpenseInstallmentPayment[]> {
  if (!hasSupabaseEnv() || !expenseIds.length) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expense_installment_payments")
    .select("id,expense_id,payment_date,amount_minor")
    .in("expense_id", expenseIds)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  return error ? [] : (data ?? []);
}
