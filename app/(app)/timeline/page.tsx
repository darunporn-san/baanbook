import Link from "next/link";
import { HeaderHomeSwitcher } from "@/components/home/header-home-switcher";
import {
  CardContent,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TimelineEventRow } from "@/components/timeline/timeline-event-row";
import { listHomes } from "@/features/homes/queries";
import { listTimelineEvents } from "@/features/timeline/queries";
import { isAppointmentDone } from "@/lib/appointments";

export default async function TimelinePage({
  searchParams,
}: {
  searchParams?: Promise<{ homeId?: string; view?: string }>;
}) {
  const homes = await listHomes();
  const params = await searchParams;
  const home = homes.find((item) => item.id === params?.homeId) ?? homes[0];
  const events = await listTimelineEvents(home?.id);
  const now = new Date();
  const eventDone = (event: (typeof events)[number]) =>
    isAppointmentDone(
      {
        appointment_date: event.event_date.slice(0, 10),
        appointment_time: event.event_date.includes("T")
          ? event.event_date.slice(11, 16)
          : null,
      },
      now,
    );
  const pendingEvents = events.filter((event) => !eventDone(event));
  const completedEvents = events.filter(eventDone);
  const activeView =
    params?.view === "upcoming" || params?.view === "completed"
      ? params.view
      : "all";
  const visibleEvents = events.filter((event) => {
    if (activeView === "upcoming") return !eventDone(event);
    if (activeView === "completed") return eventDone(event);
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="grid gap-5 rounded-xl bg-[#00bfa5] p-5 text-white shadow-sm sm:p-6 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-sm font-medium text-white/70">กำหนดการของบ้าน</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">ไทม์ไลน์</h1>
          <p className="mt-2 text-sm text-white/80">
            นัดหมายของ {home?.name ?? "บ้านของคุณ"}
          </p>
        </div>
        <HeaderHomeSwitcher
          action="/timeline"
          label="บ้านของไทม์ไลน์"
          homes={homes}
          homeId={home?.id}
          hiddenFields={{ view: activeView }}
        />
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">รายการไทม์ไลน์</CardTitle>
            <CardDescription>
              {visibleEvents.length
                ? `${visibleEvents.length} รายการ · เรียงจากใหม่ไปเก่า`
                : "ยังไม่มีรายการ"}
            </CardDescription>
            <nav
              className="grid grid-cols-3 rounded-lg bg-secondary p-1"
              aria-label="กรองไทม์ไลน์"
            >
              {[
                ["all", "ทั้งหมด", events.length],
                ["upcoming", "ยังไม่จบ", pendingEvents.length],
                ["completed", "จบแล้ว", completedEvents.length],
              ].map(([view, label, count]) => (
                <Link
                  key={String(view)}
                  href={{
                    pathname: "/timeline",
                    query: { homeId: home?.id, view },
                  }}
                  aria-current={activeView === view ? "page" : undefined}
                  className={
                    activeView === view
                      ? "rounded-md bg-white px-2 py-2 text-center text-sm font-semibold text-primary shadow-sm"
                      : "rounded-md px-2 py-2 text-center text-sm text-muted-foreground hover:text-foreground"
                  }
                >
                  {label} ({count})
                </Link>
              ))}
            </nav>
          </CardHeader>
          <CardContent className="grid gap-3">
            {visibleEvents.length ? (
              visibleEvents.map((event) => (
                <TimelineEventRow
                  key={event.id}
                  event={event}
                  done={eventDone(event)}
                />
              ))
            ) : (
              <div className="rounded-md border border-dashed bg-secondary/40 p-4">
                <p className="text-sm font-semibold">ยังไม่มีไทม์ไลน์</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeView === "upcoming"
                      ? "ไม่มีรายการที่ยังไม่จบสำหรับบ้านหลังนี้"
                    : activeView === "completed"
                      ? "ยังไม่มีรายการที่จบแล้ว"
                      : "เพิ่มนัดหมายจากหน้าค่าใช้จ่าย"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <aside className="order-first space-y-4 lg:order-last lg:sticky lg:top-20">
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            {[
              ["ไทม์ไลน์ทั้งหมด", events.length],
              ["ยังไม่จบ", pendingEvents.length],
              ["จบแล้ว", completedEvents.length],
            ].map(([label, count]) => (
              <div
                key={String(label)}
                className="rounded-lg bg-white p-3 shadow-sm"
              >
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-xl font-semibold">{count}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
