import Link from "next/link";
import { ArrowRight, DoorOpen, House, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateHomeForm } from "@/components/home/create-home-form";
import { deleteHome } from "@/features/homes/actions";
import { listHomes } from "@/features/homes/queries";
import { listRooms } from "@/features/rooms/queries";
import { formatDimension } from "@/lib/format";
import { getLabel, homeTypeLabels } from "@/lib/labels";

export default async function HomesPage() {
  const homes = await listHomes();
  const roomsByHome = new Map(
    await Promise.all(
      homes.map(async (home) => [home.id, await listRooms(home.id)] as const),
    ),
  );
  const totalRooms = [...roomsByHome.values()].reduce(
    (sum, rooms) => sum + rooms.length,
    0,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="rounded-xl bg-[#ff806f] p-5 text-white shadow-sm sm:p-6">
        <p className="text-sm font-medium text-white/75">
          โครงสร้างที่อยู่อาศัย
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">บ้านและห้อง</h1>
        <p className="mt-2 text-sm text-white/80">
          แยกห้องตามบ้านแต่ละหลัง เพื่อให้ค่าใช้จ่าย ทรัพย์สิน
          และงานซ่อมอยู่ถูกที่
        </p>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff0ed] text-[#b84e40]">
                  <House className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">บ้านทั้งหมด</p>
                  <p className="mt-1 text-xl font-semibold">{homes.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8f5f3] text-primary">
                  <DoorOpen className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">ห้องทั้งหมด</p>
                  <p className="mt-1 text-xl font-semibold">{totalRooms}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {homes.length ? (
              homes.map((home) => {
                const rooms = roomsByHome.get(home.id) ?? [];

                return (
                  <Card
                    key={home.id}
                    className="overflow-hidden border-0 shadow-sm"
                  >
                    <CardHeader className="border-b bg-secondary/45">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="truncate text-lg">
                            {home.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {getLabel(homeTypeLabels, home.home_type) || "บ้าน"}{" "}
                            · {home.timezone}
                          </CardDescription>
                        </div>
                        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                          {rooms.length} ห้อง
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Layers3 className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold">
                          ห้องในบ้านหลังนี้
                        </p>
                      </div>

                      {rooms.length ? (
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                          {rooms.slice(0, 6).map((room) => (
                            <div
                              key={room.id}
                              className="rounded-lg border bg-white p-3"
                            >
                              <p className="truncate text-sm font-medium">
                                {room.name}
                              </p>
                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {room.floor
                                  ? `ชั้น ${room.floor}`
                                  : "ไม่ระบุชั้น"}
                                {room.width_m != null && room.length_m != null
                                  ? ` · ${formatDimension(room.width_m)} × ${formatDimension(room.length_m)} ม.`
                                  : ""}
                              </p>
                            </div>
                          ))}
                          {rooms.length > 6 ? (
                            <div className="flex items-center justify-center rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                              อีก {rooms.length - 6} ห้อง
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed p-4 text-center">
                          <p className="text-sm font-medium">ยังไม่มีห้อง</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            เปิดบ้านหลังนี้เพื่อเพิ่มห้องแรก
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
                        <form action={deleteHome}>
                          <input type="hidden" name="id" value={home.id} />
                          <Button size="sm" variant="ghost">
                            ลบบ้าน
                          </Button>
                        </form>
                        <Button asChild size="sm">
                          <Link href={`/homes/${home.id}`}>
                            จัดการห้อง
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="border-0 shadow-sm xl:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">ยังไม่มีบ้าน</CardTitle>
                  <CardDescription>
                    สร้างบ้านหลังแรก แล้วจึงเพิ่มห้องภายในบ้านนั้น
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </section>

        <Card className="h-fit border-0 bg-white shadow-sm lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-base">เพิ่มบ้าน</CardTitle>
            <CardDescription>
              แต่ละบ้านจะมีรายการห้องแยกจากกันอย่างชัดเจน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateHomeForm redirectTo="/homes" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
