import { CalendarDays, Hammer, MapPin, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { EditDialog } from "@/components/ui/edit-dialog";
import { HeaderHomeSwitcher } from "@/components/home/header-home-switcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listHomes } from "@/features/homes/queries";
import {
  createRenovationProject,
  deleteRenovationProject,
  updateRenovationProject,
} from "@/features/renovations/actions";
import { listRenovationProjects } from "@/features/renovations/queries";
import { listRooms } from "@/features/rooms/queries";
import { formatDate, formatMoney } from "@/lib/format";
import { commonText, getLabel, renovationStatusLabels } from "@/lib/labels";
import {
  MobileCreateTrigger,
  ResponsiveCreatePanel,
} from "@/components/ui/mobile-create-dialog";

const statusStyles: Record<string, string> = {
  planning: "bg-[#fff5d8] text-[#705b2f]",
  active: "bg-[#e8f5f3] text-primary",
  paused: "bg-secondary text-muted-foreground",
  completed: "bg-[#e7f4ea] text-[#317047]",
  cancelled: "bg-[#fff0ed] text-[#b84e40]",
};

const fieldClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function RenovationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ homeId?: string }>;
}) {
  const homes = await listHomes();
  const params = await searchParams;
  const home = homes.find((item) => item.id === params?.homeId) ?? homes[0];
  const [rooms, projects] = await Promise.all([
    listRooms(home?.id),
    listRenovationProjects(home?.id),
  ]);
  const totalBudget = projects.reduce(
    (sum, item) => sum + item.budget_minor,
    0,
  );
  const activeCount = projects.filter(
    (item) => item.status === "active",
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="relative grid gap-5 rounded-xl bg-[#ff806f] p-5 text-white shadow-sm sm:p-6 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-sm font-medium text-white/75">จัดการโปรเจกต์</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">รีโนเวท</h1>
          <p className="mt-2 text-sm text-white/80">
            ดูงบประมาณ สถานะงาน ผู้รับเหมา และกำหนดการในหน้าเดียว
          </p>
        </div>
        <div>
          <HeaderHomeSwitcher
            action="/renovations"
            label="บ้านของงานรีโนเวท"
            homes={homes}
            homeId={home?.id}
          />
          {home ? (
            <MobileCreateTrigger
              dialogId="create-renovation-dialog"
              label="เพิ่มโปรเจกต์ใหม่"
            />
          ) : null}
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <section className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff0ed] text-[#b84e40]">
                  <Hammer className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">
                    โปรเจกต์ทั้งหมด
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {projects.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8f5f3] text-primary">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">
                    กำลังดำเนินการ
                  </p>
                  <p className="mt-1 text-xl font-semibold">{activeCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2 border-0 shadow-sm lg:col-span-1">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff5d8] text-[#705b2f]">
                  <Wallet className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">งบประมาณรวม</p>
                  <p className="mt-1 truncate text-xl font-semibold">
                    {formatMoney(totalBudget, home?.default_currency)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">รายการโปรเจกต์</h2>
              <p className="text-sm text-muted-foreground">
                {projects.length
                  ? `${projects.length} โปรเจกต์`
                  : "ยังไม่มีโปรเจกต์"}
              </p>
            </div>

            {projects.length ? (
              projects.map((project) => {
                const room = rooms.find((item) => item.id === project.room_id);

                return (
                  <Card
                    key={project.id}
                    className="overflow-hidden border-0 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[project.status] ?? "bg-secondary text-muted-foreground"}`}
                            >
                              {getLabel(renovationStatusLabels, project.status)}
                            </span>
                            {room ? (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                {room.name}
                              </span>
                            ) : null}
                          </div>
                          <h3 className="mt-3 text-lg font-semibold">
                            {project.name}
                          </h3>
                          {project.notes ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {project.notes}
                            </p>
                          ) : null}
                        </div>
                        <div className="shrink-0 sm:text-right">
                          <p className="text-xs text-muted-foreground">
                            งบประมาณ
                          </p>
                          <p className="mt-1 text-lg font-semibold text-primary">
                            {formatMoney(
                              project.budget_minor,
                              home?.default_currency,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 rounded-lg bg-secondary/45 p-3 text-sm sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            ผู้รับเหมา
                          </p>
                          <p className="mt-1 font-medium">
                            {project.contractor_name || "ยังไม่ระบุ"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            ระยะเวลา
                          </p>
                          <p className="mt-1 font-medium">
                            {project.start_date || project.end_date
                              ? `${formatDate(project.start_date) || "ไม่ระบุ"} – ${formatDate(project.end_date) || "ไม่ระบุ"}`
                              : "ยังไม่กำหนด"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-2 border-t pt-4">
                        <EditDialog
                          title="แก้ไขโปรเจกต์"
                          description={project.name}
                        >
                          <form
                            action={updateRenovationProject}
                            className="grid gap-4 sm:grid-cols-2"
                          >
                            <input type="hidden" name="id" value={project.id} />
                            <input
                              type="hidden"
                              name="home_id"
                              value={project.home_id}
                            />
                            <label className="grid gap-1.5 text-xs font-medium text-muted-foreground sm:col-span-2">
                              ชื่อโปรเจกต์
                              <input
                                name="name"
                                defaultValue={project.name}
                                required
                                className={fieldClass}
                              />
                            </label>
                            <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                              ห้อง
                              <select
                                name="room_id"
                                defaultValue={project.room_id ?? ""}
                                className={fieldClass}
                              >
                                <option value="">{commonText.noRoom}</option>
                                {rooms.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                              สถานะ
                              <select
                                name="status"
                                defaultValue={project.status}
                                className={fieldClass}
                              >
                                {Object.entries(renovationStatusLabels).map(
                                  ([value, label]) => (
                                    <option key={value} value={value}>
                                      {label}
                                    </option>
                                  ),
                                )}
                              </select>
                            </label>
                            <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                              ผู้รับเหมา
                              <input
                                name="contractor_name"
                                defaultValue={project.contractor_name ?? ""}
                                className={fieldClass}
                              />
                            </label>
                            <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                              งบประมาณ
                              <input
                                name="budget"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={project.budget_minor / 100}
                                className={fieldClass}
                              />
                            </label>
                            <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                              วันที่เริ่ม
                              <DateInput
                                name="start_date"
                                defaultValue={project.start_date ?? ""}
                              />
                            </label>
                            <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                              วันที่สิ้นสุด
                              <DateInput
                                name="end_date"
                                defaultValue={project.end_date ?? ""}
                              />
                            </label>
                            <label className="grid gap-1.5 text-xs font-medium text-muted-foreground sm:col-span-2">
                              บันทึก
                              <textarea
                                name="notes"
                                defaultValue={project.notes ?? ""}
                                rows={3}
                                className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm"
                              />
                            </label>
                            <div className="flex justify-end border-t pt-4 sm:col-span-2">
                              <Button
                                type="submit"
                                pendingText="กำลังบันทึก..."
                              >
                                บันทึกการแก้ไข
                              </Button>
                            </div>
                          </form>
                        </EditDialog>
                        <form action={deleteRenovationProject}>
                          <input type="hidden" name="id" value={project.id} />
                          <input
                            type="hidden"
                            name="home_id"
                            value={project.home_id}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            {commonText.delete}
                          </Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    ยังไม่มีโปรเจกต์รีโนเวท
                  </CardTitle>
                  <CardDescription>
                    เปิด “เพิ่มโปรเจกต์ใหม่” เพื่อเริ่มวางแผนงานและงบประมาณ
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </section>
        </section>

        <ResponsiveCreatePanel
          dialogId="create-renovation-dialog"
          title="เพิ่มโปรเจกต์ใหม่"
        >
          <Card className="h-fit border-0 bg-white shadow-sm lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle className="text-base">เพิ่มโปรเจกต์ใหม่</CardTitle>
              <CardDescription>
                บันทึกข้อมูลงาน งบประมาณ และกำหนดการ
              </CardDescription>
            </CardHeader>
            <CardContent>
              {home ? (
                <form action={createRenovationProject} className="grid gap-3">
                  <input type="hidden" name="home_id" value={home.id} />
                  <label className="grid gap-2 text-sm font-medium">
                    ชื่อโปรเจกต์
                    <input
                      name="name"
                      placeholder="เช่น ปรับปรุงห้องครัว"
                      required
                      className={fieldClass}
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <label className="grid gap-2 text-sm font-medium">
                      ห้อง
                      <select name="room_id" className={fieldClass}>
                        <option value="">{commonText.noRoom}</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      สถานะ
                      <select name="status" className={fieldClass}>
                        {Object.entries(renovationStatusLabels).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                  </div>
                  <label className="grid gap-2 text-sm font-medium">
                    ผู้รับเหมา
                    <input name="contractor_name" className={fieldClass} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    งบประมาณ
                    <input
                      name="budget"
                      type="number"
                      step="0.01"
                      min="0"
                      className={fieldClass}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="grid gap-2 text-sm font-medium">
                      วันที่เริ่ม
                      <DateInput name="start_date" />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      วันที่สิ้นสุด
                      <DateInput name="end_date" />
                    </label>
                  </div>
                  <label className="grid gap-2 text-sm font-medium">
                    บันทึก
                    <textarea
                      name="notes"
                      rows={3}
                      className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <Button
                    type="submit"
                    className="mt-1 w-full"
                    pendingText="กำลังเพิ่มโปรเจกต์..."
                  >
                    เพิ่มโปรเจกต์
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  สร้างบ้านก่อนเพิ่มงานรีโนเวท
                </p>
              )}
            </CardContent>
          </Card>
        </ResponsiveCreatePanel>
      </div>
    </div>
  );
}
