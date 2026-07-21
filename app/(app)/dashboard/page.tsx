import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Home as HomeIcon,
  Landmark,
  Package,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Wrench,
} from "lucide-react";
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
import {
  listMortgagePayments,
  listMortgageProfiles,
} from "@/features/mortgage/queries";
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
              เริ่มจากข้อมูลบ้านก่อน แล้วค่อยผูกค่าใช้จ่าย เอกสาร งานบำรุงรักษา
              และเครื่องใช้ไฟฟ้าเข้ากับบ้านหลังนี้
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
    listExpenses(home.id, 500),
    listAppliances(home.id),
    listDocuments(home.id),
    listTimelineEvents(home.id, 5),
    listMaintenanceTasks(home.id),
    listRenovationProjects(home.id),
    listShoppingItems(home.id),
    listMortgageProfiles(home.id),
  ]);
  const mortgagePayments = await listMortgagePayments(mortgageProfiles[0]?.id);
  const totalExpense = expenses.reduce(
    (sum, expense) => sum + expense.amount_minor,
    0,
  );
  const monthFormatter = new Intl.DateTimeFormat("th-TH", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
  const now = new Date();
  const monthlyExpenses = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1),
    );
    const key = date.toISOString().slice(0, 7);
    return {
      key,
      label: monthFormatter.format(date),
      amount: expenses
        .filter((expense) => expense.expense_date.startsWith(key))
        .reduce((sum, expense) => sum + expense.amount_minor, 0),
    };
  });
  const maxMonthlyExpense = Math.max(
    ...monthlyExpenses.map((month) => month.amount),
  );
  const today = new Date().toISOString().slice(0, 10);
  const overdueMaintenance = maintenanceTasks.filter(
    (task) => task.status !== "done" && task.due_date && task.due_date < today,
  );
  const upcomingMaintenance = maintenanceTasks.filter(
    (task) =>
      task.status !== "done" && (!task.due_date || task.due_date >= today),
  );
  const expiringWarranties = appliances.filter((item) => {
    if (!item.warranty_end_date) return false;
    const daysLeft = Math.ceil(
      (new Date(`${item.warranty_end_date}T00:00:00`).getTime() - Date.now()) /
        86_400_000,
    );
    return daysLeft >= 0 && daysLeft <= 30;
  });
  const renovationBudget = renovationProjects.reduce(
    (sum, project) => sum + project.budget_minor,
    0,
  );
  const shoppingPlanned = shoppingItems.filter(
    (item) => item.status === "planned",
  );
  const mortgageOutstanding = mortgageProfiles[0]
    ? Math.max(
        0,
        mortgageProfiles[0].principal_minor -
          mortgagePayments.reduce(
            (sum, payment) => sum + (payment.principal_minor ?? 0),
            0,
          ),
      )
    : 0;

  const attentionCount =
    overdueMaintenance.length +
    upcomingMaintenance.length +
    expiringWarranties.length;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="grid gap-5 rounded-xl bg-[#246a78] p-5 text-white shadow-sm lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-sm font-medium text-white/70">ภาพรวมบ้าน</p>
          <h1 className="mt-1 text-3xl font-semibold">{home.name}</h1>
          <p className="mt-2 text-sm text-white/75">
            {rooms.length} ห้อง · {documents.length} เอกสาร ·{" "}
            {appliances.length} เครื่องใช้ไฟฟ้า
          </p>
        </div>
        <form
          action="/dashboard"
          className="grid gap-2 rounded-lg bg-white/10 p-3 sm:grid-cols-[1fr_auto] sm:items-end"
        >
          <div className="grid gap-1.5">
            <label
              htmlFor="dashboard-home"
              className="text-xs font-medium text-white/80"
            >
              เปลี่ยนบ้าน
            </label>
            <select
              id="dashboard-home"
              name="homeId"
              defaultValue={home.id}
              className="h-10 rounded-md border border-white/20 bg-white px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {homes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="secondary">
            ดูข้อมูล
          </Button>
        </form>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            href: "/expenses",
            label: "ค่าใช้จ่ายทั้งหมด",
            value: formatMoney(totalExpense, home.default_currency),
            icon: Receipt,
            color: "bg-[#e8f5f3] text-primary",
          },
          {
            href: "/mortgage",
            label: "สินเชื่อคงเหลือ",
            value: formatMoney(mortgageOutstanding, home.default_currency),
            icon: Landmark,
            color: "bg-[#fff5d8] text-[#705b2f]",
          },
          {
            href: "/maintenance",
            label: "ต้องติดตาม",
            value: `${attentionCount} รายการ`,
            icon: Wrench,
            color: attentionCount
              ? "bg-[#fff0ed] text-[#b84e40]"
              : "bg-secondary text-primary",
          },
          {
            href: "/appliances",
            label: "ทรัพย์สิน",
            value: `${appliances.length} รายการ`,
            icon: Package,
            color: "bg-[#e8f5f3] text-primary",
          },
        ].map((item) => (
          <Link
            key={item.label}
            href={`${item.href}?homeId=${home.id}`}
            className="group rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-xl font-semibold">{item.value}</p>
              </div>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}
              >
                <item.icon className="h-5 w-5" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base">ค่าใช้จ่ายรายเดือน</CardTitle>
            <CardDescription>ย้อนหลัง 6 เดือน</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/expenses?homeId=${home.id}`}>ดูรายละเอียด</Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {monthlyExpenses.map((month) => (
            <div key={month.key} className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{month.label}</p>
              <p className="mt-2 font-semibold">
                {formatMoney(month.amount, home.default_currency)}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-[#00bfa5]"
                  style={{
                    width: `${maxMonthlyExpense ? (month.amount / maxMonthlyExpense) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">สิ่งที่ต้องติดตาม</CardTitle>
            <CardDescription>งานและแผนที่ควรกลับมาดู</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              {
                href: "/maintenance",
                icon: Wrench,
                title: "บำรุงรักษา",
                detail: `${overdueMaintenance.length} เกินกำหนด · ${upcomingMaintenance.length} กำลังจะถึง`,
                tone: overdueMaintenance.length
                  ? "text-[#b84e40]"
                  : "text-primary",
              },
              {
                href: "/warranty",
                icon: ShieldCheck,
                title: "ประกัน",
                detail: `${expiringWarranties.length} รายการใกล้หมดอายุ`,
                tone: expiringWarranties.length
                  ? "text-[#b84e40]"
                  : "text-primary",
              },
              {
                href: "/shopping",
                icon: ShoppingCart,
                title: "รายการซื้อ",
                detail: `${shoppingPlanned.length} รายการที่วางแผนไว้`,
                tone: "text-primary",
              },
              {
                href: "/renovations",
                icon: HomeIcon,
                title: "รีโนเวท",
                detail: `${renovationProjects.length} โปรเจกต์ · ${formatMoney(renovationBudget, home.default_currency)}`,
                tone: "text-primary",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={`${item.href}?homeId=${home.id}`}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-secondary/50"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary ${item.tone}`}
                >
                  <item.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">ข้อมูลบ้าน</CardTitle>
            <CardDescription>ข้อมูลที่บันทึกไว้ในระบบ</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              {
                href: "/homes",
                icon: HomeIcon,
                label: "ห้อง",
                value: rooms.length,
              },
              {
                href: "/documents",
                icon: FileText,
                label: "เอกสาร",
                value: documents.length,
              },
              {
                href: "/appliances",
                icon: Package,
                label: "เครื่องใช้ไฟฟ้า",
                value: appliances.length,
              },
              {
                href: "/timeline",
                icon: Receipt,
                label: "กิจกรรมล่าสุด",
                value: timeline.length,
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={`${item.href}?homeId=${home.id}`}
                className="rounded-lg bg-secondary/60 p-3 hover:bg-secondary"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-2xl font-semibold">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">ไทม์ไลน์ล่าสุด</CardTitle>
              <CardDescription>5 กิจกรรมล่าสุดของบ้าน</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/timeline?homeId=${home.id}`}>ดูทั้งหมด</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-2">
            {timeline.length ? (
              timeline.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-3 rounded-lg bg-secondary/40 p-3"
                >
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#00bfa5]" />
                  <div>
                    <p className="text-sm font-medium">
                      {formatTimelineTitle(event.title)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.event_date)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">ยังไม่มีกิจกรรม</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">ห้องในบ้าน</CardTitle>
              <CardDescription>
                {rooms.length
                  ? `แสดง ${Math.min(rooms.length, 6)} จาก ${rooms.length} ห้อง`
                  : "ยังไม่มีห้อง"}
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/homes/${home.id}`}>จัดการห้อง</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {rooms.length ? (
              rooms.slice(0, 6).map((room) => (
                <div key={room.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{room.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[room.width_m, room.length_m, room.height_m].some(
                      (value) => value != null,
                    )
                      ? `${formatDimension(room.width_m) ?? "-"} × ${formatDimension(room.length_m) ?? "-"} × ${formatDimension(room.height_m) ?? "-"} ม.`
                      : room.floor
                        ? `ชั้น ${room.floor}`
                        : "ยังไม่มีขนาด"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                เพิ่มห้องได้จากหน้าบ้าน
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
