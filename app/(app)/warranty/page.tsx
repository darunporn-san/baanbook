import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listAppliances } from "@/features/appliances/queries";
import { listHomes } from "@/features/homes/queries";
import { formatDate } from "@/lib/format";
import { getWarrantyDaysLeft } from "@/lib/warranty";

export default async function WarrantyPage({
  searchParams,
}: {
  searchParams?: Promise<{ homeId?: string }>;
}) {
  const homes = await listHomes();
  const params = await searchParams;
  const home = homes.find((item) => item.id === params?.homeId) ?? homes[0];
  const appliances = (await listAppliances(home?.id)).filter(
    (item) => item.warranty_end_date || item.warranty_lifetime,
  );
  const warranties = appliances.map((item) => ({
    ...item,
    daysLeft: item.warranty_lifetime
      ? null
      : getWarrantyDaysLeft(item.warranty_end_date ?? ""),
  }));
  const expiringSoon = warranties.filter(
    (item) =>
      item.daysLeft !== null && item.daysLeft >= 0 && item.daysLeft <= 30,
  );
  const expired = warranties.filter(
    (item) => item.daysLeft !== null && item.daysLeft < 0,
  );
  const active = warranties.filter(
    (item) => item.daysLeft === null || item.daysLeft > 30,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-xl bg-[#ffd36a] p-5 text-[#514227] shadow-sm sm:p-6">
        <p className="text-sm font-medium text-[#705b2f]">
          การคุ้มครองทรัพย์สิน
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">ประกัน</h1>
        <p className="mt-2 text-sm text-[#705b2f]">
          ติดตามวันหมดประกันเครื่องใช้ไฟฟ้าแยกตามบ้าน
        </p>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">รายการประกัน</CardTitle>
            <CardDescription>
              {home
                ? `${warranties.length} รายการจาก ${home.name}`
                : "สร้างบ้านก่อนติดตามประกัน"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {warranties.length ? (
              warranties.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[
                        item.brand,
                        item.model,
                        item.warranty_lifetime
                          ? "ประกันตลอดชีพ"
                          : `หมดอายุ ${formatDate(item.warranty_end_date)}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      item.daysLeft === null
                        ? "bg-[#e8f5f3] text-primary"
                        : item.daysLeft < 0
                        ? "bg-[#fff0ed] text-[#b84e40]"
                        : item.daysLeft <= 30
                          ? "bg-[#fff5d8] text-[#705b2f]"
                          : "bg-[#e8f5f3] text-primary"
                    }`}
                  >
                    {item.daysLeft === null
                      ? "ตลอดชีพ"
                      : item.daysLeft < 0
                      ? `หมดอายุแล้ว ${Math.abs(item.daysLeft)} วัน`
                      : `เหลือ ${item.daysLeft} วัน`}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                ยังไม่มีประกันเครื่องใช้ไฟฟ้า
              </div>
            )}
          </CardContent>
        </Card>

        <aside className="order-first space-y-4 lg:order-last lg:sticky lg:top-20">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">เลือกบ้าน</CardTitle>
              <CardDescription>ดูประกันเฉพาะบ้านที่เลือก</CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/warranty" className="grid gap-3">
                <select
                  id="warranty-home"
                  name="homeId"
                  defaultValue={home?.id}
                  aria-label="บ้านของประกัน"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {homes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <Button type="submit">ดูข้อมูล</Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            {[
              ["ใกล้หมด", expiringSoon.length, "bg-[#fff5d8] text-[#705b2f]"],
              ["ยังใช้ได้", active.length, "bg-[#e8f5f3] text-primary"],
              ["หมดอายุ", expired.length, "bg-[#fff0ed] text-[#b84e40]"],
            ].map(([label, count, tone]) => (
              <div key={String(label)} className={`rounded-lg p-3 ${tone}`}>
                <p className="text-xs opacity-75">{label}</p>
                <p className="mt-1 text-xl font-semibold">{count}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
