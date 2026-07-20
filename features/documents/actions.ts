"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getHome } from "@/features/homes/queries";
import { addTimelineEvent } from "@/features/timeline/actions";
import { createClient } from "@/lib/supabase/server";

function documentsPath(homeId: string) {
  return homeId ? `/documents?homeId=${homeId}` : "/documents";
}

export async function createDocument(formData: FormData) {
  const homeId = String(formData.get("home_id") ?? "");
  const home = await getHome(homeId);
  const title = String(formData.get("title") ?? "").trim();

  if (!home || !title) redirect("/documents");

  const file = formData.get("file");
  const rawRoomId = String(formData.get("room_id") ?? "") || null;
  const documentType = String(formData.get("document_type") ?? "other").trim() || "other";
  const notes = String(formData.get("notes") ?? "").trim() || null;
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
  let storagePath: string | null = null;
  let fileName: string | null = null;
  let fileMimeType: string | null = null;
  let fileSizeBytes: number | null = null;

  if (file instanceof File && file.size > 0) {
    fileName = file.name;
    fileMimeType = file.type || null;
    fileSizeBytes = file.size;
    storagePath = `homes/${home.id}/documents/${Date.now()}-${file.name}`;
    await supabase.storage.from("home-documents").upload(storagePath, file, {
      upsert: false,
    });
  }

  const { data } = await supabase
    .from("documents")
    .insert({
      home_id: home.id,
      room_id: roomId,
      title,
      document_type: documentType,
      storage_bucket: storagePath ? "home-documents" : null,
      storage_path: storagePath,
      file_name: fileName,
      file_mime_type: fileMimeType,
      file_size_bytes: fileSizeBytes,
      notes,
    })
    .select("id")
    .single();

  if (data) {
    await addTimelineEvent(supabase, {
      home_id: home.id,
      room_id: roomId,
      event_type: "document_added",
      title: `เพิ่มเอกสาร: ${title}`,
      source_type: "document",
      source_id: data.id,
    });
  }

  revalidatePath("/documents");
  revalidatePath("/dashboard");
  revalidatePath("/timeline");
  redirect(documentsPath(home.id));
}

export async function updateDocument(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !title) redirect("/documents");

  const supabase = await createClient();
  await supabase
    .from("documents")
    .update({
      title,
      room_id: String(formData.get("room_id") ?? "") || null,
      document_type: String(formData.get("document_type") ?? "other").trim() || "other",
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id);

  revalidatePath("/documents");
  revalidatePath("/dashboard");
  redirect(documentsPath(homeId));
}

export async function deleteDocument(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const homeId = String(formData.get("home_id") ?? "");
  if (!id) redirect("/documents");

  const supabase = await createClient();
  await supabase.from("documents").update({ deleted_at: new Date().toISOString() }).eq("id", id);

  revalidatePath("/documents");
  revalidatePath("/dashboard");
  redirect(documentsPath(homeId));
}
