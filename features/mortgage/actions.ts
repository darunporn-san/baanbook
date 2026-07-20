"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getHome } from "@/features/homes/queries";
import { addTimelineEvent } from "@/features/timeline/actions";
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
  if (!home || !lenderName || !startDate || !Number.isFinite(termMonths)) redirect("/mortgage");

  const supabase = await createClient();
  const { data } = await supabase
    .from("mortgage_profiles")
    .insert({
      home_id: home.id,
      lender_name: lenderName,
      principal_minor: money(formData, "principal"),
      annual_interest_rate: Number(String(formData.get("annual_interest_rate") ?? "0")) || 0,
      term_months: termMonths,
      start_date: startDate,
      monthly_payment_minor: optionalMoney(formData, "monthly_payment"),
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (data) {
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
  await supabase.from("mortgage_profiles").update({ deleted_at: new Date().toISOString() }).eq("id", id);

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
  if (!id || !homeId || !lenderName || !startDate || !Number.isFinite(termMonths)) redirect("/mortgage");

  const supabase = await createClient();
  await supabase
    .from("mortgage_profiles")
    .update({
      lender_name: lenderName,
      principal_minor: money(formData, "principal"),
      annual_interest_rate: Number(String(formData.get("annual_interest_rate") ?? "0")) || 0,
      term_months: termMonths,
      start_date: startDate,
      monthly_payment_minor: optionalMoney(formData, "monthly_payment"),
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
  await supabase.from("mortgage_payments").update({ deleted_at: new Date().toISOString() }).eq("id", id);

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
