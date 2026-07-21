import { HeaderHomeSwitcher } from "@/components/home/header-home-switcher";
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
  const overdue = tasks.filter(
    (task) => task.status !== "done" && task.due_date && task.due_date < today,
  );
  const upcoming = tasks.filter(
    (task) =>
      task.status !== "done" && (!task.due_date || task.due_date >= today),
  );
  const completed = tasks.filter((task) => task.status === "done");

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="grid gap-5 rounded-xl bg-[#00bfa5] p-5 text-white shadow-sm sm:p-6 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-sm font-medium text-white/70">งานที่ต้องดูแล</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">บำรุงรักษา</h1>
          <p className="mt-2 text-sm text-white/80">
            วางแผน ติดตาม และปิดงานดูแลบ้าน
          </p>
        </div>
        <HeaderHomeSwitcher
          action="/maintenance"
          label="บ้านของงานบำรุงรักษา"
          homes={homes}
          homeId={home?.id}
        />
      </section>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-0 bg-[#ff806f] text-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-normal">
                  เกินกำหนด
                </CardTitle>
                <CardDescription className="text-white/80">
                  {overdue.length} งาน
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-[#ffd36a] text-[#514227] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-normal">
                  กำลังจะถึง
                </CardTitle>
                <CardDescription className="text-[#705b2f]">
                  {upcoming.length} งาน
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-normal text-muted-foreground">
                  เสร็จแล้ว
                </CardTitle>
                <CardDescription>{completed.length} งาน</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">งานบำรุงรักษา</CardTitle>
              <CardDescription>
                {home ? `สำหรับ ${home.name}` : "สร้างบ้านก่อนเพิ่มงาน"}
              </CardDescription>
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
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีงานบำรุงรักษา
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <Card className="h-fit border-0 bg-white shadow-sm lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-base">เพิ่มงาน</CardTitle>
            <CardDescription>
              ผูกกับห้องหรือเครื่องใช้ไฟฟ้าเมื่อจำเป็น
            </CardDescription>
          </CardHeader>
          <CardContent>
            {home ? (
              <CreateMaintenanceForm
                homeId={home.id}
                homes={homes}
                rooms={rooms}
                appliances={appliances}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                สร้างบ้านก่อนเพิ่มงานบำรุงรักษา
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
