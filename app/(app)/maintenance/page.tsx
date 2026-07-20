import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateMaintenanceForm } from "@/components/maintenance/create-maintenance-form";
import { MaintenanceRow } from "@/components/maintenance/maintenance-row";
import { listAppliances } from "@/features/appliances/queries";
import { listHomes } from "@/features/homes/queries";
import {
  completeMaintenanceTask,
  deleteMaintenanceTask,
  updateMaintenanceTask,
} from "@/features/maintenance/actions";
import { listMaintenanceTasks } from "@/features/maintenance/queries";
import { listRooms } from "@/features/rooms/queries";

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams?: Promise<{ homeId?: string }>;
}) {
  const homes = await listHomes();
  const params = await searchParams;
  const home = homes.find((item) => item.id === params?.homeId) ?? homes[0];
  const [rooms, appliances, tasks] = await Promise.all([
    listRooms(home?.id),
    listAppliances(home?.id),
    listMaintenanceTasks(home?.id),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const overdue = tasks.filter((task) => task.status !== "done" && task.due_date && task.due_date < today);
  const upcoming = tasks.filter((task) => task.status !== "done" && (!task.due_date || task.due_date >= today));
  const completed = tasks.filter((task) => task.status === "done");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-4">
        <div className="rounded-lg bg-[#00bfa5] p-5 text-white shadow-sm">
          <h1 className="text-2xl font-semibold">บำรุงรักษา</h1>
          <p className="mt-1 text-sm text-white/80">วางแผน ติดตาม และปิดงานดูแลบ้าน</p>
        </div>
        <form
          action="/maintenance"
          className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="space-y-2">
            <label htmlFor="maintenance-home" className="text-sm font-medium">บ้านของงานบำรุงรักษา</label>
            <select
              id="maintenance-home"
              name="homeId"
              defaultValue={home?.id}
              className="flex h-10 w-full min-w-64 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {homes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <Button type="submit">ดูข้อมูล</Button>
        </form>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-0 bg-[#ff806f] text-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-normal">เกินกำหนด</CardTitle>
              <CardDescription className="text-white/80">{overdue.length} งาน</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-[#ffd36a] text-[#514227] shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-normal">กำลังจะถึง</CardTitle>
              <CardDescription className="text-[#705b2f]">{upcoming.length} งาน</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-normal text-muted-foreground">เสร็จแล้ว</CardTitle>
              <CardDescription>{completed.length} งาน</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">งานบำรุงรักษา</CardTitle>
            <CardDescription>{home ? `สำหรับ ${home.name}` : "สร้างบ้านก่อนเพิ่มงาน"}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {tasks.length ? (
              tasks.map((task) => (
                <MaintenanceRow
                  key={task.id}
                  task={task}
                  rooms={rooms}
                  appliances={appliances}
                  updateAction={updateMaintenanceTask}
                  completeAction={completeMaintenanceTask}
                  deleteAction={deleteMaintenanceTask}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">ยังไม่มีงานบำรุงรักษา</p>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">เพิ่มงาน</CardTitle>
          <CardDescription>ผูกกับห้องหรือเครื่องใช้ไฟฟ้าเมื่อจำเป็น</CardDescription>
        </CardHeader>
        <CardContent>
          {home ? (
            <CreateMaintenanceForm homeId={home.id} homes={homes} rooms={rooms} appliances={appliances} />
          ) : (
            <p className="text-sm text-muted-foreground">สร้างบ้านก่อนเพิ่มงานบำรุงรักษา</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
