import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  const appointments = events.filter(
    (event) => event.event_type === "appointment",
  );
  const appointmentDone = (event: (typeof events)[number]) =>
    isAppointmentDone(
      {
        appointment_date: event.event_date.slice(0, 10),
        appointment_time: event.event_date.includes("T")
          ? event.event_date.slice(11, 16)
          : null,
      },
      now,
    );
  const pendingAppointments = appointments.filter(
    (event) => !appointmentDone(event),
  );
  const completedAppointments = appointments.filter(appointmentDone);
  const activeView = ["upcoming", "completed"].includes(params?.view ?? "")
    ? params?.view
    : "all";
  const visibleEvents = events.filter((event) => {
    if (activeView === "upcoming")
      return event.event_type === "appointment" && !appointmentDone(event);
    if (activeView === "completed")
      return event.event_type === "appointment" && appointmentDone(event);
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-xl bg-[#00bfa5] p-5 text-white shadow-sm sm:p-6">
        <p className="text-sm font-medium text-white/70">กำหนดการของบ้าน</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">ไทม์ไลน์</h1>
        <p className="mt-2 text-sm text-white/80">
          วันที่ซื้อ นัดหมาย วันหมดประกัน และกำหนดซ่อมของ{" "}
          {home?.name ?? "บ้านของคุณ"}
        </p>
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
                ["upcoming", "ยังไม่จบ", pendingAppointments.length],
                ["completed", "จบแล้ว", completedAppointments.length],
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
                  appointmentDone={
                    event.event_type === "appointment"
                      ? appointmentDone(event)
                      : undefined
                  }
                />
              ))
            ) : (
              <div className="rounded-md border border-dashed bg-secondary/40 p-4">
                <p className="text-sm font-semibold">ยังไม่มีไทม์ไลน์</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeView === "upcoming"
                    ? "ไม่มีนัดหมายที่ยังไม่จบสำหรับบ้านหลังนี้"
                    : activeView === "completed"
                      ? "ยังไม่มีนัดหมายที่จบแล้ว"
                      : "เพิ่มวันที่ซื้อ นัดหมาย วันหมดประกัน หรือกำหนดซ่อมจากหน้าที่เกี่ยวข้อง"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <aside className="order-first space-y-4 lg:order-last lg:sticky lg:top-20">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">เลือกบ้าน</CardTitle>
              <CardDescription>ดูไทม์ไลน์เฉพาะบ้านที่เลือก</CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/timeline" className="grid gap-3">
                <input type="hidden" name="view" value={activeView} />
                <select
                  id="timeline-home"
                  name="homeId"
                  defaultValue={home?.id}
                  aria-label="บ้านของไทม์ไลน์"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {homes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <Button type="submit">ดูข้อมูล</Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            {[
              ["ไทม์ไลน์ทั้งหมด", events.length],
              ["นัดหมายยังไม่จบ", pendingAppointments.length],
              ["นัดหมายจบแล้ว", completedAppointments.length],
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
