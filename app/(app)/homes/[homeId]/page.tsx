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
import { MobileCreateDialog } from "@/components/ui/mobile-create-dialog";

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
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="relative rounded-xl bg-[#ff806f] p-5 text-white shadow-sm sm:p-6">
        <Button asChild size="sm" variant="secondary" className="mb-4">
          <Link href="/homes">กลับไปหน้าบ้าน</Link>
        </Button>
        <p className="text-sm font-medium text-white/75">จัดการห้องภายในบ้าน</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{home.name}</h1>
        <p className="mt-2 text-sm text-white/80">
          {getLabel(homeTypeLabels, home.home_type) || "บ้าน"} · {rooms.length}{" "}
          ห้อง · {home.timezone}
        </p>
        <MobileCreateDialog
          title="เพิ่มห้อง"
          description="สร้างห้องสำหรับบ้านหลังนี้"
        >
          <CreateRoomForm homeId={home.id} />
        </MobileCreateDialog>
      </section>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">ห้องใน {home.name}</CardTitle>
              <CardDescription>
                {rooms.length} ห้อง · ขนาดพื้นที่ ผนัง และช่องเปิดของบ้านหลังนี้
              </CardDescription>
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

        <aside className="hidden lg:block">
          <Card className="h-fit border-0 bg-white shadow-sm lg:sticky lg:top-20">
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
    </div>
  );
}
