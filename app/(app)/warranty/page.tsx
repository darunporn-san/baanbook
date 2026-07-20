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

function daysUntil(date: string) {
  const today = new Date();
  const end = new Date(`${date}T00:00:00`);
  return Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
}

export default async function WarrantyPage({
  searchParams,
}: {
  searchParams?: Promise<{ homeId?: string }>;
}) {
  const homes = await listHomes();
  const params = await searchParams;
  const home = homes.find((item) => item.id === params?.homeId) ?? homes[0];
  const appliances = (await listAppliances(home?.id)).filter((item) => item.warranty_end_date);
  const warranties = appliances.map((item) => ({
    ...item,
    daysLeft: daysUntil(item.warranty_end_date ?? ""),
  }));
  const expiringSoon = warranties.filter((item) => item.daysLeft >= 0 && item.daysLeft <= 30);
  const expired = warranties.filter((item) => item.daysLeft < 0);
  const active = warranties.filter((item) => item.daysLeft > 30);

  return (
    <div className="max-w-5xl space-y-4">
      <div className="rounded-lg bg-[#ffd36a] p-5 text-[#514227] shadow-sm">
        <h1 className="text-2xl font-semibold">ประกัน</h1>
        <p className="mt-1 text-sm text-[#705b2f]">ติดตามประกันเครื่องใช้ไฟฟ้าตามบ้าน</p>
      </div>
      <form
        action="/warranty"
        className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="space-y-2">
          <label htmlFor="warranty-home" className="text-sm font-medium">บ้านของประกัน</label>
          <select
            id="warranty-home"
            name="homeId"
            defaultValue={home?.id}
            className="flex h-10 w-full min-w-64 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {homes.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        <Button type="submit">ดูข้อมูล</Button>
      </form>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-0 bg-[#ff806f] text-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-normal">ใกล้หมดอายุ</CardTitle>
            <CardDescription className="text-white/80">{expiringSoon.length} รายการใน 30 วัน</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-0 bg-[#00bfa5] text-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-normal">ยังใช้งานได้</CardTitle>
            <CardDescription className="text-white/80">{active.length} รายการ</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-normal text-muted-foreground">หมดอายุแล้ว</CardTitle>
            <CardDescription>{expired.length} รายการ</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">รายการประกัน</CardTitle>
          <CardDescription>{home ? `จากเครื่องใช้ไฟฟ้าใน ${home.name}` : "สร้างบ้านก่อนติดตามประกัน"}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {warranties.length ? (
            warranties.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[item.brand, item.model, `หมดอายุ ${formatDate(item.warranty_end_date)}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                  {item.daysLeft < 0 ? `หมดอายุแล้ว ${Math.abs(item.daysLeft)} วัน` : `เหลือ ${item.daysLeft} วัน`}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">ยังไม่มีประกันเครื่องใช้ไฟฟ้า</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
