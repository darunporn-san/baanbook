import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listHomes } from "@/features/homes/queries";
import {
  createMortgagePayment,
  createMortgageProfile,
  deleteMortgagePayment,
  deleteMortgageProfile,
  updateMortgagePayment,
  updateMortgageProfile,
} from "@/features/mortgage/actions";
import { listMortgagePayments, listMortgageProfiles } from "@/features/mortgage/queries";
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
  const principalPaid = payments.reduce((sum, item) => sum + (item.principal_minor ?? 0), 0);
  const totalPaid = payments.reduce((sum, item) => sum + item.amount_minor, 0);
  const outstanding = profile ? Math.max(0, profile.principal_minor - principalPaid) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-4">
        <div className="rounded-lg bg-[#246a78] p-5 text-white shadow-sm">
          <h1 className="text-2xl font-semibold">สินเชื่อบ้าน</h1>
          <p className="mt-1 text-sm text-white/80">ติดตามเงื่อนไขเงินกู้และประวัติการชำระจากข้อมูลที่คุณบันทึกเอง</p>
        </div>
        <form action="/mortgage" className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <label htmlFor="mortgage-home" className="text-sm font-medium">บ้านของสินเชื่อ</label>
            <select id="mortgage-home" name="homeId" defaultValue={home?.id} className="flex h-10 w-full min-w-64 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {homes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <Button type="submit">ดูข้อมูล</Button>
        </form>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-0 bg-[#00bfa5] text-white shadow-sm"><CardHeader><CardTitle className="text-sm uppercase tracking-normal">ยอดคงเหลือ</CardTitle><CardDescription className="text-white/80">{formatMoney(outstanding, home?.default_currency)}</CardDescription></CardHeader></Card>
          <Card className="border-0 bg-[#ffd36a] text-[#514227] shadow-sm"><CardHeader><CardTitle className="text-sm uppercase tracking-normal">ชำระแล้ว</CardTitle><CardDescription className="text-[#705b2f]">{formatMoney(totalPaid, home?.default_currency)}</CardDescription></CardHeader></Card>
          <Card className="border-0 bg-white shadow-sm"><CardHeader><CardTitle className="text-sm uppercase tracking-normal text-muted-foreground">การชำระ</CardTitle><CardDescription>{payments.length} รายการ</CardDescription></CardHeader></Card>
        </div>

        {profile ? (
          <Card className="border-0 shadow-sm">
            <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-base">{profile.lender_name}</CardTitle>
                <CardDescription>
                  {formatMoney(profile.principal_minor, home?.default_currency)} · {profile.annual_interest_rate}% · {profile.term_months} เดือน · {formatDate(profile.start_date)}
                </CardDescription>
                <CardDescription>การคำนวณอิงจากข้อมูลที่คุณกรอกในหน้านี้เท่านั้น</CardDescription>
              </div>
              <form action={deleteMortgageProfile}>
                <input type="hidden" name="id" value={profile.id} />
                <input type="hidden" name="home_id" value={profile.home_id} />
                <Button size="sm" variant="ghost">{commonText.delete}</Button>
              </form>
            </CardHeader>
            <CardContent>
              <details>
                <summary className="cursor-pointer text-sm font-medium text-primary">{commonText.edit}</summary>
                <form action={updateMortgageProfile} className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="id" value={profile.id} />
                  <input type="hidden" name="home_id" value={profile.home_id} />
                  <input name="lender_name" defaultValue={profile.lender_name} required className="h-10 rounded-md border bg-background px-3 text-sm" />
                  <input name="principal" type="number" step="0.01" min="0" defaultValue={profile.principal_minor / 100} required className="h-10 rounded-md border bg-background px-3 text-sm" />
                  <input name="annual_interest_rate" type="number" step="0.001" min="0" defaultValue={profile.annual_interest_rate} className="h-10 rounded-md border bg-background px-3 text-sm" />
                  <input name="term_months" type="number" min="1" defaultValue={profile.term_months} required className="h-10 rounded-md border bg-background px-3 text-sm" />
                  <input name="start_date" type="date" defaultValue={profile.start_date} required className="h-10 rounded-md border bg-background px-3 text-sm" />
                  <input name="monthly_payment" type="number" step="0.01" min="0" defaultValue={(profile.monthly_payment_minor ?? 0) / 100} className="h-10 rounded-md border bg-background px-3 text-sm" />
                  <input name="notes" defaultValue={profile.notes ?? ""} placeholder="บันทึก" className="h-10 rounded-md border bg-background px-3 text-sm" />
                  <Button type="submit" size="sm">{commonText.save}</Button>
                </form>
              </details>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base">ยังไม่มีข้อมูลสินเชื่อ</CardTitle><CardDescription>เพิ่มเงื่อนไขเงินกู้เพื่อเริ่มติดตามการชำระ</CardDescription></CardHeader></Card>
        )}

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">ประวัติการชำระ</CardTitle><CardDescription>เงินต้นและดอกเบี้ยเป็นข้อมูลที่กรอกเองได้</CardDescription></CardHeader>
          <CardContent className="grid gap-3">
            {payments.length ? payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div className="flex-1">
                  <p className="font-medium">{formatMoney(payment.amount_minor, home?.default_currency)}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(payment.payment_date)} · เงินต้น {formatMoney(payment.principal_minor ?? 0, home?.default_currency)} · ดอกเบี้ย {formatMoney(payment.interest_minor ?? 0, home?.default_currency)}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-primary">{commonText.edit}</summary>
                    <form action={updateMortgagePayment} className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input type="hidden" name="id" value={payment.id} />
                      <input type="hidden" name="home_id" value={payment.home_id} />
                      <input name="payment_date" type="date" defaultValue={payment.payment_date} required className="h-10 rounded-md border bg-background px-3 text-sm" />
                      <input name="amount" type="number" step="0.01" min="0" defaultValue={payment.amount_minor / 100} required className="h-10 rounded-md border bg-background px-3 text-sm" />
                      <input name="principal" type="number" step="0.01" min="0" defaultValue={(payment.principal_minor ?? 0) / 100} className="h-10 rounded-md border bg-background px-3 text-sm" />
                      <input name="interest" type="number" step="0.01" min="0" defaultValue={(payment.interest_minor ?? 0) / 100} className="h-10 rounded-md border bg-background px-3 text-sm" />
                      <input name="notes" defaultValue={payment.notes ?? ""} placeholder="บันทึก" className="h-10 rounded-md border bg-background px-3 text-sm" />
                      <Button type="submit" size="sm">{commonText.save}</Button>
                    </form>
                  </details>
                </div>
                <form action={deleteMortgagePayment}>
                  <input type="hidden" name="id" value={payment.id} />
                  <input type="hidden" name="home_id" value={payment.home_id} />
                  <Button size="sm" variant="ghost">{commonText.delete}</Button>
                </form>
              </div>
            )) : <p className="text-sm text-muted-foreground">ยังไม่มีรายการชำระ</p>}
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader><CardTitle className="text-base">เพิ่มสินเชื่อบ้าน</CardTitle><CardDescription>สำหรับ MVP นี้ บ้านหนึ่งหลังมีข้อมูลสินเชื่อหนึ่งชุดก็เพียงพอ</CardDescription></CardHeader>
          <CardContent>
            {home && !profile ? (
              <form action={createMortgageProfile} className="grid gap-3">
                <input type="hidden" name="home_id" value={home.id} />
                <input name="lender_name" placeholder="ธนาคาร/ผู้ให้กู้" required className="h-10 rounded-md border bg-background px-3 text-sm" />
                <input name="principal" type="number" step="0.01" min="0" placeholder="เงินต้น" required className="h-10 rounded-md border bg-background px-3 text-sm" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input name="annual_interest_rate" type="number" step="0.001" min="0" placeholder="ดอกเบี้ย %" className="h-10 rounded-md border bg-background px-3 text-sm" />
                  <input name="term_months" type="number" min="1" placeholder="จำนวนเดือน" required className="h-10 rounded-md border bg-background px-3 text-sm" />
                </div>
                <input name="start_date" type="date" required className="h-10 rounded-md border bg-background px-3 text-sm" />
                <input name="monthly_payment" type="number" step="0.01" min="0" placeholder="ยอดผ่อนต่อเดือน" className="h-10 rounded-md border bg-background px-3 text-sm" />
                <input name="notes" placeholder="บันทึก" className="h-10 rounded-md border bg-background px-3 text-sm" />
                <Button type="submit">เพิ่มสินเชื่อ</Button>
              </form>
            ) : <p className="text-sm text-muted-foreground">{profile ? "ลบข้อมูลสินเชื่อปัจจุบันก่อนเพิ่มชุดใหม่" : "สร้างบ้านก่อนเพิ่มสินเชื่อ"}</p>}
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm">
          <CardHeader><CardTitle className="text-base">เพิ่มรายการชำระ</CardTitle><CardDescription>แยกเงินต้นและดอกเบี้ยเองเพื่อให้การคำนวณโปร่งใส</CardDescription></CardHeader>
          <CardContent>
            {home && profile ? (
              <form action={createMortgagePayment} className="grid gap-3">
                <input type="hidden" name="home_id" value={home.id} />
                <input type="hidden" name="mortgage_profile_id" value={profile.id} />
                <input name="payment_date" type="date" required className="h-10 rounded-md border bg-background px-3 text-sm" />
                <input name="amount" type="number" step="0.01" min="0" placeholder="ยอดชำระ" required className="h-10 rounded-md border bg-background px-3 text-sm" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input name="principal" type="number" step="0.01" min="0" placeholder="เงินต้น" className="h-10 rounded-md border bg-background px-3 text-sm" />
                  <input name="interest" type="number" step="0.01" min="0" placeholder="ดอกเบี้ย" className="h-10 rounded-md border bg-background px-3 text-sm" />
                </div>
                <input name="notes" placeholder="บันทึก" className="h-10 rounded-md border bg-background px-3 text-sm" />
                <Button type="submit">เพิ่มรายการชำระ</Button>
              </form>
            ) : <p className="text-sm text-muted-foreground">เพิ่มข้อมูลสินเชื่อก่อน</p>}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
