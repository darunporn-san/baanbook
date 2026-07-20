import {
  CardContent,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateTimelineEventForm } from "@/components/timeline/create-timeline-event-form";
import { TimelineEventRow } from "@/components/timeline/timeline-event-row";
import { listHomes } from "@/features/homes/queries";
import { deleteTimelineEvent, updateTimelineEvent } from "@/features/timeline/actions";
import { listTimelineEvents } from "@/features/timeline/queries";

export default async function TimelinePage({
  searchParams,
}: {
  searchParams?: Promise<{ homeId?: string }>;
}) {
  const homes = await listHomes();
  const params = await searchParams;
  const home = homes.find((item) => item.id === params?.homeId) ?? homes[0];
  const events = await listTimelineEvents(home?.id);
  const manualEvents = events.filter((event) => event.event_type === "manual").length;
  const latestEvent = events[0];

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="rounded-lg bg-[#00bfa5] p-5 text-white shadow-sm">
        <h1 className="text-2xl font-semibold">ไทม์ไลน์</h1>
        <p className="mt-1 text-sm text-white/80">กิจกรรม งานนัดหมาย และประวัติสำคัญของ {home?.name ?? "บ้านของคุณ"}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <form
          action="/timeline"
          className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="space-y-2">
            <label htmlFor="timeline-home" className="text-sm font-medium">
              บ้านของไทม์ไลน์
            </label>
            <select
              id="timeline-home"
              name="homeId"
              defaultValue={home?.id}
              className="flex h-10 w-full min-w-64 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {homes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit">ดูข้อมูล</Button>
        </form>

        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{events.length}</CardTitle>
              <CardDescription>ทั้งหมด</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{manualEvents}</CardTitle>
              <CardDescription>บันทึกเอง</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{latestEvent ? "มี" : "-"}</CardTitle>
              <CardDescription>ล่าสุด</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">รายการไทม์ไลน์</CardTitle>
            <CardDescription>{events.length ? "เรียงจากใหม่ไปเก่า" : "ยังไม่มีรายการ"}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {events.length ? (
              events.map((event) => (
                <TimelineEventRow
                  key={event.id}
                  event={event}
                  updateAction={updateTimelineEvent}
                  deleteAction={deleteTimelineEvent}
                />
              ))
            ) : (
              <div className="rounded-md border border-dashed bg-secondary/40 p-4">
                <p className="text-sm font-semibold">ยังไม่มีไทม์ไลน์</p>
                <p className="mt-1 text-sm text-muted-foreground">เพิ่มรายการเอง หรือทำ action เช่น เพิ่มห้อง ค่าใช้จ่าย หรือเอกสาร แล้วระบบจะบันทึกให้</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">เพิ่มไทม์ไลน์</CardTitle>
            <CardDescription>บันทึกนัดหมาย งานซ่อม หรือเหตุการณ์สำคัญของบ้าน</CardDescription>
          </CardHeader>
          <CardContent>
            {home ? (
              <CreateTimelineEventForm homeId={home.id} />
            ) : (
              <p className="text-sm text-muted-foreground">สร้างบ้านก่อนเพิ่มไทม์ไลน์</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
