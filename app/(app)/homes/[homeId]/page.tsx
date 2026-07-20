import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateRoomForm } from "@/components/room/create-room-form";
import { RoomRow } from "@/components/room/room-row";
import { getHome } from "@/features/homes/queries";
import {
  createRoomOpening,
  deleteRoom,
  deleteRoomOpening,
  updateRoomOpening,
  updateRoom,
} from "@/features/rooms/actions";
import { listRooms } from "@/features/rooms/queries";
import { getLabel, homeTypeLabels } from "@/lib/labels";

export default async function HomeDetailPage({
  params,
}: {
  params: Promise<{ homeId: string }>;
}) {
  const { homeId } = await params;
  const home = await getHome(homeId);

  if (!home) {
    notFound();
  }

  const rooms = await listRooms(home.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-4">
        <div className="rounded-lg bg-[#ff806f] p-5 text-white shadow-sm">
          <Button asChild size="sm" variant="secondary" className="mb-4">
            <Link href="/homes">กลับไปหน้าบ้าน</Link>
          </Button>
          <h1 className="text-2xl font-semibold">{home.name}</h1>
          <p className="mt-1 text-sm text-white/80">
            {getLabel(homeTypeLabels, home.home_type) || "บ้าน"} · {home.default_currency} · {home.timezone}
          </p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">ห้องสำหรับรีโนเวท</CardTitle>
            <CardDescription>ขนาดห้อง พื้นที่พื้น ประเมินผนัง และช่องเปิด</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {rooms.length ? (
              rooms.map((room) => (
                <RoomRow
                  key={room.id}
                  room={room}
                  updateAction={updateRoom}
                  deleteAction={deleteRoom}
                  createOpeningAction={createRoomOpening}
                  updateOpeningAction={updateRoomOpening}
                  deleteOpeningAction={deleteRoomOpening}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">ยังไม่มีห้อง</p>
            )}
          </CardContent>
        </Card>
      </section>

      <aside>
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">เพิ่มห้อง</CardTitle>
            <CardDescription>สร้างห้องสำหรับบ้านหลังนี้</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateRoomForm homeId={home.id} />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
