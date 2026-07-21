"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getHome } from "@/features/homes/queries";
import { addTimelineEvent } from "@/features/timeline/add-event";
import { createClient } from "@/lib/supabase/server";

function path(homeId: string) {
  return homeId ? `/mortgage?homeId=${homeId}` : "/mortgage";
}

function money(formData: FormData, key: string) {
  const value = Number(String(formData.get(key) ?? "0"));
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

function optionalMoney(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.round(value * 100) : null;
}

export async function createMortgageProfile(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const home = await getHome(homeId);
  const lenderName = String(formData.get("lender_name") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "");
  const termMonths = Number(String(formData.get("term_months") ?? "0"));
  if (!home || !lenderName || !startDate || !Number.isFinite(termMonths))
    redirect("/mortgage");

  const supabase = await createClient();
  const { data } = await supabase
    .from("mortgage_profiles")
    .insert({
      home_id: home.id,
      lender_name: lenderName,
      principal_minor: money(formData, "principal"),
      term_months: termMonths,
      start_date: startDate,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (data) {
    await supabase.from("mortgage_rate_cycles").insert({
      home_id: home.id,
      mortgage_profile_id: data.id,
      cycle_number: 1,
      lender_name: lenderName,
      start_date: startDate,
    });

    await addTimelineEvent(supabase, {
      home_id: home.id,
      event_type: "mortgage_added",
      title: `เพิ่มสินเชื่อบ้าน: ${lenderName}`,
      source_type: "mortgage_profile",
      source_id: data.id,
    });
  }

  revalidatePath("/mortgage");
  revalidatePath("/dashboard");
  revalidatePath("/timeline");
  redirect(path(home.id));
}

export async function deleteMortgageProfile(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  if (!id) redirect("/mortgage");

  const supabase = await createClient();
  await supabase
    .from("mortgage_profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/mortgage");
  revalidatePath("/dashboard");
  redirect(path(homeId));
}

export async function updateMortgageProfile(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const lenderName = String(formData.get("lender_name") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "");
  const termMonths = Number(String(formData.get("term_months") ?? "0"));
  if (
    !id ||
    !homeId ||
    !lenderName ||
    !startDate ||
    !Number.isFinite(termMonths)
  )
    redirect("/mortgage");

  const supabase = await createClient();
  await supabase
    .from("mortgage_profiles")
    .update({
      lender_name: lenderName,
      principal_minor: money(formData, "principal"),
      term_months: termMonths,
      start_date: startDate,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id)
    .eq("home_id", homeId);

  revalidatePath("/mortgage");
  revalidatePath("/dashboard");
  redirect(path(homeId));
}

export async function createMortgagePayment(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const profileId = String(formData.get("mortgage_profile_id") ?? "");
  const paymentDate = String(formData.get("payment_date") ?? "");
  if (!homeId || !profileId || !paymentDate) redirect("/mortgage");

  const supabase = await createClient();
  const { data } = await supabase
    .from("mortgage_payments")
    .insert({
      home_id: homeId,
      mortgage_profile_id: profileId,
      payment_date: paymentDate,
      amount_minor: money(formData, "amount"),
      principal_minor: optionalMoney(formData, "principal"),
      interest_minor: optionalMoney(formData, "interest"),
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (data) {
    await addTimelineEvent(supabase, {
      home_id: homeId,
      event_type: "mortgage_payment_added",
      title: "Mortgage payment added",
      source_type: "mortgage_payment",
      source_id: data.id,
    });
  }

  revalidatePath("/mortgage");
  revalidatePath("/dashboard");
  revalidatePath("/timeline");
  redirect(path(homeId));
}

export async function deleteMortgagePayment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  if (!id) redirect("/mortgage");

  const supabase = await createClient();
  await supabase
    .from("mortgage_payments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/mortgage");
  revalidatePath("/dashboard");
  redirect(path(homeId));
}

export async function updateMortgagePayment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const paymentDate = String(formData.get("payment_date") ?? "");
  if (!id || !homeId || !paymentDate) redirect("/mortgage");

  const supabase = await createClient();
  await supabase
    .from("mortgage_payments")
    .update({
      payment_date: paymentDate,
      amount_minor: money(formData, "amount"),
      principal_minor: optionalMoney(formData, "principal"),
      interest_minor: optionalMoney(formData, "interest"),
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id)
    .eq("home_id", homeId);

  revalidatePath("/mortgage");
  revalidatePath("/dashboard");
  redirect(path(homeId));
}

export async function createMortgageYearlyTerm(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const profileId = String(formData.get("mortgage_profile_id") ?? "");
  const cycleId = String(formData.get("mortgage_rate_cycle_id") ?? "");
  const loanYear = Number(formData.get("loan_year"));
  const interestRate = Number(formData.get("annual_interest_rate"));
  const monthlyPayment = money(formData, "monthly_payment");
  if (
    !homeId ||
    !profileId ||
    !cycleId ||
    !Number.isInteger(loanYear) ||
    loanYear < 1 ||
    loanYear > 4 ||
    !Number.isFinite(interestRate) ||
    interestRate < 0 ||
    monthlyPayment < 1
  ) {
    redirect(path(homeId));
  }

  const supabase = await createClient();
  await supabase.from("mortgage_yearly_terms").insert({
    home_id: homeId,
    mortgage_profile_id: profileId,
    mortgage_rate_cycle_id: cycleId,
    loan_year: loanYear,
    annual_interest_rate: interestRate,
    monthly_payment_minor: monthlyPayment,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  revalidatePath("/mortgage");
  redirect(path(homeId));
}

export async function createInitialMortgageRatePlan(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const profileId = String(formData.get("mortgage_profile_id") ?? "");
  const terms = [1, 2, 3, 4].map((loanYear) => ({
    loanYear,
    interestRate: Number(formData.get(`annual_interest_rate_${loanYear}`)),
    monthlyPayment: money(formData, `monthly_payment_${loanYear}`),
  }));
  if (
    !homeId ||
    !profileId ||
    terms.some(
      (term) =>
        !Number.isFinite(term.interestRate) ||
        term.interestRate < 0 ||
        term.monthlyPayment < 1,
    )
  ) {
    redirect(path(homeId));
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("mortgage_profiles")
    .select("lender_name,start_date")
    .eq("id", profileId)
    .eq("home_id", homeId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!profile) redirect(path(homeId));

  const { data: existingCycle } = await supabase
    .from("mortgage_rate_cycles")
    .select("id")
    .eq("mortgage_profile_id", profileId)
    .eq("cycle_number", 1)
    .is("deleted_at", null)
    .maybeSingle();
  let cycleId = existingCycle?.id;

  if (!cycleId) {
    const { data: cycle } = await supabase
      .from("mortgage_rate_cycles")
      .insert({
        home_id: homeId,
        mortgage_profile_id: profileId,
        cycle_number: 1,
        lender_name: profile.lender_name,
        start_date: profile.start_date,
      })
      .select("id")
      .single();
    cycleId = cycle?.id;
  }

  if (cycleId) {
    const { data: existingTerms } = await supabase
      .from("mortgage_yearly_terms")
      .select("id,monthly_payment_minor")
      .eq("mortgage_rate_cycle_id", cycleId)
      .is("deleted_at", null);
    if (existingTerms?.some((term) => term.monthly_payment_minor != null)) {
      redirect(path(homeId));
    }
    if (existingTerms?.length) {
      await supabase
        .from("mortgage_yearly_terms")
        .update({ deleted_at: new Date().toISOString() })
        .eq("mortgage_rate_cycle_id", cycleId)
        .is("deleted_at", null);
    }

    await supabase.from("mortgage_yearly_terms").insert(
      terms.map((term) => ({
        home_id: homeId,
        mortgage_profile_id: profileId,
        mortgage_rate_cycle_id: cycleId,
        loan_year: term.loanYear,
        annual_interest_rate: term.interestRate,
        monthly_payment_minor: term.monthlyPayment,
      })),
    );
  }

  revalidatePath("/mortgage");
  redirect(path(homeId));
}

export async function updateMortgageYearlyTerm(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const loanYear = Number(formData.get("loan_year"));
  const interestRate = Number(formData.get("annual_interest_rate"));
  const monthlyPayment = money(formData, "monthly_payment");
  if (
    !id ||
    !homeId ||
    !Number.isInteger(loanYear) ||
    loanYear < 1 ||
    loanYear > 4 ||
    !Number.isFinite(interestRate) ||
    interestRate < 0 ||
    monthlyPayment < 1
  ) {
    redirect(path(homeId));
  }

  const supabase = await createClient();
  await supabase
    .from("mortgage_yearly_terms")
    .update({
      loan_year: loanYear,
      annual_interest_rate: interestRate,
      monthly_payment_minor: monthlyPayment,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id)
    .eq("home_id", homeId);

  revalidatePath("/mortgage");
  redirect(path(homeId));
}

export async function createMortgageRateCycle(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const profileId = String(formData.get("mortgage_profile_id") ?? "");
  const changeType = String(formData.get("change_type") ?? "");
  const lenderName = String(formData.get("lender_name") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "");
  const interestRate = Number(formData.get("annual_interest_rate"));
  const monthlyPayment = money(formData, "monthly_payment");
  if (
    !homeId ||
    !profileId ||
    (changeType !== "refinance" && changeType !== "retention") ||
    !lenderName ||
    !startDate ||
    !Number.isFinite(interestRate) ||
    interestRate < 0 ||
    monthlyPayment < 1
  ) {
    redirect(path(homeId));
  }

  const supabase = await createClient();
  const { data: currentCycle } = await supabase
    .from("mortgage_rate_cycles")
    .select("cycle_number")
    .eq("mortgage_profile_id", profileId)
    .is("deleted_at", null)
    .order("cycle_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data: cycle } = await supabase
    .from("mortgage_rate_cycles")
    .insert({
      home_id: homeId,
      mortgage_profile_id: profileId,
      cycle_number: (currentCycle?.cycle_number ?? 0) + 1,
      change_type: changeType,
      lender_name: lenderName,
      start_date: startDate,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (cycle) {
    await supabase.from("mortgage_yearly_terms").insert({
      home_id: homeId,
      mortgage_profile_id: profileId,
      mortgage_rate_cycle_id: cycle.id,
      loan_year: 1,
      annual_interest_rate: interestRate,
      monthly_payment_minor: monthlyPayment,
    });
  }

  revalidatePath("/mortgage");
  redirect(path(homeId));
}

export async function deleteMortgageYearlyTerm(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  if (!id) redirect(path(homeId));

  const supabase = await createClient();
  await supabase
    .from("mortgage_yearly_terms")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/mortgage");
  redirect(path(homeId));
}
