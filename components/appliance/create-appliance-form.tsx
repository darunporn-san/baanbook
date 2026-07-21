import type { HomeSummary } from "@/features/homes/queries";
import type { Room } from "@/features/rooms/queries";
import { createAppliance } from "@/features/appliances/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateApplianceForm({
  homeId,
  homes,
  rooms,
  redirectTo,
}: {
  homeId: string;
  homes: HomeSummary[];
  rooms: Room[];
  redirectTo?: string;
}) {
  return (
    <form action={createAppliance} className="grid gap-3">
      {redirectTo ? <input type="hidden" name="redirect_to" value={redirectTo} /> : null}
      <div className="space-y-2">
        <Label htmlFor="appliance-home">บ้าน</Label>
        <select
          id="appliance-home"
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
        <Label htmlFor="appliance-name">ชื่อเครื่องใช้ไฟฟ้า</Label>
        <Input id="appliance-name" name="name" placeholder="ตู้เย็น" required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="brand" placeholder="ยี่ห้อ" />
        <Input name="model" placeholder="รุ่น" />
      </div>
      <select name="room_id" className="h-10 rounded-md border bg-background px-3 text-sm">
        <option value="">ไม่ระบุห้อง</option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="appliance-purchase-date">วันที่ซื้อ</Label>
          <Input id="appliance-purchase-date" name="purchase_date" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="appliance-warranty-type">รูปแบบประกัน</Label>
          <select
            id="appliance-warranty-type"
            name="warranty_type"
            defaultValue="none"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="none">ไม่มีประกัน</option>
            <option value="date">ระบุวันหมดประกัน</option>
            <option value="lifetime">ประกันตลอดชีพ</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="appliance-warranty-end-date">วันหมดประกัน</Label>
          <Input id="appliance-warranty-end-date" name="warranty_end_date" type="date" />
        </div>
      </div>
      <Button type="submit">เพิ่มเครื่องใช้ไฟฟ้า</Button>
    </form>
  );
}
