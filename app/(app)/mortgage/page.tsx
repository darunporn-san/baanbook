import { Landmark, ReceiptText, TrendingDown } from "lucide-react";
import { CreateMortgagePaymentForm } from "@/components/mortgage/create-mortgage-payment-form";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { EditDialog } from "@/components/ui/edit-dialog";
import { HeaderHomeSwitcher } from "@/components/home/header-home-switcher";
import {
  MobileCreateTrigger,
  ResponsiveCreatePanel,
} from "@/components/ui/mobile-create-dialog";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listHomes } from "@/features/homes/queries";
import {
  createInitialMortgageRatePlan,
  createMortgageProfile,
  createMortgageRateCycle,
  createMortgageYearlyTerm,
  deleteMortgagePayment,
  deleteMortgageProfile,
  deleteMortgageYearlyTerm,
  updateMortgagePayment,
  updateMortgageProfile,
  updateMortgageYearlyTerm,
} from "@/features/mortgage/actions";
import {
  listMortgagePayments,
  listMortgageProfiles,
  listMortgageRateCycles,
  listMortgageYearlyTerms,
} from "@/features/mortgage/queries";
import { formatDate, formatMoney } from "@/lib/format";
import { commonText } from "@/lib/labels";
import {
  adjustMortgageScheduleForPayments,
  calculateMortgageSchedule,
  getMortgageDueRowStatus,
  type AdjustedMortgageScheduleRow,
} from "@/lib/mortgage-amortization";

function MortgageScheduleMobileCard({
  row,
  today,
  currency,
}: {
  row: AdjustedMortgageScheduleRow;
  today: string;
  currency?: string;
}) {
  const dueStatus = getMortgageDueRowStatus(row.dueDate, today);
  const fields = [
    {
      label: "จ่ายจริง",
      value:
        row.actualPaymentMinor == null
          ? "—"
          : formatMoney(row.actualPaymentMinor, currency),
    },
    {
      label: "ยอดโป๊ะ",
      value: row.extraPaymentMinor
        ? formatMoney(row.extraPaymentMinor, currency)
        : "—",
      className: "text-[#b84e40]",
    },
    {
      label: "ดอกเบี้ย",
      value: formatMoney(row.adjustedInterestMinor, currency),
      className: "text-[#9a6d10]",
    },
    {
      label: "เงินต้น",
      value: formatMoney(row.adjustedPrincipalMinor, currency),
      className: "text-primary",
    },
    {
      label: "คงเหลือเดิม",
      value: formatMoney(row.balanceMinor, currency),
    },
    {
      label: "หลังโป๊ะ",
      value: formatMoney(row.adjustedBalanceMinor, currency),
      className: "text-primary",
    },
  ];

  return (
    <details
      className={`group overflow-hidden rounded-xl border ${
        dueStatus === "urgent"
          ? "bg-red-100"
          : dueStatus === "current-month"
            ? "bg-amber-100"
            : "bg-white"
      }`}
    >
      <summary className="grid cursor-pointer list-none grid-cols-2 gap-4 p-4 [&::-webkit-details-marker]:hidden">
        <div>
          <span className="block text-[11px] text-muted-foreground">งวด</span>
          <span className="mt-0.5 block font-semibold">{row.installment}</span>
        </div>
        <div className="text-right">
          <span className="block text-[11px] text-muted-foreground">วันที่</span>
          <span className="mt-0.5 block font-medium">
            {formatDate(row.dueDate)}
          </span>
        </div>
      </summary>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-current/10 px-4 pb-4 pt-3">
        {fields.map((field, index) => (
          <div key={field.label} className={index % 2 ? "text-right" : ""}>
            <dt className="text-[11px] text-muted-foreground">{field.label}</dt>
            <dd
              className={`mt-0.5 font-medium tabular-nums ${field.className ?? ""}`}
            >
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

export default async function MortgagePage({
  searchParams,
}: {
  searchParams?: Promise<{ homeId?: string }>;
}) {
  const homes = await listHomes();
  const params = await searchParams;
  const home = homes.find((item) => item.id === params?.homeId) ?? homes[0];
  const profiles = await listMortgageProfiles(home?.id);
  const profile = profiles[0];
  const payments = await listMortgagePayments(profile?.id);
  const rateCycles = await listMortgageRateCycles(profile?.id);
  const yearlyTerms = await listMortgageYearlyTerms(profile?.id);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const activeCycle = rateCycles.at(-1);
  const activeCycleTerms = yearlyTerms.filter(
    (term) => term.mortgage_rate_cycle_id === activeCycle?.id,
  );
  const showInitialRatePlan =
    !activeCycle ||
    (rateCycles.length === 1 &&
      activeCycleTerms.every((term) => term.monthly_payment_minor == null));
  const availableRateYears = [1, 2, 3, 4].filter(
    (year) =>
      !yearlyTerms.some(
        (term) =>
          term.mortgage_rate_cycle_id === activeCycle?.id &&
          term.loan_year === year,
      ),
  );
  const orderedYearlyTerms = [...yearlyTerms].sort((a, b) => {
    const aCycle = rateCycles.find(
      (cycle) => cycle.id === a.mortgage_rate_cycle_id,
    )?.cycle_number;
    const bCycle = rateCycles.find(
      (cycle) => cycle.id === b.mortgage_rate_cycle_id,
    )?.cycle_number;
    return (aCycle ?? 1) - (bCycle ?? 1) || a.loan_year - b.loan_year;
  });
  const principalPaid = payments.reduce(
    (sum, item) => sum + (item.principal_minor ?? 0),
    0,
  );
  const totalPaid = payments.reduce((sum, item) => sum + item.amount_minor, 0);
  const outstanding = profile
    ? Math.max(0, profile.principal_minor - principalPaid)
    : 0;
  const mortgageSchedule = profile
    ? calculateMortgageSchedule({
        principalMinor: profile.principal_minor,
        termMonths: profile.term_months,
        startDate: profile.start_date,
        cycles: rateCycles,
        terms: yearlyTerms,
      })
    : [];
  const projectedInterest = mortgageSchedule.reduce(
    (sum, row) => sum + row.interestMinor,
    0,
  );
  const adjustedMortgageSchedule = profile
    ? adjustMortgageScheduleForPayments({
        principalMinor: profile.principal_minor,
        schedule: mortgageSchedule,
        payments,
      })
    : [];
  const nextScheduledPayment = adjustedMortgageSchedule[payments.length];

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-5">
      <section className="relative grid gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#174f59] to-[#2d7f8c] p-5 text-white shadow-sm sm:p-7 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-sm font-medium text-white/70">ภาระทางการเงิน</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
            สินเชื่อบ้าน
          </h1>
          <p className="mt-2 text-sm text-white/80">
            ติดตามเงื่อนไขเงินกู้ ดอกเบี้ยรายปี และประวัติการชำระ
          </p>
        </div>
        <div>
          <HeaderHomeSwitcher
            action="/mortgage"
            label="บ้านของสินเชื่อ"
            homes={homes}
            homeId={home?.id}
          />
          {home ? (
            <MobileCreateTrigger
              dialogId="create-mortgage-dialog"
              label="เพิ่มข้อมูลสินเชื่อ"
            />
          ) : null}
        </div>
      </section>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f5f3] text-primary">
                  <TrendingDown className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">ยอดคงเหลือ</p>
                  <p className="mt-1 truncate text-lg font-semibold text-primary">
                    {formatMoney(outstanding, home?.default_currency)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff5d8] text-[#8a6920]">
                  <Landmark className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">ชำระแล้ว</p>
                  <p className="mt-1 truncate text-lg font-semibold text-[#705b2f]">
                    {formatMoney(totalPaid, home?.default_currency)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0ed] text-[#b84e40]">
                  <ReceiptText className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">การชำระ</p>
                  <p className="mt-1 text-lg font-semibold">
                    {payments.length} รายการ
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {profile ? (
            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="gap-4 border-b bg-gradient-to-r from-[#f1f8f7] to-white p-5">
                <div>
                  <CardTitle className="text-lg">
                    {profile.lender_name}
                  </CardTitle>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-secondary px-3 py-1 font-medium">
                      {formatMoney(
                        profile.principal_minor,
                        home?.default_currency,
                      )}
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-1">
                      {profile.term_months} เดือน
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-1">
                      เริ่ม {formatDate(profile.start_date)}
                    </span>
                  </div>
                  <CardDescription className="mt-3">
                    การคำนวณอิงจากข้อมูลที่คุณกรอกในหน้านี้เท่านั้น
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-start justify-between gap-3 bg-white p-5 sm:flex-row sm:items-center">
                <p className="text-sm text-muted-foreground">
                  {profile.notes || "ยังไม่มีรายละเอียดเพิ่มเติม"}
                </p>
                <div className="flex w-full shrink-0 justify-end gap-2 sm:w-auto">
                  <EditDialog
                    title="แก้ไขข้อมูลสินเชื่อ"
                    description={profile.lender_name}
                  >
                    <form
                      action={updateMortgageProfile}
                      className="grid gap-4 sm:grid-cols-2"
                    >
                      <input type="hidden" name="id" value={profile.id} />
                      <input
                        type="hidden"
                        name="home_id"
                        value={profile.home_id}
                      />
                      <div className="grid gap-2">
                        <Label htmlFor="mortgage-lender-name">
                          ธนาคาร/ผู้ให้กู้
                        </Label>
                        <input
                          id="mortgage-lender-name"
                          name="lender_name"
                          defaultValue={profile.lender_name}
                          required
                          className="h-10 rounded-md border bg-background px-3 text-sm"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="mortgage-principal">วงเงินกู้</Label>
                        <input
                          id="mortgage-principal"
                          name="principal"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={profile.principal_minor / 100}
                          required
                          className="h-10 rounded-md border bg-background px-3 text-sm"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="mortgage-term-months">
                          ระยะเวลากู้ (เดือน)
                        </Label>
                        <input
                          id="mortgage-term-months"
                          name="term_months"
                          type="number"
                          min="1"
                          defaultValue={profile.term_months}
                          required
                          className="h-10 rounded-md border bg-background px-3 text-sm"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="mortgage-start-date">
                          วันที่เริ่มสัญญา
                        </Label>
                        <DateInput
                          id="mortgage-start-date"
                          name="start_date"
                          defaultValue={profile.start_date}
                          required
                        />
                      </div>
                      <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="mortgage-notes">บันทึก</Label>
                        <textarea
                          id="mortgage-notes"
                          name="notes"
                          defaultValue={profile.notes ?? ""}
                          rows={3}
                          placeholder="รายละเอียดเพิ่มเติม"
                          className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="flex justify-end border-t pt-4 sm:col-span-2">
                        <Button type="submit" pendingText="กำลังบันทึก...">
                          {commonText.save}
                        </Button>
                      </div>
                    </form>
                  </EditDialog>
                  <form action={deleteMortgageProfile}>
                    <input type="hidden" name="id" value={profile.id} />
                    <input
                      type="hidden"
                      name="home_id"
                      value={profile.home_id}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      ลบสินเชื่อ
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  ยังไม่มีข้อมูลสินเชื่อ
                </CardTitle>
                <CardDescription>
                  เพิ่มเงื่อนไขเงินกู้เพื่อเริ่มติดตามการชำระ
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <details
            open
            className="group overflow-hidden rounded-lg bg-card text-card-foreground shadow-sm"
          >
            <summary className="cursor-pointer list-none border-b border-transparent bg-secondary/25 p-6 group-open:border-border [&::-webkit-details-marker]:hidden">
              <span className="block text-base font-semibold leading-none">
                เงื่อนไขรายปี
              </span>
              <span className="mt-1.5 block text-sm text-muted-foreground">
                แต่ละรอบเริ่มปี 1–3 ใหม่ ส่วนปี 4
                เป็นต้นไปไม่ต้องเลือกแนวทางเพิ่มเติม
              </span>
            </summary>
            <CardContent className="grid gap-3 p-5">
              {orderedYearlyTerms.length ? (
                orderedYearlyTerms.map((term) => {
                  const cycle = rateCycles.find(
                    (item) => item.id === term.mortgage_rate_cycle_id,
                  );
                  return (
                    <div
                      key={term.id}
                      className="rounded-xl border bg-white p-4 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                        <div className="min-w-0">
                          <p className="mb-1 text-xs font-medium text-muted-foreground">
                            รอบที่ {cycle?.cycle_number ?? 1} ·{" "}
                            {cycle?.lender_name ?? profile?.lender_name}
                            {cycle?.change_type === "refinance"
                              ? " · รีไฟแนนซ์"
                              : cycle?.change_type === "retention"
                                ? " · รีเทนชั่น"
                                : ""}
                          </p>
                          <p className="font-semibold">
                            {term.loan_year === 4
                              ? "ปีที่ 4 เป็นต้นไป"
                              : `ปีที่ ${term.loan_year}`}{" "}
                            · ดอกเบี้ย {term.annual_interest_rate}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {term.monthly_payment_minor == null
                              ? "ยังไม่ระบุยอดผ่อน"
                              : `${formatMoney(term.monthly_payment_minor, home?.default_currency)} / เดือน`}
                          </p>
                        </div>
                        <div className="flex w-full shrink-0 justify-end gap-2 sm:w-auto">
                          <EditDialog
                            title="แก้ไขเงื่อนไขรายปี"
                            description={
                              term.loan_year === 4
                                ? "ปีที่ 4 เป็นต้นไป"
                                : `ปีที่ ${term.loan_year}`
                            }
                          >
                            <form
                              action={updateMortgageYearlyTerm}
                              className="grid gap-4 sm:grid-cols-2"
                            >
                              <input type="hidden" name="id" value={term.id} />
                              <input
                                type="hidden"
                                name="home_id"
                                value={term.home_id}
                              />
                              <input
                                type="hidden"
                                name="loan_year"
                                value={term.loan_year}
                              />
                              <p className="flex h-10 items-center rounded-md bg-secondary px-3 text-sm font-medium">
                                {term.loan_year === 4
                                  ? "ปีที่ 4 เป็นต้นไป"
                                  : `ปีที่ ${term.loan_year}`}
                              </p>
                              <input
                                name="annual_interest_rate"
                                type="number"
                                step="0.001"
                                min="0"
                                defaultValue={term.annual_interest_rate}
                                required
                                aria-label="อัตราดอกเบี้ย"
                                className="h-10 rounded-md border bg-background px-3 text-sm"
                              />
                              <input
                                name="monthly_payment"
                                type="number"
                                step="0.01"
                                min="0.01"
                                defaultValue={
                                  (term.monthly_payment_minor ?? 0) / 100
                                }
                                required
                                aria-label="ยอดผ่อนต่อเดือน"
                                className="h-10 rounded-md border bg-background px-3 text-sm"
                              />
                              <textarea
                                name="notes"
                                defaultValue={term.notes ?? ""}
                                placeholder="บันทึก"
                                rows={3}
                                className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm sm:col-span-2"
                              />
                              <div className="flex justify-end border-t pt-4 sm:col-span-2">
                                <Button
                                  type="submit"
                                  pendingText="กำลังบันทึก..."
                                >
                                  {commonText.save}
                                </Button>
                              </div>
                            </form>
                          </EditDialog>
                          <form action={deleteMortgageYearlyTerm}>
                            <input type="hidden" name="id" value={term.id} />
                            <input
                              type="hidden"
                              name="home_id"
                              value={term.home_id}
                            />
                            <Button size="sm" variant="ghost">
                              {commonText.delete}
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีเงื่อนไขรายปี
                </p>
              )}
            </CardContent>
          </details>

          {mortgageSchedule.length ? (
            <details
              open
              className="group min-w-0 max-w-full overflow-hidden rounded-lg bg-card text-card-foreground shadow-sm"
            >
              <summary className="cursor-pointer list-none border-b border-transparent bg-secondary/25 p-6 group-open:border-border [&::-webkit-details-marker]:hidden">
                <span className="block text-base font-semibold leading-none">
                  ตารางประมาณการผ่อนชำระ
                </span>
                <span className="mt-1.5 block text-sm text-muted-foreground">
                  {mortgageSchedule.length} งวด · ดอกเบี้ยรวมประมาณ{" "}
                  {formatMoney(projectedInterest, home?.default_currency)} ·
                  งวดสุดท้าย{" "}
                  {formatDate(mortgageSchedule.at(-1)?.dueDate)}
                </span>
              </summary>
              <CardContent className="min-w-0 p-4 sm:p-5">
                <div className="max-h-[560px] w-full max-w-full overflow-y-auto rounded-lg bg-secondary/20 sm:overflow-auto sm:border sm:bg-transparent">
                  <div className="space-y-3 p-2 sm:hidden">
                    {adjustedMortgageSchedule.map((row) => (
                        <MortgageScheduleMobileCard
                          key={row.installment}
                          row={row}
                          today={today}
                          currency={home?.default_currency}
                        />
                    ))}
                  </div>
                  <table className="hidden w-full border-separate border-spacing-0 text-sm sm:table sm:min-w-[850px] sm:border-collapse">
                    <thead className="sticky top-0 z-10 hidden bg-[#eef6f5] text-left sm:table-header-group">
                      <tr>
                        <th className="px-3 py-3 font-semibold">งวด</th>
                        <th className="px-3 py-3 font-semibold">วันที่</th>
                        <th className="px-3 py-3 text-right font-semibold">
                          จ่ายจริง
                        </th>
                        <th className="px-3 py-3 text-right font-semibold">
                          ยอดโป๊ะ
                        </th>
                        <th className="px-3 py-3 text-right font-semibold">
                          ดอกเบี้ย
                        </th>
                        <th className="px-3 py-3 text-right font-semibold">
                          เงินต้น
                        </th>
                        <th className="px-3 py-3 text-right font-semibold">
                          คงเหลือเดิม
                        </th>
                        <th className="px-3 py-3 text-right font-semibold">
                          หลังโป๊ะ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="block space-y-3 p-2 sm:table-row-group sm:space-y-0 sm:divide-y sm:bg-white sm:p-0">
                      {adjustedMortgageSchedule.map((row) => {
                        const dueStatus = getMortgageDueRowStatus(
                          row.dueDate,
                          today,
                        );
                        return (
                          <tr
                            key={row.installment}
                            className={`grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border p-4 sm:table-row sm:rounded-none sm:border-0 sm:p-0 ${
                              dueStatus === "urgent"
                                ? "bg-red-100 hover:bg-red-100"
                                : dueStatus === "current-month"
                                  ? "bg-amber-100 hover:bg-amber-100"
                                  : "bg-white hover:bg-secondary/20"
                            }`}
                          >
                            <td className="min-w-0 sm:whitespace-nowrap sm:px-3 sm:py-3 sm:font-medium">
                              <span className="block text-[11px] text-muted-foreground sm:hidden">
                                งวด
                              </span>
                              <span className="mt-0.5 block font-semibold">
                                {row.installment}
                              </span>
                            </td>
                            <td className="min-w-0 text-right sm:whitespace-nowrap sm:px-3 sm:py-3 sm:text-left">
                              <span className="block text-[11px] text-muted-foreground sm:hidden">
                                วันที่
                              </span>
                              <span className="mt-0.5 block font-medium">
                                {formatDate(row.dueDate)}
                              </span>
                            </td>
                            <td className="min-w-0 tabular-nums sm:whitespace-nowrap sm:px-3 sm:py-3 sm:text-right">
                              <span className="block text-[11px] text-muted-foreground sm:hidden">
                                จ่ายจริง
                              </span>
                              <span className="mt-0.5 block font-medium">
                                {row.actualPaymentMinor == null
                                  ? "—"
                                  : formatMoney(
                                      row.actualPaymentMinor,
                                      home?.default_currency,
                                    )}
                              </span>
                            </td>
                            <td className="min-w-0 text-right tabular-nums sm:whitespace-nowrap sm:px-3 sm:py-3">
                              <span className="block text-[11px] text-muted-foreground sm:hidden">
                                ยอดโป๊ะ
                              </span>
                              <span className="mt-0.5 block font-medium text-[#b84e40]">
                                {row.extraPaymentMinor
                                  ? formatMoney(
                                      row.extraPaymentMinor,
                                      home?.default_currency,
                                    )
                                  : "—"}
                              </span>
                            </td>
                            <td className="min-w-0 tabular-nums sm:whitespace-nowrap sm:px-3 sm:py-3 sm:text-right">
                              <span className="block text-[11px] text-muted-foreground sm:hidden">
                                ดอกเบี้ย
                              </span>
                              <span className="mt-0.5 block font-medium text-[#9a6d10]">
                                {formatMoney(
                                  row.adjustedInterestMinor,
                                  home?.default_currency,
                                )}
                              </span>
                            </td>
                            <td className="min-w-0 text-right tabular-nums sm:whitespace-nowrap sm:px-3 sm:py-3">
                              <span className="block text-[11px] text-muted-foreground sm:hidden">
                                เงินต้น
                              </span>
                              <span className="mt-0.5 block font-medium text-primary">
                                {formatMoney(
                                  row.adjustedPrincipalMinor,
                                  home?.default_currency,
                                )}
                              </span>
                            </td>
                            <td className="min-w-0 tabular-nums sm:whitespace-nowrap sm:px-3 sm:py-3 sm:text-right">
                              <span className="block text-[11px] text-muted-foreground sm:hidden">
                                คงเหลือเดิม
                              </span>
                              <span className="mt-0.5 block font-medium">
                                {formatMoney(
                                  row.balanceMinor,
                                  home?.default_currency,
                                )}
                              </span>
                            </td>
                            <td className="min-w-0 text-right tabular-nums sm:whitespace-nowrap sm:px-3 sm:py-3">
                              <span className="block text-[11px] text-muted-foreground sm:hidden">
                                หลังโป๊ะ
                              </span>
                              <span className="mt-0.5 block font-semibold text-primary">
                                {formatMoney(
                                  row.adjustedBalanceMinor,
                                  home?.default_currency,
                                )}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  เป็นการประมาณการแบบลดต้นลดดอกจากเงื่อนไขที่กรอก
                  ไม่ใช่ยอดชำระจริงจากธนาคาร
                </p>
              </CardContent>
            </details>
          ) : null}

          <details
            open
            className="group overflow-hidden rounded-lg bg-card text-card-foreground shadow-sm"
          >
            <summary className="cursor-pointer list-none border-b border-transparent bg-secondary/25 p-6 group-open:border-border [&::-webkit-details-marker]:hidden">
              <span className="block text-base font-semibold leading-none">
                ประวัติการชำระ
              </span>
              <span className="mt-1.5 block text-sm text-muted-foreground">
                เงินต้นและดอกเบี้ยเป็นข้อมูลที่กรอกเองได้
              </span>
            </summary>
            <CardContent className="grid gap-3 p-5">
              {payments.length ? (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-xl border bg-white p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          {formatDate(payment.payment_date)}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-primary">
                          {formatMoney(
                            payment.amount_minor,
                            home?.default_currency,
                          )}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="rounded-full bg-secondary px-2.5 py-1">
                            เงินต้น{" "}
                            {formatMoney(
                              payment.principal_minor ?? 0,
                              home?.default_currency,
                            )}
                          </span>
                          <span className="rounded-full bg-secondary px-2.5 py-1">
                            ดอกเบี้ย{" "}
                            {formatMoney(
                              payment.interest_minor ?? 0,
                              home?.default_currency,
                            )}
                          </span>
                        </div>
                        {payment.notes ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {payment.notes}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex w-full shrink-0 justify-end gap-2 sm:w-auto">
                        <EditDialog
                          title="แก้ไขรายการชำระ"
                          description={formatDate(payment.payment_date)}
                        >
                          <form
                            action={updateMortgagePayment}
                            className="grid gap-4 sm:grid-cols-2"
                          >
                          <input type="hidden" name="id" value={payment.id} />
                          <input
                            type="hidden"
                            name="home_id"
                            value={payment.home_id}
                          />
                          <DateInput
                            name="payment_date"
                            defaultValue={payment.payment_date}
                            required
                          />
                          <input
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={payment.amount_minor / 100}
                            required
                            className="h-10 rounded-md border bg-background px-3 text-sm"
                          />
                          <input
                            name="principal"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={(payment.principal_minor ?? 0) / 100}
                            className="h-10 rounded-md border bg-background px-3 text-sm"
                          />
                          <input
                            name="interest"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={(payment.interest_minor ?? 0) / 100}
                            className="h-10 rounded-md border bg-background px-3 text-sm"
                          />
                          <textarea
                            name="notes"
                            defaultValue={payment.notes ?? ""}
                            placeholder="บันทึก"
                            rows={3}
                            className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm sm:col-span-2"
                          />
                          <div className="flex justify-end border-t pt-4 sm:col-span-2">
                            <Button
                              type="submit"
                              pendingText="กำลังบันทึก..."
                            >
                              {commonText.save}
                            </Button>
                          </div>
                          </form>
                        </EditDialog>
                        <form action={deleteMortgagePayment}>
                          <input type="hidden" name="id" value={payment.id} />
                          <input
                            type="hidden"
                            name="home_id"
                            value={payment.home_id}
                          />
                          <Button size="sm" variant="ghost">
                            {commonText.delete}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีรายการชำระ
                </p>
              )}
            </CardContent>
          </details>
        </section>

        <ResponsiveCreatePanel
          dialogId="create-mortgage-dialog"
          title="เพิ่มข้อมูลสินเชื่อ"
        >
          <aside className="space-y-4 lg:sticky lg:top-20">
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">เพิ่มสินเชื่อบ้าน</CardTitle>
                <CardDescription>
                  สำหรับ MVP นี้ บ้านหนึ่งหลังมีข้อมูลสินเชื่อหนึ่งชุดก็เพียงพอ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {home && !profile ? (
                  <form action={createMortgageProfile} className="grid gap-3">
                    <input type="hidden" name="home_id" value={home.id} />
                    <input
                      name="lender_name"
                      placeholder="ธนาคาร/ผู้ให้กู้"
                      required
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    />
                    <input
                      name="principal"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="เงินต้น"
                      required
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    />
                    <input
                      name="term_months"
                      type="number"
                      min="1"
                      placeholder="จำนวนเดือน"
                      required
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    />
                    <DateInput name="start_date" required />
                    <textarea
                      name="notes"
                      placeholder="บันทึก"
                      rows={3}
                      className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm"
                    />
                    <Button type="submit">เพิ่มสินเชื่อ</Button>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile
                      ? "ลบข้อมูลสินเชื่อปัจจุบันก่อนเพิ่มชุดใหม่"
                      : "สร้างบ้านก่อนเพิ่มสินเชื่อ"}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  {showInitialRatePlan
                    ? "ตั้งค่ารอบแรก"
                    : "เพิ่มอัตราดอกเบี้ยในรอบปัจจุบัน"}
                </CardTitle>
                <CardDescription>
                  {showInitialRatePlan
                    ? "กรอกปี 1–3 และอัตราตั้งแต่ปี 4 ของสินเชื่อเดิม"
                    : `รอบที่ ${activeCycle?.cycle_number ?? 1} · ${activeCycle?.lender_name ?? profile?.lender_name ?? "ยังไม่มีธนาคาร"}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {home && profile && showInitialRatePlan ? (
                  <form
                    action={createInitialMortgageRatePlan}
                    className="grid gap-4"
                  >
                    <input type="hidden" name="home_id" value={home.id} />
                    <input
                      type="hidden"
                      name="mortgage_profile_id"
                      value={profile.id}
                    />
                    {[1, 2, 3, 4].map((year) => (
                      <div
                        key={year}
                        className="grid gap-2 rounded-md border p-3"
                      >
                        <p className="text-sm font-semibold">
                          {year === 4 ? "ปีที่ 4 เป็นต้นไป" : `ปีที่ ${year}`}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            name={`annual_interest_rate_${year}`}
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="ดอกเบี้ย %"
                            required
                            aria-label={`ดอกเบี้ยปีที่ ${year}`}
                            className="h-10 min-w-0 rounded-md border bg-background px-3 text-sm"
                          />
                          <input
                            name={`monthly_payment_${year}`}
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="ยอดผ่อน/เดือน"
                            required
                            aria-label={`ยอดผ่อนปีที่ ${year}`}
                            className="h-10 min-w-0 rounded-md border bg-background px-3 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                    <Button type="submit">บันทึกรอบแรก</Button>
                  </form>
                ) : home &&
                  profile &&
                  activeCycle &&
                  availableRateYears.length ? (
                  <form
                    action={createMortgageYearlyTerm}
                    className="grid gap-3"
                  >
                    <input type="hidden" name="home_id" value={home.id} />
                    <input
                      type="hidden"
                      name="mortgage_profile_id"
                      value={profile.id}
                    />
                    <input
                      type="hidden"
                      name="mortgage_rate_cycle_id"
                      value={activeCycle.id}
                    />
                    <select
                      name="loan_year"
                      required
                      aria-label="ปีของรอบดอกเบี้ย"
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    >
                      {availableRateYears.map((year) => (
                        <option key={year} value={year}>
                          {year === 4 ? "ปีที่ 4 เป็นต้นไป" : `ปีที่ ${year}`}
                        </option>
                      ))}
                    </select>
                    <input
                      name="annual_interest_rate"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="ดอกเบี้ยต่อปี %"
                      required
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    />
                    <input
                      name="monthly_payment"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="ยอดผ่อนต่อเดือน"
                      required
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    />
                    <textarea
                      name="notes"
                      placeholder="บันทึกเงื่อนไข"
                      rows={3}
                      className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm"
                    />
                    <Button type="submit">เพิ่มอัตราดอกเบี้ย</Button>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {availableRateYears.length
                      ? "เพิ่มข้อมูลสินเชื่อก่อน"
                      : "บันทึกอัตราของรอบนี้ครบแล้ว"}
                  </p>
                )}
              </CardContent>
            </Card>

            {!showInitialRatePlan ? (
              <details
                open
                className="group overflow-hidden rounded-lg bg-white shadow-sm"
              >
                <summary className="cursor-pointer list-none border-b border-transparent p-6 group-open:border-border [&::-webkit-details-marker]:hidden">
                  <span className="block text-base font-semibold leading-none">
                    เริ่มรอบดอกเบี้ยใหม่
                  </span>
                  <span className="mt-1.5 block text-sm text-muted-foreground">
                    ใช้เฉพาะเมื่อรีไฟแนนซ์หรือขอรีเทนชั่น
                    ไม่จำเป็นต้องเลือกหากใช้สัญญาเดิมต่อ
                  </span>
                </summary>
                <CardContent className="pt-5">
                  {home && profile ? (
                    <form
                      action={createMortgageRateCycle}
                      className="grid gap-3"
                    >
                      <input type="hidden" name="home_id" value={home.id} />
                      <input
                        type="hidden"
                        name="mortgage_profile_id"
                        value={profile.id}
                      />
                      <select
                        name="change_type"
                        required
                        defaultValue=""
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                      >
                        <option value="" disabled>
                          เลือกวิธีปรับสัญญา
                        </option>
                        <option value="refinance">รีไฟแนนซ์</option>
                        <option value="retention">รีเทนชั่น</option>
                      </select>
                      <input
                        name="lender_name"
                        defaultValue={
                          activeCycle?.lender_name ?? profile.lender_name
                        }
                        placeholder="ธนาคารรอบใหม่"
                        required
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                      />
                      <DateInput
                        name="start_date"
                        required
                        aria-label="วันที่เริ่มรอบใหม่"
                      />
                      <input
                        name="annual_interest_rate"
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="ดอกเบี้ยปีที่ 1 %"
                        required
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                      />
                      <input
                        name="monthly_payment"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="ยอดผ่อนต่อเดือนปีที่ 1"
                        required
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                      />
                      <textarea
                        name="notes"
                        placeholder="บันทึกเงื่อนไขรอบใหม่"
                        rows={3}
                        className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm"
                      />
                      <Button type="submit">เริ่มรอบใหม่</Button>
                    </form>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      เพิ่มข้อมูลสินเชื่อก่อน
                    </p>
                  )}
                </CardContent>
              </details>
            ) : null}

            <details
              open
              className="group overflow-hidden rounded-lg bg-white shadow-sm"
            >
              <summary className="cursor-pointer list-none border-b border-transparent p-6 group-open:border-border [&::-webkit-details-marker]:hidden">
                <span className="block text-base font-semibold leading-none">
                  เพิ่มรายการชำระ
                </span>
                <span className="mt-1.5 block text-sm text-muted-foreground">
                  ระบบใส่ยอดประมาณการของงวดถัดไปให้
                  และแก้เป็นยอดจริงจากธนาคารได้
                </span>
              </summary>
              <CardContent className="pt-5">
                {home && profile ? (
                  <CreateMortgagePaymentForm
                    homeId={home.id}
                    profileId={profile.id}
                    currency={home.default_currency}
                    suggestion={nextScheduledPayment}
                    futureSchedule={adjustedMortgageSchedule
                      .slice(payments.length + 1)
                      .map((row) => ({
                        annualInterestRate: row.annualInterestRate,
                        paymentMinor: row.paymentMinor,
                      }))}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    เพิ่มข้อมูลสินเชื่อก่อน
                  </p>
                )}
              </CardContent>
            </details>
          </aside>
        </ResponsiveCreatePanel>
      </div>
    </div>
  );
}
