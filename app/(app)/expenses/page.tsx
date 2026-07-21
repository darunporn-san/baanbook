import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApplianceExpenseCard } from "@/components/expense/appliance-expense-card";
import { CreateExpenseForm } from "@/components/expense/create-expense-form";
import { ExpenseRow } from "@/components/expense/expense-row";
import { listAppliances } from "@/features/appliances/queries";
import {
  deleteApplianceExpense,
  deleteExpense,
  updateApplianceExpense,
  updateExpense,
} from "@/features/expenses/actions";
import { listExpenses } from "@/features/expenses/queries";
import { listHomes } from "@/features/homes/queries";
import { listRooms } from "@/features/rooms/queries";
import { getAppointmentDateTime, isAppointmentDone } from "@/lib/appointments";
import { formatMoney } from "@/lib/format";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    homeId?: string;
    view?: "general" | "appliance";
    page?: string;
  }>;
}) {
  const homes = await listHomes();
  const params = await searchParams;
  const home = homes.find((item) => item.id === params?.homeId) ?? homes[0];
  const rooms = await listRooms(home?.id);
  const [expenses, appliances] = await Promise.all([
    listExpenses(home?.id),
    listAppliances(home?.id),
  ]);
  const total = expenses.reduce(
    (sum, expense) => sum + expense.amount_minor,
    0,
  );
  const activeWarranties = appliances.filter(
    (item) => item.warranty_end_date,
  ).length;
  const now = new Date();
  const sortedExpenses = [...expenses].sort((a, b) => {
    const aDone = isAppointmentDone(a, now);
    const bDone = isAppointmentDone(b, now);

    if (aDone !== bDone) return aDone ? 1 : -1;

    const aAppointment = getAppointmentDateTime(a)?.getTime();
    const bAppointment = getAppointmentDateTime(b)?.getTime();

    if (aAppointment && !bAppointment) return -1;
    if (!aAppointment && bAppointment) return 1;

    if (aAppointment !== bAppointment) {
      return aDone
        ? (bAppointment ?? 0) - (aAppointment ?? 0)
        : (aAppointment ?? 0) - (bAppointment ?? 0);
    }

    return b.expense_date.localeCompare(a.expense_date);
  });
  const normalExpenses = sortedExpenses.filter(
    (expense) => expense.category !== "appliance",
  );
  const applianceExpenses = sortedExpenses.filter(
    (expense) => expense.category === "appliance",
  );
  const normalizeName = (value: string) => value.trim().toLocaleLowerCase();
  const matchedApplianceIds = new Set<string>();
  const applianceItems = [
    ...applianceExpenses.map((expense) => {
      const appliance = appliances.find(
        (item) =>
          !matchedApplianceIds.has(item.id) &&
          normalizeName(item.name) === normalizeName(expense.title),
      );

      if (appliance) matchedApplianceIds.add(appliance.id);

      return { expense, appliance };
    }),
    ...appliances
      .filter((item) => !matchedApplianceIds.has(item.id))
      .map((appliance) => ({ expense: null, appliance })),
  ];
  const activeView = params?.view === "appliance" ? "appliance" : "general";
  const pageSize = 6;
  const itemCount =
    activeView === "general" ? normalExpenses.length : applianceItems.length;
  const totalPages = Math.max(1, Math.ceil(itemCount / pageSize));
  const requestedPage = Number.parseInt(params?.page ?? "1", 10) || 1;
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const visibleNormalExpenses = normalExpenses.slice(
    pageStart,
    pageStart + pageSize,
  );
  const visibleApplianceItems = applianceItems.slice(
    pageStart,
    pageStart + pageSize,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="grid gap-6 rounded-xl bg-[#00bfa5] p-5 text-white shadow-sm sm:p-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:items-end">
        <div>
          <p className="text-sm font-medium text-white/70">การเงินของบ้าน</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
            ค่าใช้จ่าย
          </h1>
          <div className="mt-5">
            <p className="text-xs text-white/70">รวมค่าใช้จ่ายทั้งหมด</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {formatMoney(total, home?.default_currency)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 text-sm min-[420px]:grid-cols-3">
          <div className="rounded-lg border border-white/15 bg-white/15 p-4">
            <p className="text-white/70">ทั่วไป</p>
            <p className="mt-2 text-2xl font-semibold">
              {normalExpenses.length}
            </p>
            <p className="mt-1 text-xs text-white/60">รายการ</p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/15 p-4">
            <p className="text-white/70">เครื่องใช้ไฟฟ้า</p>
            <p className="mt-2 text-2xl font-semibold">
              {applianceItems.length}
            </p>
            <p className="mt-1 text-xs text-white/60">รายการ</p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/15 p-4">
            <p className="text-white/70">ประกันที่ใช้งานอยู่</p>
            <p className="mt-2 text-2xl font-semibold">{activeWarranties}</p>
            <p className="mt-1 text-xs text-white/60">รายการ</p>
          </div>
        </div>
      </section>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid min-w-0 gap-4">
          <form
            action="/expenses"
            className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="space-y-2">
              <label htmlFor="expenses-home" className="text-sm font-medium">
                บ้านของค่าใช้จ่าย
              </label>
              <select
                id="expenses-home"
                name="homeId"
                defaultValue={home?.id}
                className="flex h-10 w-full min-w-64 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {homes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">ดูข้อมูล</Button>
          </form>
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="gap-4 pb-4">
              <div>
                <CardTitle className="text-base">รายการค่าใช้จ่าย</CardTitle>
                <CardDescription>
                  แสดงครั้งละ {pageSize} รายการเพื่อให้ค้นหาและเลื่อนได้ง่าย
                </CardDescription>
              </div>
              <div className="grid grid-cols-2 rounded-lg bg-secondary p-1">
                <Link
                  href={{
                    pathname: "/expenses",
                    query: { homeId: home?.id, view: "general" },
                  }}
                  className={
                    activeView === "general"
                      ? "rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-primary shadow-sm"
                      : "rounded-md px-3 py-2 text-center text-sm text-muted-foreground hover:text-foreground"
                  }
                  aria-current={activeView === "general" ? "page" : undefined}
                >
                  ทั่วไป ({normalExpenses.length})
                </Link>
                <Link
                  href={{
                    pathname: "/expenses",
                    query: { homeId: home?.id, view: "appliance" },
                  }}
                  className={
                    activeView === "appliance"
                      ? "rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-primary shadow-sm"
                      : "rounded-md px-3 py-2 text-center text-sm text-muted-foreground hover:text-foreground"
                  }
                  aria-current={activeView === "appliance" ? "page" : undefined}
                >
                  เครื่องใช้ไฟฟ้า ({applianceItems.length})
                </Link>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              {activeView === "general" ? (
                visibleNormalExpenses.length ? (
                  visibleNormalExpenses.map((expense) => (
                    <Card key={expense.id} className="border shadow-sm">
                      <CardContent className="p-0">
                        <ExpenseRow
                          expense={expense}
                          rooms={rooms}
                          appointmentDone={isAppointmentDone(expense, now)}
                          updateAction={updateExpense}
                          deleteAction={deleteExpense}
                        />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed bg-secondary/40 p-4 text-sm text-muted-foreground">
                    ยังไม่มีค่าใช้จ่ายทั่วไป
                  </div>
                )
              ) : visibleApplianceItems.length ? (
                visibleApplianceItems.map(({ expense, appliance }) => (
                  <Card
                    key={expense?.id ?? appliance?.id}
                    className="border shadow-sm"
                  >
                    <CardContent className="p-0">
                      <ApplianceExpenseCard
                        expense={expense}
                        appliance={appliance}
                        rooms={rooms}
                        appointmentDone={
                          expense ? isAppointmentDone(expense, now) : false
                        }
                        updateAction={updateApplianceExpense}
                        deleteAction={deleteApplianceExpense}
                      />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="rounded-md border border-dashed bg-secondary/40 p-4 text-sm text-muted-foreground">
                  ยังไม่มีเครื่องใช้ไฟฟ้าและประกัน
                </div>
              )}

              {totalPages > 1 ? (
                <nav
                  className="mt-2 flex items-center justify-between border-t pt-4"
                  aria-label="แบ่งหน้ารายการค่าใช้จ่าย"
                >
                  {currentPage > 1 ? (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={{
                          pathname: "/expenses",
                          query: {
                            homeId: home?.id,
                            view: activeView,
                            page: currentPage - 1,
                          },
                        }}
                      >
                        ก่อนหน้า
                      </Link>
                    </Button>
                  ) : (
                    <span />
                  )}
                  <span className="text-sm text-muted-foreground">
                    หน้า {currentPage} / {totalPages}
                  </span>
                  {currentPage < totalPages ? (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={{
                          pathname: "/expenses",
                          query: {
                            homeId: home?.id,
                            view: activeView,
                            page: currentPage + 1,
                          },
                        }}
                      >
                        ถัดไป
                      </Link>
                    </Button>
                  ) : (
                    <span />
                  )}
                </nav>
              ) : null}
            </CardContent>
          </Card>
        </section>
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">เพิ่มรายการ</CardTitle>
              <CardDescription>
                บันทึกค่าใช้จ่าย และเพิ่มเครื่องใช้ไฟฟ้า/ประกันได้ในฟอร์มเดียว
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-140px)] overflow-y-auto pr-3">
              {home ? (
                <CreateExpenseForm
                  homeId={home.id}
                  homes={homes}
                  rooms={rooms}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  สร้างบ้านก่อนเพิ่มค่าใช้จ่าย
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
