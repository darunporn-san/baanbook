import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type MortgageProfile = {
  id: string;
  home_id: string;
  lender_name: string;
  principal_minor: number;
  annual_interest_rate: number;
  term_months: number;
  start_date: string;
  monthly_payment_minor: number | null;
  notes: string | null;
};

export type MortgagePayment = {
  id: string;
  home_id: string;
  mortgage_profile_id: string;
  payment_date: string;
  amount_minor: number;
  principal_minor: number | null;
  interest_minor: number | null;
  notes: string | null;
};

export type MortgageYearlyTerm = {
  id: string;
  home_id: string;
  mortgage_profile_id: string;
  mortgage_rate_cycle_id: string;
  loan_year: number;
  annual_interest_rate: number;
  monthly_payment_minor: number | null;
  strategy: "refinance" | "retention" | null;
  notes: string | null;
};

export type MortgageRateCycle = {
  id: string;
  home_id: string;
  mortgage_profile_id: string;
  cycle_number: number;
  change_type: "refinance" | "retention" | null;
  lender_name: string;
  start_date: string;
  notes: string | null;
};

export async function listMortgageProfiles(
  homeId?: string,
): Promise<MortgageProfile[]> {
  if (!hasSupabaseEnv() || !homeId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mortgage_profiles")
    .select(
      "id,home_id,lender_name,principal_minor,annual_interest_rate,term_months,start_date,monthly_payment_minor,notes",
    )
    .eq("home_id", homeId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return [];

  return data ?? [];
}

export async function listMortgagePayments(
  profileId?: string,
): Promise<MortgagePayment[]> {
  if (!hasSupabaseEnv() || !profileId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mortgage_payments")
    .select(
      "id,home_id,mortgage_profile_id,payment_date,amount_minor,principal_minor,interest_minor,notes",
    )
    .eq("mortgage_profile_id", profileId)
    .is("deleted_at", null)
    .order("payment_date", { ascending: false });

  if (error) return [];

  return data ?? [];
}

export async function listMortgageYearlyTerms(
  profileId?: string,
): Promise<MortgageYearlyTerm[]> {
  if (!hasSupabaseEnv() || !profileId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mortgage_yearly_terms")
    .select(
      "id,home_id,mortgage_profile_id,mortgage_rate_cycle_id,loan_year,annual_interest_rate,monthly_payment_minor,strategy,notes",
    )
    .eq("mortgage_profile_id", profileId)
    .is("deleted_at", null)
    .order("loan_year");

  if (error) return [];

  return data ?? [];
}

export async function listMortgageRateCycles(
  profileId?: string,
): Promise<MortgageRateCycle[]> {
  if (!hasSupabaseEnv() || !profileId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mortgage_rate_cycles")
    .select(
      "id,home_id,mortgage_profile_id,cycle_number,change_type,lender_name,start_date,notes",
    )
    .eq("mortgage_profile_id", profileId)
    .is("deleted_at", null)
    .order("cycle_number");

  if (error) return [];

  return data ?? [];
}
