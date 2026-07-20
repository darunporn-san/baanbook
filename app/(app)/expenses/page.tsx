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
  searchParams?: Promise<{ homeId?: string }>;
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <section className="space-y-4">
        <div className="rounded-lg bg-[#00bfa5] p-5 text-white shadow-sm">
          <h1 className="text-2xl font-semibold">ค่าใช้จ่าย</h1>
          <p className="mt-1 text-sm text-white/80">
            รวมค่าใช้จ่าย {formatMoney(total, home?.default_currency)} ·
            เครื่องใช้ไฟฟ้า {appliances.length} รายการ · ประกัน{" "}
            {activeWarranties} รายการ
          </p>
        </div>
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
          <CardHeader>
            <CardTitle className="text-base">รายการค่าใช้จ่าย</CardTitle>
            <CardDescription>
              {normalExpenses.length
                ? "เพิ่ม แก้ไข และลบค่าใช้จ่ายทั่วไปของบ้าน"
                : "ยังไม่มีค่าใช้จ่ายทั่วไป"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {normalExpenses.length ? (
              normalExpenses.map((expense) => (
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
              <div className="rounded-md border border-dashed bg-secondary/40 p-4">
                <p className="text-sm font-semibold">
                  ยังไม่มีค่าใช้จ่ายทั่วไป
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  เพิ่มค่าใช้จ่ายรายการแรกของบ้าน
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              เครื่องใช้ไฟฟ้าและประกัน
            </CardTitle>
            <CardDescription>
              จัดการเครื่องใช้ไฟฟ้า วันที่ซื้อ
              และวันหมดประกันในหน้าเดียวกับค่าใช้จ่าย
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {applianceItems.length ? (
              <div className="grid gap-3">
                {applianceItems.map(({ expense, appliance }) => (
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
                ))}
              </div>
            ) : null}

            {!applianceItems.length ? (
              <div className="rounded-md border border-dashed bg-secondary/40 p-4">
                <p className="text-sm font-semibold">ยังไม่มีเครื่องใช้ไฟฟ้า</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  ติ๊กบันทึกเป็นเครื่องใช้ไฟฟ้าในฟอร์มเพิ่มรายการด้านขวา
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
      <aside className="space-y-4">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">เพิ่มรายการ</CardTitle>
            <CardDescription>
              บันทึกค่าใช้จ่าย และเพิ่มเครื่องใช้ไฟฟ้า/ประกันได้ในฟอร์มเดียว
            </CardDescription>
          </CardHeader>
          <CardContent>
            {home ? (
              <CreateExpenseForm homeId={home.id} homes={homes} rooms={rooms} />
            ) : (
              <p className="text-sm text-muted-foreground">
                สร้างบ้านก่อนเพิ่มค่าใช้จ่าย
              </p>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
