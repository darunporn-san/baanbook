import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type HomeDocument = {
  id: string;
  home_id: string;
  room_id: string | null;
  title: string;
  document_type: string;
  file_name: string | null;
  storage_path: string | null;
  created_at: string;
};

export async function listDocuments(homeId?: string): Promise<HomeDocument[]> {
  if (!hasSupabaseEnv() || !homeId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("id,home_id,room_id,title,document_type,file_name,storage_path,created_at")
    .eq("home_id", homeId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];

  return data ?? [];
}

