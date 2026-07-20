import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createRenovationProject, deleteRenovationProject, updateRenovationProject } from "@/features/renovations/actions";
import { listRenovationProjects } from "@/features/renovations/queries";
import { listHomes } from "@/features/homes/queries";
import { listRooms } from "@/features/rooms/queries";
import { formatDate, formatMoney } from "@/lib/format";
import { commonText, getLabel, renovationStatusLabels } from "@/lib/labels";

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
  const totalBudget = projects.reduce((sum, item) => sum + item.budget_minor, 0);
  const active = projects.filter((item) => item.status === "active");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-4">
        <div className="rounded-lg bg-[#ff806f] p-5 text-white shadow-sm">
          <h1 className="text-2xl font-semibold">รีโนเวท</h1>
          <p className="mt-1 text-sm text-white/80">วางแผนงานห้อง งบประมาณ และผู้รับเหมา</p>
        </div>
        <form action="/renovations" className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <label htmlFor="renovation-home" className="text-sm font-medium">บ้านของงานรีโนเวท</label>
            <select id="renovation-home" name="homeId" defaultValue={home?.id} className="flex h-10 w-full min-w-64 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {homes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <Button type="submit">ดูข้อมูล</Button>
        </form>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="border-0 bg-[#ffd36a] text-[#514227] shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-normal">งบประมาณ</CardTitle>
              <CardDescription className="text-[#705b2f]">{formatMoney(totalBudget, home?.default_currency)}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-[#00bfa5] text-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-normal">กำลังทำ</CardTitle>
              <CardDescription className="text-white/80">{active.length} โปรเจกต์</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-3">
          {projects.length ? projects.map((project) => (
            <Card key={project.id} className="border-0 shadow-sm">
              <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <CardDescription>
                    {getLabel(renovationStatusLabels, project.status)} · {formatMoney(project.budget_minor, home?.default_currency)}
                    {project.start_date ? ` · ${formatDate(project.start_date)}` : ""}
                  </CardDescription>
                  {project.contractor_name ? <CardDescription>{project.contractor_name}</CardDescription> : null}
                </div>
                <form action={deleteRenovationProject}>
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="home_id" value={project.home_id} />
                  <Button size="sm" variant="ghost">{commonText.delete}</Button>
                </form>
              </CardHeader>
              <CardContent>
                <details>
                  <summary className="cursor-pointer text-sm font-medium text-primary">{commonText.edit}</summary>
                  <form action={updateRenovationProject} className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="id" value={project.id} />
                    <input type="hidden" name="home_id" value={project.home_id} />
                    <input name="name" defaultValue={project.name} required className="h-10 rounded-md border bg-background px-3 text-sm" />
                    <select name="room_id" defaultValue={project.room_id ?? ""} className="h-10 rounded-md border bg-background px-3 text-sm">
                      <option value="">{commonText.noRoom}</option>
                      {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
                    </select>
                    <select name="status" defaultValue={project.status} className="h-10 rounded-md border bg-background px-3 text-sm">
                      {Object.entries(renovationStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <input name="contractor_name" defaultValue={project.contractor_name ?? ""} placeholder="ผู้รับเหมา" className="h-10 rounded-md border bg-background px-3 text-sm" />
                    <input name="budget" type="number" step="0.01" min="0" defaultValue={project.budget_minor / 100} placeholder="งบประมาณ" className="h-10 rounded-md border bg-background px-3 text-sm" />
                    <input name="start_date" type="date" defaultValue={project.start_date ?? ""} className="h-10 rounded-md border bg-background px-3 text-sm" />
                    <input name="end_date" type="date" defaultValue={project.end_date ?? ""} className="h-10 rounded-md border bg-background px-3 text-sm" />
                    <input name="notes" defaultValue={project.notes ?? ""} placeholder="บันทึก" className="h-10 rounded-md border bg-background px-3 text-sm" />
                    <Button type="submit" size="sm">{commonText.save}</Button>
                  </form>
                </details>
              </CardContent>
            </Card>
          )) : (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">ยังไม่มีโปรเจกต์รีโนเวท</CardTitle>
                <CardDescription>เพิ่มโปรเจกต์เพื่อดูงบประมาณและสถานะ</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </section>

      <Card className="border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">เพิ่มโปรเจกต์</CardTitle>
          <CardDescription>เริ่มจากข้อมูลสำคัญและงบประมาณก่อน</CardDescription>
        </CardHeader>
        <CardContent>
          {home ? (
            <form action={createRenovationProject} className="grid gap-3">
              <input type="hidden" name="home_id" value={home.id} />
              <input name="name" placeholder="ปรับปรุงห้องครัว" required className="h-10 rounded-md border bg-background px-3 text-sm" />
              <select name="room_id" className="h-10 rounded-md border bg-background px-3 text-sm">
                <option value="">{commonText.noRoom}</option>
                {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
              </select>
              <select name="status" className="h-10 rounded-md border bg-background px-3 text-sm">
                {Object.entries(renovationStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <input name="contractor_name" placeholder="ผู้รับเหมา" className="h-10 rounded-md border bg-background px-3 text-sm" />
              <input name="budget" type="number" step="0.01" min="0" placeholder="งบประมาณ" className="h-10 rounded-md border bg-background px-3 text-sm" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="start_date" type="date" className="h-10 rounded-md border bg-background px-3 text-sm" />
                <input name="end_date" type="date" className="h-10 rounded-md border bg-background px-3 text-sm" />
              </div>
              <input name="notes" placeholder="บันทึก" className="h-10 rounded-md border bg-background px-3 text-sm" />
              <Button type="submit">เพิ่มโปรเจกต์</Button>
            </form>
          ) : <p className="text-sm text-muted-foreground">สร้างบ้านก่อนเพิ่มงานรีโนเวท</p>}
        </CardContent>
      </Card>
    </div>
  );
}
