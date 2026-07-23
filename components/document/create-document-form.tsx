import type { HomeSummary } from "@/features/homes/queries";
import type { Room } from "@/features/rooms/queries";
import { createDocument } from "@/features/documents/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { documentTypeLabels } from "@/lib/labels";

export function CreateDocumentForm({
  homeId,
  homes,
  rooms,
}: {
  homeId: string;
  homes: HomeSummary[];
  rooms: Room[];
}) {
  return (
    <form action={createDocument} className="grid gap-3">
      <div className="space-y-2">
        <Label htmlFor="document-home">บ้าน</Label>
        <select
          id="document-home"
          name="home_id"
          defaultValue={homeId}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          {homes.map((home) => (
            <option key={home.id} value={home.id}>
              {home.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="document-title">ชื่อเอกสาร</Label>
        <Input id="document-title" name="title" placeholder="ใบเสร็จประกัน" required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="document_type" className="h-10 rounded-md border bg-background px-3 text-sm">
          {Object.entries(documentTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select name="room_id" className="h-10 rounded-md border bg-background px-3 text-sm">
          <option value="">ไม่ระบุห้อง</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </div>
      <Input name="file" type="file" />
      <textarea
        name="notes"
        placeholder="บันทึก"
        rows={3}
        className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm"
      />
      <Button type="submit">เพิ่มเอกสาร</Button>
    </form>
  );
}
