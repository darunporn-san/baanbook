"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createHome(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const homeType = String(formData.get("home_type") ?? "house");
  const redirectTo = String(formData.get("redirect_to") ?? "/dashboard");
  const nextPath = redirectTo === "/homes" ? "/homes" : "/dashboard";

  if (!name) {
    redirect(nextPath);
  }

  const supabase = await createClient();
  const payload = {
    name,
    home_type: homeType,
    default_currency: "THB",
    timezone: "Asia/Bangkok",
  };
  const { data: home, error: homeError } = await supabase
    .from("homes")
    .insert(payload)
    .select("id")
    .single();

  if (homeError || !home) {
    redirect(nextPath);
  }

  revalidatePath("/dashboard");
  revalidatePath("/homes");
  redirect(nextPath);
}

export async function deleteHome(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/homes");
  }

  const supabase = await createClient();
  await supabase
    .from("homes")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/dashboard");
  revalidatePath("/homes");
  revalidatePath(`/homes/${id}`);
  revalidatePath("/expenses");
  revalidatePath("/appliances");
  revalidatePath("/documents");
  revalidatePath("/timeline");
  redirect("/homes");
}
