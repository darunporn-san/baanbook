"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getHome } from "@/features/homes/queries";
import { addTimelineEvent } from "@/features/timeline/add-event";
import { getInstallmentEndDate } from "@/lib/installments";
import { createClient } from "@/lib/supabase/server";

function expensesPath(homeId: string) {
  return homeId ? `/expenses?homeId=${homeId}` : "/expenses";
}

function installmentValues(formData: FormData) {
  const rawMonths = String(formData.get("installment_months") ?? "").trim();
  const rawAmount = String(formData.get("installment_amount") ?? "").trim();
  const startDate =
    String(formData.get("installment_start_date") ?? "").trim() || null;
  const months = Number(rawMonths);
  const amount = Number(rawAmount);
  const endDate = getInstallmentEndDate(startDate, months);

  return rawMonths &&
    rawAmount &&
    Number.isInteger(months) &&
    months > 0 &&
    Number.isFinite(amount) &&
    amount >= 0
    ? {
        installment_months: months,
        installment_amount_minor: Math.round(amount * 100),
        installment_start_date: endDate ? startDate : null,
        installment_end_date: endDate,
      }
    : {
        installment_months: null,
        installment_amount_minor: null,
        installment_start_date: null,
        installment_end_date: null,
      };
}

export async function createExpense(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const home = await getHome(homeId);
  const title = String(formData.get("title") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "0"));

  if (!home || !title || !Number.isFinite(amount)) redirect("/expenses");

  const rawRoomId = String(formData.get("room_id") ?? "") || null;
  const category =
    String(formData.get("category") ?? "other").trim() || "other";
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const expenseDate =
    String(formData.get("expense_date") ?? "") ||
    new Date().toISOString().slice(0, 10);
  const appointmentDate =
    String(formData.get("appointment_date") ?? "") || null;
  const appointmentTime =
    String(formData.get("appointment_time") ?? "").trim() || null;
  const isPaid = String(formData.get("is_paid") ?? "true") !== "false";
  const installments = installmentValues(formData);
  const shouldCreateAppliance =
    String(formData.get("create_appliance") ?? "") === "1";
  const applianceName =
    String(formData.get("appliance_name") ?? "").trim() || title;
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const model = String(formData.get("model") ?? "").trim() || null;
  const purchaseDate =
    String(formData.get("purchase_date") ?? "") || expenseDate;
  const warrantyType = String(formData.get("warranty_type") ?? "none");
  const warrantyLifetime = warrantyType === "lifetime";
  const warrantyEndDate =
    warrantyType === "date"
      ? String(formData.get("warranty_end_date") ?? "") || null
      : null;
  const amountMinor = Math.round(amount * 100);
  const supabase = await createClient();
  const { data: room } = rawRoomId
    ? await supabase
        .from("rooms")
        .select("id")
        .eq("id", rawRoomId)
        .eq("home_id", home.id)
        .is("deleted_at", null)
        .maybeSingle()
    : { data: null };
  const roomId = room?.id ?? null;
  const { data: insertedData, error } = await supabase
    .from("expenses")
    .insert({
      home_id: home.id,
      room_id: roomId,
      title,
      category,
      amount_minor: amountMinor,
      currency: home.default_currency,
      expense_date: expenseDate,
      notes,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      is_paid: isPaid,
      ...installments,
    })
    .select("id")
    .single();
  let data = insertedData;

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
    const fallback = await supabase
      .from("expenses")
      .insert({
        home_id: home.id,
        room_id: roomId,
        title,
        category,
        amount_minor: amountMinor,
        currency: home.default_currency,
        expense_date: expenseDate,
        ...(error.message.includes("notes") ? {} : { notes }),
      })
      .select("id")
      .single();
    data = fallback.data;
  }

  if (data) {
    await addTimelineEvent(supabase, {
      home_id: home.id,
      room_id: roomId,
      event_type: "expense_added",
      title: `เพิ่มค่าใช้จ่าย: ${title}`,
      source_type: "expense",
      source_id: data.id,
    });

    if (shouldCreateAppliance) {
      const { data: appliance } = await supabase
        .from("appliances")
        .insert({
          home_id: home.id,
          room_id: roomId,
          name: applianceName,
          brand,
          model,
          purchase_date: purchaseDate,
          warranty_end_date: warrantyEndDate,
          warranty_lifetime: warrantyLifetime,
        })
        .select("id")
        .single();

      if (appliance) {
        await addTimelineEvent(supabase, {
          home_id: home.id,
          room_id: roomId,
          event_type: "appliance_added",
          title: `เพิ่มเครื่องใช้ไฟฟ้า: ${applianceName}`,
          source_type: "appliance",
          source_id: appliance.id,
        });
      }
    }
  }

  revalidatePath("/expenses");
  revalidatePath("/appliances");
  revalidatePath("/dashboard");
  revalidatePath("/timeline");
  revalidatePath("/warranty");
}

export async function updateExpense(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "0"));
  if (!id || !title || !Number.isFinite(amount)) redirect("/expenses");

  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({
      title,
      room_id: String(formData.get("room_id") ?? "") || null,
      category: String(formData.get("category") ?? "other").trim() || "other",
      amount_minor: Math.round(amount * 100),
      expense_date:
        String(formData.get("expense_date") ?? "") ||
        new Date().toISOString().slice(0, 10),
      notes: String(formData.get("notes") ?? "").trim() || null,
      appointment_date: String(formData.get("appointment_date") ?? "") || null,
      appointment_time:
        String(formData.get("appointment_time") ?? "").trim() || null,
      is_paid: String(formData.get("is_paid") ?? "true") !== "false",
      ...installmentValues(formData),
    })
    .eq("id", id);

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
    await supabase
      .from("expenses")
      .update({
        title,
        room_id: String(formData.get("room_id") ?? "") || null,
        category: String(formData.get("category") ?? "other").trim() || "other",
        amount_minor: Math.round(amount * 100),
        expense_date:
          String(formData.get("expense_date") ?? "") ||
          new Date().toISOString().slice(0, 10),
        ...(error.message.includes("notes")
          ? {}
          : { notes: String(formData.get("notes") ?? "").trim() || null }),
      })
      .eq("id", id);
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  redirect(expensesPath(homeId));
}

export async function updateApplianceExpense(formData: FormData) {
  const expenseId = String(formData.get("expense_id") ?? "");
  const applianceId = String(formData.get("appliance_id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const roomId = String(formData.get("room_id") ?? "") || null;
  const title = String(formData.get("title") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "0"));
  const expenseDate =
    String(formData.get("expense_date") ?? "") ||
    new Date().toISOString().slice(0, 10);
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const appointmentDate =
    String(formData.get("appointment_date") ?? "") || null;
  const appointmentTime =
    String(formData.get("appointment_time") ?? "").trim() || null;
  const isPaid = String(formData.get("is_paid") ?? "true") !== "false";
  const installments = installmentValues(formData);
  const warrantyType = String(formData.get("warranty_type") ?? "none");
  const warrantyLifetime = warrantyType === "lifetime";
  const warrantyEndDate =
    warrantyType === "date"
      ? String(formData.get("warranty_end_date") ?? "") || null
      : null;
  if (!title || !Number.isFinite(amount)) redirect(expensesPath(homeId));

  const supabase = await createClient();

  if (expenseId) {
    const expenseUpdate = {
      title,
      room_id: roomId,
      category: "appliance",
      amount_minor: Math.round(amount * 100),
      expense_date: expenseDate,
      notes,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      is_paid: isPaid,
      ...installments,
    };
    const { error } = await supabase
      .from("expenses")
      .update(expenseUpdate)
      .eq("id", expenseId);

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
      await supabase
        .from("expenses")
        .update({
          title,
          room_id: roomId,
          category: "appliance",
          amount_minor: Math.round(amount * 100),
          expense_date: expenseUpdate.expense_date,
          ...(error.message.includes("notes")
            ? {}
            : { notes: expenseUpdate.notes }),
      })
      .eq("id", expenseId);
    }
  } else if (applianceId) {
    const home = await getHome(homeId);
    if (!home) redirect("/expenses");

    const { data } = await supabase
      .from("expenses")
      .insert({
        home_id: home.id,
        room_id: roomId,
        title,
        category: "appliance",
        amount_minor: Math.round(amount * 100),
        currency: home.default_currency,
        expense_date: expenseDate,
        notes,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        is_paid: isPaid,
        ...installments,
      })
      .select("id")
      .single();

    if (data) {
      await addTimelineEvent(supabase, {
        home_id: home.id,
        room_id: roomId,
        event_type: "expense_added",
        title: `เพิ่มค่าใช้จ่าย: ${title}`,
        source_type: "expense",
        source_id: data.id,
      });
    }
  }

  if (applianceId) {
    const name =
      String(formData.get("appliance_name") ?? "").trim() ||
      String(formData.get("title") ?? "").trim();
    if (!name) redirect(expensesPath(homeId));

    await supabase
      .from("appliances")
      .update({
        name,
        room_id: roomId,
        brand: String(formData.get("brand") ?? "").trim() || null,
        model: String(formData.get("model") ?? "").trim() || null,
        purchase_date: String(formData.get("purchase_date") ?? "") || null,
        warranty_end_date: warrantyEndDate,
        warranty_lifetime: warrantyLifetime,
      })
      .eq("id", applianceId);
  }

  revalidatePath("/expenses");
  revalidatePath("/appliances");
  revalidatePath("/dashboard");
  revalidatePath("/timeline");
  revalidatePath("/warranty");
  redirect(expensesPath(homeId));
}

export async function deleteExpense(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  if (!id) redirect("/expenses");

  const supabase = await createClient();
  await supabase
    .from("expenses")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  redirect(expensesPath(homeId));
}

export async function deleteApplianceExpense(formData: FormData) {
  const expenseId = String(formData.get("expense_id") ?? "");
  const applianceId = String(formData.get("appliance_id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const supabase = await createClient();
  const deletedAt = new Date().toISOString();

  if (expenseId) {
    await supabase
      .from("expenses")
      .update({ deleted_at: deletedAt })
      .eq("id", expenseId);
  }

  if (applianceId) {
    await supabase
      .from("appliances")
      .update({ deleted_at: deletedAt })
      .eq("id", applianceId);
  }

  revalidatePath("/expenses");
  revalidatePath("/appliances");
  revalidatePath("/dashboard");
  revalidatePath("/warranty");
  redirect(expensesPath(homeId));
}
