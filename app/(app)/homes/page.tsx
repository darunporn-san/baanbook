import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateHomeForm } from "@/components/home/create-home-form";
import { deleteHome } from "@/features/homes/actions";
import { listHomes } from "@/features/homes/queries";
import { getLabel, homeTypeLabels } from "@/lib/labels";

export default async function HomesPage() {
  const homes = await listHomes();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-4">
        <div className="rounded-lg bg-[#ff806f] p-5 text-white shadow-sm">
          <h1 className="text-2xl font-semibold">บ้าน</h1>
          <p className="mt-1 text-sm text-white/80">
            จัดการบ้านแต่ละหลัง แล้วเปิดบ้านเพื่อจัดการห้องภายใน
          </p>
        </div>
        <div className="grid gap-3">
          {homes.length ? (
            homes.map((home) => (
              <Card key={home.id} className="border-0 shadow-sm">
                <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base">{home.name}</CardTitle>
                    <CardDescription>
                      {getLabel(homeTypeLabels, home.home_type) || "บ้าน"} · {home.default_currency} · {home.timezone}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/homes/${home.id}`}>เปิด</Link>
                    </Button>
                    <form action={deleteHome}>
                      <input type="hidden" name="id" value={home.id} />
                      <Button size="sm" variant="ghost">ลบ</Button>
                    </form>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">ยังไม่มีบ้าน</CardTitle>
                <CardDescription>สร้างบ้านหลังแรกเพื่อเริ่มใช้แดชบอร์ด</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </section>
      <aside>
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">เพิ่มบ้าน</CardTitle>
            <CardDescription>
              เพิ่มบ้านอีกหลังเมื่อคุณดูแลมากกว่าหนึ่งที่
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateHomeForm redirectTo="/homes" />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
