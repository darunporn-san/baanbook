import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type TimelineEvent = {
  id: string;
  home_id: string;
  event_type: string;
  title: string;
  description: string | null;
  event_date: string;
};

function datedEvent(
  id: string,
  homeId: string,
  eventType: string,
  title: string,
  date: string | null,
  description: string | null = null,
): TimelineEvent | null {
  if (!date) return null;

  return {
    id,
    home_id: homeId,
    event_type: eventType,
    title,
    description,
    event_date: date,
  };
}

export async function listTimelineEvents(
  homeId?: string,
  limit = 50,
): Promise<TimelineEvent[]> {
  if (!hasSupabaseEnv() || !homeId) return [];

  const supabase = await createClient();
  const { data: expenses } = await supabase
    .from("expenses")
    .select("id,home_id,title,notes,appointment_date,appointment_time")
    .eq("home_id", homeId)
    .is("deleted_at", null)
    .not("appointment_date", "is", null)
    .limit(limit);

  const appointmentEvents = (expenses ?? []).flatMap((item) => {
    const time = item.appointment_time?.slice(0, 5);
    const date = item.appointment_date
      ? time
        ? `${item.appointment_date}T${time}:00`
        : item.appointment_date
      : null;

    const event = datedEvent(
      `appointment-${item.id}`,
      item.home_id,
      "appointment",
      `นัดหมาย: ${item.title}`,
      date,
      item.notes,
    );
    return event ? [event] : [];
  });

  return appointmentEvents
    .sort((a, b) => b.event_date.localeCompare(a.event_date))
    .slice(0, limit);
}
