import { createRoom } from "@/features/rooms/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateRoomForm({ homeId }: { homeId: string }) {
  return (
    <form action={createRoom} className="grid gap-3">
      <input type="hidden" name="home_id" value={homeId} />
      <div className="space-y-2">
        <Label htmlFor="room-name">ชื่อห้อง</Label>
        <Input id="room-name" name="name" placeholder="ห้องครัว" required />
      </div>
      <div className="grid gap-3">
        <Input name="floor" placeholder="ชั้น" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="room-width">กว้าง (ม.)</Label>
          <Input id="room-width" name="width_m" type="number" step="0.01" min="0" placeholder="3.00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="room-length">ยาว (ม.)</Label>
          <Input id="room-length" name="length_m" type="number" step="0.01" min="0" placeholder="4.00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="room-height">สูง (ม.)</Label>
          <Input id="room-height" name="height_m" type="number" step="0.01" min="0" placeholder="2.80" />
        </div>
      </div>
      <Button type="submit">เพิ่มห้อง</Button>
    </form>
  );
}
