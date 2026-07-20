import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateHomeForm } from "@/components/home/create-home-form";
import { listAppliances } from "@/features/appliances/queries";
import { listDocuments } from "@/features/documents/queries";
import { listExpenses } from "@/features/expenses/queries";
import { listHomes } from "@/features/homes/queries";
import { listMaintenanceTasks } from "@/features/maintenance/queries";
import { listMortgagePayments, listMortgageProfiles } from "@/features/mortgage/queries";
import { listRenovationProjects } from "@/features/renovations/queries";
import { listRooms } from "@/features/rooms/queries";
import { listShoppingItems } from "@/features/shopping/queries";
import { listTimelineEvents } from "@/features/timeline/queries";
import { formatDate, formatDimension, formatMoney } from "@/lib/format";
import { formatTimelineTitle } from "@/lib/labels";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ homeId?: string }>;
}) {
  const homes = await listHomes();

  if (homes.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>สร้างบ้านหลังแรก</CardTitle>
            <CardDescription>
              เริ่มจากข้อมูลบ้านก่อน แล้วค่อยผูกค่าใช้จ่าย เอกสาร งานบำรุงรักษา และเครื่องใช้ไฟฟ้าเข้ากับบ้านหลังนี้
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateHomeForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  const params = await searchParams;
  const home = homes.find((item) => item.id === params?.homeId) ?? homes[0];
  const [
    rooms,
    expenses,
    appliances,
    documents,
    timeline,
    maintenanceTasks,
    renovationProjects,
    shoppingItems,
    mortgageProfiles,
  ] = await Promise.all([
    listRooms(home.id),
    listExpenses(home.id),
    listAppliances(home.id),
    listDocuments(home.id),
    listTimelineEvents(home.id, 5),
    listMaintenanceTasks(home.id),
    listRenovationProjects(home.id),
    listShoppingItems(home.id),
    listMortgageProfiles(home.id),
  ]);
  const mortgagePayments = await listMortgagePayments(mortgageProfiles[0]?.id);
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount_minor, 0);
  const today = new Date().toISOString().slice(0, 10);
  const overdueMaintenance = maintenanceTasks.filter((task) => task.status !== "done" && task.due_date && task.due_date < today);
  const upcomingMaintenance = maintenanceTasks.filter((task) => task.status !== "done" && (!task.due_date || task.due_date >= today));
  const expiringWarranties = appliances.filter((item) => {
    if (!item.warranty_end_date) return false;
    const daysLeft = Math.ceil((new Date(`${item.warranty_end_date}T00:00:00`).getTime() - Date.now()) / 86_400_000);
    return daysLeft >= 0 && daysLeft <= 30;
  });
  const renovationBudget = renovationProjects.reduce((sum, project) => sum + project.budget_minor, 0);
  const shoppingPlanned = shoppingItems.filter((item) => item.status === "planned");
  const mortgageOutstanding = mortgageProfiles[0]
    ? Math.max(0, mortgageProfiles[0].principal_minor - mortgagePayments.reduce((sum, payment) => sum + (payment.principal_minor ?? 0), 0))
    : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <form
        action="/dashboard"
        className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="space-y-2">
          <label htmlFor="dashboard-home" className="text-sm font-medium">
            เลือกบ้านสำหรับวิเคราะห์
          </label>
          <select
            id="dashboard-home"
            name="homeId"
            defaultValue={home.id}
            className="flex h-10 w-full min-w-64 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {homes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">วิเคราะห์</Button>
      </form>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <Card className="border-0 bg-[#ff806f] text-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-normal">ข้อมูลบ้าน</CardTitle>
            <CardDescription className="text-white/80">{home.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md bg-white/15 p-3">
              <p className="text-xs uppercase text-white/75">ห้อง</p>
              <p className="text-3xl font-semibold">{rooms.length}</p>
            </div>
            <div className="rounded-md bg-white/15 p-3">
              <p className="text-xs uppercase text-white/75">เอกสาร</p>
              <p className="text-3xl font-semibold">{documents.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-[#00bfa5] text-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-normal">ทรัพย์สิน</CardTitle>
            <CardDescription className="text-white/80">เครื่องใช้ไฟฟ้า</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-[16px] border-white/30 border-t-[#ffd36a] border-r-[#ff806f]">
              <span className="text-3xl font-semibold">{appliances.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-normal text-muted-foreground">สถิติ</CardTitle>
            <CardDescription>ภาพรวมเฟส 1</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-4 border-b border-l px-4 pb-4">
              {[rooms.length, expenses.length, appliances.length, documents.length, maintenanceTasks.length].map((value, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-sm bg-[#ff806f]"
                    style={{ height: `${Math.max(18, value * 18)}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{["R", "E", "A", "D", "M"][index]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-0 bg-[#00bfa5] text-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-normal">ค่าใช้จ่าย</CardTitle>
              <CardDescription className="text-white/80">{formatMoney(totalExpense, home.default_currency)}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-[#ffd36a] text-[#514227] shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-normal">ไทม์ไลน์</CardTitle>
              <CardDescription className="text-[#705b2f]">{timeline.length} รายการ</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-[#ff806f] text-white shadow-sm sm:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-normal">เอกสาร</CardTitle>
              <CardDescription className="text-white/80">{documents.length} ไฟล์และข้อมูล</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-white shadow-sm sm:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-normal text-muted-foreground">บำรุงรักษา</CardTitle>
              <CardDescription>{overdueMaintenance.length} เกินกำหนด · {upcomingMaintenance.length} กำลังจะถึง</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-[#ffd36a] text-[#514227] shadow-sm sm:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-normal">ประกัน</CardTitle>
              <CardDescription className="text-[#705b2f]">{expiringWarranties.length} ใกล้หมดอายุ</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-[#ff806f] text-white shadow-sm sm:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-normal">รีโนเวท</CardTitle>
              <CardDescription className="text-white/80">{renovationProjects.length} โปรเจกต์ · {formatMoney(renovationBudget, home.default_currency)}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-[#00bfa5] text-white shadow-sm sm:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-normal">รายการซื้อ</CardTitle>
              <CardDescription className="text-white/80">{shoppingPlanned.length} รายการที่วางแผนไว้</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-white shadow-sm sm:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-normal text-muted-foreground">สินเชื่อบ้าน</CardTitle>
              <CardDescription>{formatMoney(mortgageOutstanding, home.default_currency)} คงเหลือ</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-normal text-muted-foreground">ไทม์ไลน์ล่าสุด</CardTitle>
            <CardDescription>{timeline.length ? "กิจกรรมล่าสุดของบ้าน" : "ยังไม่มีกิจกรรม"}</CardDescription>
          </CardHeader>
          <CardContent className="grid max-h-72 gap-2 overflow-auto">
            {timeline.length ? (
              timeline.map((event) => (
                <div key={event.id} className="rounded-md border-l-4 border-l-[#00bfa5] bg-secondary/40 p-3">
                  <p className="text-sm font-medium">{formatTimelineTitle(event.title)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(event.event_date)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">เพิ่มห้อง ค่าใช้จ่าย เครื่องใช้ไฟฟ้า หรือเอกสาร เพื่อเริ่มสร้างไทม์ไลน์</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-normal text-muted-foreground">ห้อง</CardTitle>
            <CardDescription>{rooms.length ? "พื้นที่ในบ้าน" : "ยังไม่มีห้อง"}</CardDescription>
          </CardHeader>
          <CardContent className="grid max-h-72 gap-2 overflow-auto">
            {rooms.length ? (
              rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between rounded-md bg-[#e8f5f3] p-3">
                  <span className="text-sm font-medium">{room.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {[room.width_m, room.length_m, room.height_m].some((value) => value != null)
                      ? `${formatDimension(room.width_m) ?? "-"} x ${formatDimension(room.length_m) ?? "-"} x ${formatDimension(room.height_m) ?? "-"} m`
                      : room.floor ? `ชั้น ${room.floor}` : "ห้อง"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">เพิ่มห้องได้จากหน้าบ้าน</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
