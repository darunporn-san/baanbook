import type { Appliance } from "@/features/appliances/queries";
import type { HomeSummary } from "@/features/homes/queries";
import { createMaintenanceTask } from "@/features/maintenance/actions";
import type { Room } from "@/features/rooms/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maintenanceStatusLabels, priorityLabels } from "@/lib/labels";

export function CreateMaintenanceForm({
  homeId,
  homes,
  rooms,
  appliances,
}: {
  homeId: string;
  homes: HomeSummary[];
  rooms: Room[];
  appliances: Appliance[];
}) {
  return (
    <form action={createMaintenanceTask} className="grid gap-3">
      <div className="space-y-2">
        <Label htmlFor="maintenance-home">บ้าน</Label>
        <select id="maintenance-home" name="home_id" defaultValue={homeId} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
          {homes.map((home) => (
            <option key={home.id} value={home.id}>{home.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="maintenance-title">งานที่ต้องทำ</Label>
        <Input id="maintenance-title" name="title" placeholder="ล้างแอร์" required />
      </div>
      <textarea
        name="description"
        placeholder="บันทึก"
        rows={3}
        className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="status" defaultValue="todo" className="h-10 rounded-md border bg-background px-3 text-sm">
          {Object.entries(maintenanceStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select name="priority" defaultValue="medium" className="h-10 rounded-md border bg-background px-3 text-sm">
          {Object.entries(priorityLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <Input name="due_date" type="date" />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="room_id" className="h-10 rounded-md border bg-background px-3 text-sm">
          <option value="">ไม่ระบุห้อง</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>{room.name}</option>
          ))}
        </select>
        <select name="appliance_id" className="h-10 rounded-md border bg-background px-3 text-sm">
          <option value="">ไม่ระบุเครื่องใช้ไฟฟ้า</option>
          {appliances.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>
      <Button type="submit">เพิ่มงาน</Button>
    </form>
  );
}
