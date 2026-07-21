import { Button } from "@/components/ui/button";
import { HeaderHomeSwitcher } from "@/components/home/header-home-switcher";
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
  createMortgagePayment,
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

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="grid gap-5 rounded-xl bg-[#246a78] p-5 text-white shadow-sm sm:p-6 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-sm font-medium text-white/70">ภาระทางการเงิน</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
            สินเชื่อบ้าน
          </h1>
          <p className="mt-2 text-sm text-white/80">
            ติดตามเงื่อนไขเงินกู้ ดอกเบี้ยรายปี และประวัติการชำระ
          </p>
        </div>
        <HeaderHomeSwitcher
          action="/mortgage"
          label="บ้านของสินเชื่อ"
          homes={homes}
          homeId={home?.id}
        />
      </section>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-0 bg-[#00bfa5] text-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-normal">
                  ยอดคงเหลือ
                </CardTitle>
                <CardDescription className="text-white/80">
                  {formatMoney(outstanding, home?.default_currency)}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-[#ffd36a] text-[#514227] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-normal">
                  ชำระแล้ว
                </CardTitle>
                <CardDescription className="text-[#705b2f]">
                  {formatMoney(totalPaid, home?.default_currency)}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-normal text-muted-foreground">
                  การชำระ
                </CardTitle>
                <CardDescription>{payments.length} รายการ</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {profile ? (
            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="gap-4 border-b bg-white p-5 sm:flex-row sm:items-start sm:justify-between">
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
                <form action={deleteMortgageProfile}>
                  <input type="hidden" name="id" value={profile.id} />
                  <input type="hidden" name="home_id" value={profile.home_id} />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    ลบสินเชื่อ
                  </Button>
                </form>
              </CardHeader>
              <CardContent className="bg-white p-5">
                <details>
                  <summary className="inline-flex h-9 cursor-pointer items-center rounded-md border border-input bg-background px-3 text-sm font-medium text-primary hover:bg-secondary">
                    แก้ไขข้อมูลสินเชื่อ
                  </summary>
                  <form
                    action={updateMortgageProfile}
                    className="mt-4 grid gap-4 rounded-lg border bg-secondary/20 p-4 sm:grid-cols-2"
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
                      <input
                        id="mortgage-start-date"
                        name="start_date"
                        type="date"
                        defaultValue={profile.start_date}
                        required
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                      />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                      <Label htmlFor="mortgage-notes">บันทึก</Label>
                      <input
                        id="mortgage-notes"
                        name="notes"
                        defaultValue={profile.notes ?? ""}
                        placeholder="รายละเอียดเพิ่มเติม"
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                      />
                    </div>
                    <div className="flex justify-end border-t pt-4 sm:col-span-2">
                      <Button type="submit">{commonText.save}</Button>
                    </div>
                  </form>
                </details>
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

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">เงื่อนไขรายปี</CardTitle>
              <CardDescription>
                แต่ละรอบเริ่มปี 1–3 ใหม่ ส่วนปี 4
                เป็นต้นไปไม่ต้องเลือกแนวทางเพิ่มเติม
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {orderedYearlyTerms.length ? (
                orderedYearlyTerms.map((term) => {
                  const cycle = rateCycles.find(
                    (item) => item.id === term.mortgage_rate_cycle_id,
                  );
                  return (
                    <div key={term.id} className="rounded-md border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="mb-1 text-xs font-medium text-muted-foreground">
                            รอบที่ {cycle?.cycle_number ?? 1} ·{" "}
                            {cycle?.lender_name ?? profile?.lender_name}
                            {cycle?.change_type === "refinance"
                              ? " · รีไฟแนนซ์"
                              : cycle?.change_type === "retention"
                                ? " · รีเทนชั่น"
                                : ""}
                          </p>
                          <p className="font-medium">
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
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium text-primary">
                          {commonText.edit}
                        </summary>
                        <form
                          action={updateMortgageYearlyTerm}
                          className="mt-3 grid gap-3 sm:grid-cols-2"
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
                          <input
                            name="notes"
                            defaultValue={term.notes ?? ""}
                            placeholder="บันทึก"
                            className="h-10 rounded-md border bg-background px-3 text-sm"
                          />
                          <Button type="submit" size="sm">
                            {commonText.save}
                          </Button>
                        </form>
                      </details>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีเงื่อนไขรายปี
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">ประวัติการชำระ</CardTitle>
              <CardDescription>
                เงินต้นและดอกเบี้ยเป็นข้อมูลที่กรอกเองได้
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {payments.length ? (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {formatMoney(
                          payment.amount_minor,
                          home?.default_currency,
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.payment_date)} · เงินต้น{" "}
                        {formatMoney(
                          payment.principal_minor ?? 0,
                          home?.default_currency,
                        )}{" "}
                        · ดอกเบี้ย{" "}
                        {formatMoney(
                          payment.interest_minor ?? 0,
                          home?.default_currency,
                        )}
                      </p>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium text-primary">
                          {commonText.edit}
                        </summary>
                        <form
                          action={updateMortgagePayment}
                          className="mt-3 grid gap-3 sm:grid-cols-2"
                        >
                          <input type="hidden" name="id" value={payment.id} />
                          <input
                            type="hidden"
                            name="home_id"
                            value={payment.home_id}
                          />
                          <input
                            name="payment_date"
                            type="date"
                            defaultValue={payment.payment_date}
                            required
                            className="h-10 rounded-md border bg-background px-3 text-sm"
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
                          <input
                            name="notes"
                            defaultValue={payment.notes ?? ""}
                            placeholder="บันทึก"
                            className="h-10 rounded-md border bg-background px-3 text-sm"
                          />
                          <Button type="submit" size="sm">
                            {commonText.save}
                          </Button>
                        </form>
                      </details>
                    </div>
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีรายการชำระ
                </p>
              )}
            </CardContent>
          </Card>
        </section>

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
                  <input
                    name="start_date"
                    type="date"
                    required
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                  />
                  <input
                    name="notes"
                    placeholder="บันทึก"
                    className="h-10 rounded-md border bg-background px-3 text-sm"
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
                <form action={createMortgageYearlyTerm} className="grid gap-3">
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
                  <input
                    name="notes"
                    placeholder="บันทึกเงื่อนไข"
                    className="h-10 rounded-md border bg-background px-3 text-sm"
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
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  เริ่มรอบดอกเบี้ยใหม่
                </CardTitle>
                <CardDescription>
                  ใช้เฉพาะเมื่อรีไฟแนนซ์หรือขอรีเทนชั่น
                  ไม่จำเป็นต้องเลือกหากใช้สัญญาเดิมต่อ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {home && profile ? (
                  <form action={createMortgageRateCycle} className="grid gap-3">
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
                    <input
                      name="start_date"
                      type="date"
                      required
                      aria-label="วันที่เริ่มรอบใหม่"
                      className="h-10 rounded-md border bg-background px-3 text-sm"
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
                    <input
                      name="notes"
                      placeholder="บันทึกเงื่อนไขรอบใหม่"
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    />
                    <Button type="submit">เริ่มรอบใหม่</Button>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    เพิ่มข้อมูลสินเชื่อก่อน
                  </p>
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">เพิ่มรายการชำระ</CardTitle>
              <CardDescription>
                แยกเงินต้นและดอกเบี้ยเองเพื่อให้การคำนวณโปร่งใส
              </CardDescription>
            </CardHeader>
            <CardContent>
              {home && profile ? (
                <form action={createMortgagePayment} className="grid gap-3">
                  <input type="hidden" name="home_id" value={home.id} />
                  <input
                    type="hidden"
                    name="mortgage_profile_id"
                    value={profile.id}
                  />
                  <input
                    name="payment_date"
                    type="date"
                    required
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                  />
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="ยอดชำระ"
                    required
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      name="principal"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="เงินต้น"
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    />
                    <input
                      name="interest"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="ดอกเบี้ย"
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    />
                  </div>
                  <input
                    name="notes"
                    placeholder="บันทึก"
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                  />
                  <Button type="submit">เพิ่มรายการชำระ</Button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  เพิ่มข้อมูลสินเชื่อก่อน
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
