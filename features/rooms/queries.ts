import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type Room = {
  id: string;
  home_id: string;
  name: string;
  room_type: string | null;
  floor: string | null;
  zone: string | null;
  width_m: number | null;
  length_m: number | null;
  height_m: number | null;
  window_count: number;
  door_count: number;
  balcony_count: number;
  openings: RoomOpening[];
};

export type RoomOpening = {
  id: string;
  home_id: string;
  room_id: string;
  opening_type: "window" | "door" | "balcony" | "other";
  label: string | null;
  width_m: number | null;
  height_m: number | null;
  quantity: number;
  notes: string | null;
};

export async function listRooms(homeId?: string): Promise<Room[]> {
  if (!hasSupabaseEnv() || !homeId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id,home_id,name,room_type,floor,zone,width_m,length_m,height_m,window_count,door_count,balcony_count")
    .eq("home_id", homeId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (
    error?.message.includes("width_m") ||
    error?.message.includes("length_m") ||
    error?.message.includes("height_m") ||
    error?.message.includes("window_count") ||
    error?.message.includes("door_count") ||
    error?.message.includes("balcony_count")
  ) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("rooms")
      .select("id,home_id,name,room_type,floor,zone")
      .eq("home_id", homeId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (fallbackError) return [];

    return (fallbackData ?? []).map((room) => ({
      ...room,
      width_m: null,
      length_m: null,
      height_m: null,
      window_count: 0,
      door_count: 0,
      balcony_count: 0,
      openings: [],
    }));
  }

  if (error) return [];

  if (!data?.length) return [];

  const roomIds = data.map((room) => room.id);
  const { data: openings, error: openingsError } = await supabase
    .from("room_openings")
    .select("id,home_id,room_id,opening_type,label,width_m,height_m,quantity,notes")
    .in("room_id", roomIds)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const openingsByRoom = new Map<string, RoomOpening[]>();
  if (!openingsError) {
    for (const opening of (openings ?? []) as RoomOpening[]) {
      openingsByRoom.set(opening.room_id, [
        ...(openingsByRoom.get(opening.room_id) ?? []),
        opening,
      ]);
    }
  }

  return data.map((room) => ({
    ...room,
    openings: openingsByRoom.get(room.id) ?? [],
  }));
}
