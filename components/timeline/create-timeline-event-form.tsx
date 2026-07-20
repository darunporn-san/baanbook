import { createTimelineEvent } from "@/features/timeline/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { timelineEventLabels } from "@/lib/labels";

export function CreateTimelineEventForm({ homeId }: { homeId: string }) {
  return (
    <form action={createTimelineEvent} className="grid gap-3">
      <input type="hidden" name="home_id" value={homeId} />
      <div className="space-y-2">
        <Label htmlFor="timeline-title">หัวข้อ</Label>
        <Input id="timeline-title" name="title" placeholder="นัดช่างเข้าดูหน้างาน" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="timeline-type">ประเภท</Label>
        <select id="timeline-type" name="event_type" defaultValue="manual" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
          {Object.entries(timelineEventLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="timeline-date">วันที่</Label>
          <Input id="timeline-date" name="event_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeline-time">เวลา</Label>
          <Input id="timeline-time" name="event_time" type="time" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="timeline-description">รายละเอียด</Label>
        <Input id="timeline-description" name="description" placeholder="เช่น ช่างเข้าวัดพื้นที่ ติดตั้ง หรือซ่อมแซม" />
      </div>
      <Button type="submit">เพิ่มไทม์ไลน์</Button>
    </form>
  );
}
