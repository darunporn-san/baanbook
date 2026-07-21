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

const sourceTables: Record<string, string> = {
  room: "rooms",
  expense: "expenses",
  appliance: "appliances",
  document: "documents",
  maintenance_task: "maintenance_tasks",
  renovation_project: "renovation_projects",
  shopping_item: "shopping_items",
  mortgage_profile: "mortgage_profiles",
  mortgage_payment: "mortgage_payments",
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
  const [timeline, appliances, expenses, maintenance] = await Promise.all([
    supabase
      .from("timeline_events")
      .select(
        "id,home_id,event_type,title,description,event_date,source_type,source_id",
      )
      .eq("home_id", homeId)
      .order("event_date", { ascending: false })
      .limit(limit),
    supabase
      .from("appliances")
      .select("id,home_id,name,brand,model,purchase_date,warranty_end_date")
      .eq("home_id", homeId)
      .is("deleted_at", null)
      .limit(limit),
    supabase
      .from("expenses")
      .select("id,home_id,title,notes,appointment_date,appointment_time")
      .eq("home_id", homeId)
      .is("deleted_at", null)
      .not("appointment_date", "is", null)
      .limit(limit),
    supabase
      .from("maintenance_tasks")
      .select("id,home_id,title,description,due_date,status")
      .eq("home_id", homeId)
      .is("deleted_at", null)
      .not("due_date", "is", null)
      .neq("status", "cancelled")
      .limit(limit),
  ]);

  const sources = new Map<string, string[]>();
  for (const event of timeline.data ?? []) {
    if (
      !event.source_type ||
      !event.source_id ||
      !sourceTables[event.source_type]
    )
      continue;
    sources.set(event.source_type, [
      ...(sources.get(event.source_type) ?? []),
      event.source_id,
    ]);
  }
  const activeSources = new Set<string>();
  await Promise.all(
    [...sources].map(async ([sourceType, ids]) => {
      const { data, error } = await supabase
        .from(sourceTables[sourceType])
        .select("id")
        .in("id", ids)
        .is("deleted_at", null);
      const activeIds = error ? ids : (data ?? []).map((item) => item.id);
      for (const id of activeIds) activeSources.add(`${sourceType}:${id}`);
    }),
  );
  const storedEvents = (timeline.data ?? []).filter(
    (event) =>
      !event.source_type ||
      !event.source_id ||
      !sourceTables[event.source_type] ||
      activeSources.has(`${event.source_type}:${event.source_id}`),
  );

  const applianceEvents = (appliances.data ?? []).flatMap((item) =>
    [
      datedEvent(
        `purchase-${item.id}`,
        item.home_id,
        "purchase",
        `ซื้อ: ${item.name}`,
        item.purchase_date,
        [item.brand, item.model].filter(Boolean).join(" · ") || null,
      ),
      datedEvent(
        `warranty-${item.id}`,
        item.home_id,
        "warranty_end",
        `หมดประกัน: ${item.name}`,
        item.warranty_end_date,
        [item.brand, item.model].filter(Boolean).join(" · ") || null,
      ),
    ].filter((event): event is TimelineEvent => event !== null),
  );
  const appointmentEvents = (expenses.data ?? []).flatMap((item) => {
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
  const maintenanceEvents = (maintenance.data ?? []).flatMap((item) => {
    const event = datedEvent(
      `maintenance-due-${item.id}`,
      item.home_id,
      "maintenance_due",
      `ถึงกำหนดซ่อม: ${item.title}`,
      item.due_date,
      item.description,
    );
    return event ? [event] : [];
  });

  return [
    ...storedEvents,
    ...applianceEvents,
    ...appointmentEvents,
    ...maintenanceEvents,
  ]
    .sort((a, b) => b.event_date.localeCompare(a.event_date))
    .slice(0, limit);
}
