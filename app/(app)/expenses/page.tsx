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
import { expenseCategoryGroups } from "@/features/expenses/categories";
import { listHomes } from "@/features/homes/queries";
import { listRooms } from "@/features/rooms/queries";
import {
  getAppointmentDateTime,
  isAppointmentDone,
  isAppointmentDueWithinDays,
} from "@/lib/appointments";
import { formatMoney } from "@/lib/format";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    homeId?: string;
    view?: "general" | "appliance";
    page?: string;
    q?: string;
    category?: string;
    roomId?: string;
    month?: string;
    payment?: "paid" | "unpaid";
  }>;
}) {
  const homes = await listHomes();
  const params = await searchParams;
  const home = homes.find((item) => item.id === params?.homeId) ?? homes[0];
  const rooms = await listRooms(home?.id);
  const [expenses, appliances] = await Promise.all([
    listExpenses(home?.id, 500),
    listAppliances(home?.id),
  ]);
  const total = expenses.reduce(
    (sum, expense) => sum + expense.amount_minor,
    0,
  );
  const activeWarranties = appliances.filter(
    (item) => item.warranty_end_date || item.warranty_lifetime,
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
  const allNormalExpenses = sortedExpenses.filter(
    (expense) => expense.category !== "appliance",
  );
  const applianceExpenses = sortedExpenses.filter(
    (expense) => expense.category === "appliance",
  );
  const normalizeName = (value: string) => value.trim().toLocaleLowerCase();
  const matchedApplianceIds = new Set<string>();
  const allApplianceItems = [
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
  const search = params?.q?.trim() ?? "";
  const normalizedSearch = search.toLocaleLowerCase();
  const category = params?.category ?? "";
  const roomId = params?.roomId ?? "";
  const month = /^\d{4}-\d{2}$/.test(params?.month ?? "")
    ? (params?.month ?? "")
    : "";
  const payment =
    params?.payment === "paid" || params?.payment === "unpaid"
      ? params.payment
      : "";
  const matchesRoom = (value: string | null | undefined) =>
    !roomId || (roomId === "none" ? !value : value === roomId);
  const matchesPayment = (isPaid: boolean | undefined) =>
    !payment || (isPaid !== undefined && isPaid === (payment === "paid"));
  const normalExpenses = allNormalExpenses.filter(
    (expense) =>
      (!normalizedSearch ||
        `${expense.title} ${expense.notes ?? ""}`
          .toLocaleLowerCase()
          .includes(normalizedSearch)) &&
      (!category || expense.category === category) &&
      matchesRoom(expense.room_id) &&
      matchesPayment(expense.is_paid) &&
      (!month || expense.expense_date.startsWith(month)),
  );
  const applianceItems = allApplianceItems.filter(({ expense, appliance }) => {
    const itemRoomId = expense?.room_id ?? appliance?.room_id;
    const itemDate = expense?.expense_date ?? appliance?.purchase_date;
    const searchableText = [
      expense?.title,
      expense?.notes,
      appliance?.name,
      appliance?.brand,
      appliance?.model,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();

    return (
      (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
      matchesRoom(itemRoomId) &&
      matchesPayment(expense?.is_paid) &&
      (!month || itemDate?.startsWith(month))
    );
  });
  const activeFilterQuery = {
    ...(search ? { q: search } : {}),
    ...(activeView === "general" && category ? { category } : {}),
    ...(roomId ? { roomId } : {}),
    ...(month ? { month } : {}),
    ...(payment ? { payment } : {}),
  };
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
  const filteredTotal =
    activeView === "general"
      ? normalExpenses.reduce(
          (sum, expense) => sum + expense.amount_minor,
          0,
        )
      : applianceItems.reduce(
          (sum, item) => sum + (item.expense?.amount_minor ?? 0),
          0,
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
            <input type="hidden" name="view" value={activeView} />
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
                    query: {
                      homeId: home?.id,
                      view: "general",
                      ...activeFilterQuery,
                    },
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
                    query: {
                      homeId: home?.id,
                      view: "appliance",
                      ...(search ? { q: search } : {}),
                      ...(roomId ? { roomId } : {}),
                      ...(month ? { month } : {}),
                      ...(payment ? { payment } : {}),
                    },
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
              <form
                action="/expenses"
                className="grid gap-3 rounded-lg border bg-secondary/20 p-3 sm:grid-cols-2 xl:grid-cols-5"
              >
                <input type="hidden" name="homeId" value={home?.id} />
                <input type="hidden" name="view" value={activeView} />
                <div className="space-y-1.5">
                  <label htmlFor="expense-filter-q" className="text-xs font-medium">
                    ค้นหารายการ
                  </label>
                  <input
                    id="expense-filter-q"
                    name="q"
                    defaultValue={search}
                    placeholder="ชื่อรายการ หรือรายละเอียด"
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  />
                </div>
                {activeView === "general" ? (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="expense-filter-category"
                      className="text-xs font-medium"
                    >
                      หมวดหมู่
                    </label>
                    <select
                      id="expense-filter-category"
                      name="category"
                      defaultValue={category}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="">ทุกหมวดหมู่</option>
                      {expenseCategoryGroups.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.items
                            .filter((item) => item.value !== "appliance")
                            .map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                ) : null}
                <div className="space-y-1.5">
                  <label
                    htmlFor="expense-filter-room"
                    className="text-xs font-medium"
                  >
                    ห้อง
                  </label>
                  <select
                    id="expense-filter-room"
                    name="roomId"
                    defaultValue={roomId}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">ทุกห้อง</option>
                    <option value="none">ไม่ระบุห้อง</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="expense-filter-month"
                    className="text-xs font-medium"
                  >
                    เดือนที่จ่าย
                  </label>
                  <input
                    id="expense-filter-month"
                    name="month"
                    type="month"
                    defaultValue={month}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="expense-filter-payment"
                    className="text-xs font-medium"
                  >
                    สถานะการจ่าย
                  </label>
                  <select
                    id="expense-filter-payment"
                    name="payment"
                    defaultValue={payment}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">ทุกสถานะ</option>
                    <option value="paid">จ่ายแล้ว</option>
                    <option value="unpaid">ยังไม่จ่าย</option>
                  </select>
                </div>
                <div className="flex gap-2 sm:col-span-2 xl:col-span-5 xl:justify-end">
                  <Button type="submit" className="flex-1 xl:flex-none">
                    ใช้ตัวกรอง
                  </Button>
                  <Button asChild type="button" variant="outline">
                    <Link
                      href={{
                        pathname: "/expenses",
                        query: { homeId: home?.id, view: activeView },
                      }}
                    >
                      ล้างตัวกรอง
                    </Link>
                  </Button>
                </div>
              </form>
              <div className="grid gap-3 rounded-lg bg-primary/10 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">ผลลัพธ์ที่พบ</p>
                  <p className="mt-1 text-lg font-semibold">{itemCount} รายการ</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-muted-foreground">
                    รวมค่าใช้จ่ายที่กรอง
                  </p>
                  <p className="mt-1 text-xl font-semibold text-primary">
                    {formatMoney(filteredTotal, home?.default_currency)}
                  </p>
                </div>
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
                          paymentUrgent={
                            !expense.is_paid &&
                            isAppointmentDueWithinDays(expense, 3, now)
                          }
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
                        paymentUrgent={
                          expense
                            ? !expense.is_paid &&
                              isAppointmentDueWithinDays(expense, 3, now)
                            : false
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
                            ...activeFilterQuery,
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
                            ...activeFilterQuery,
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
