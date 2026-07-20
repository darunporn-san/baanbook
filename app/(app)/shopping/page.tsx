import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listHomes } from "@/features/homes/queries";
import { listRenovationProjects } from "@/features/renovations/queries";
import { listRooms } from "@/features/rooms/queries";
import { createShoppingItem, deleteShoppingItem, updateShoppingItem } from "@/features/shopping/actions";
import { listShoppingItems } from "@/features/shopping/queries";
import { formatMoney } from "@/lib/format";
import { commonText, getLabel, priorityLabels, shoppingStatusLabels } from "@/lib/labels";

export default async function ShoppingPage({
  searchParams,
}: {
  searchParams?: Promise<{ homeId?: string }>;
}) {
  const homes = await listHomes();
  const params = await searchParams;
  const home = homes.find((item) => item.id === params?.homeId) ?? homes[0];
  const [rooms, projects, items] = await Promise.all([
    listRooms(home?.id),
    listRenovationProjects(home?.id),
    listShoppingItems(home?.id),
  ]);
  const planned = items.filter((item) => item.status === "planned");
  const bought = items.filter((item) => item.status === "bought");
  const estimated = items.reduce((sum, item) => sum + (item.estimated_price_minor ?? 0), 0);
  const actual = items.reduce((sum, item) => sum + (item.actual_price_minor ?? 0), 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-4">
        <div className="rounded-lg bg-[#ffd36a] p-5 text-[#514227] shadow-sm">
          <h1 className="text-2xl font-semibold">รายการซื้อ</h1>
          <p className="mt-1 text-sm text-[#705b2f]">ติดตามของที่วางแผนซื้อและซื้อแล้วสำหรับบ้าน</p>
        </div>
        <form action="/shopping" className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <label htmlFor="shopping-home" className="text-sm font-medium">บ้านของรายการซื้อ</label>
            <select id="shopping-home" name="homeId" defaultValue={home?.id} className="flex h-10 w-full min-w-64 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {homes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <Button type="submit">ดูข้อมูล</Button>
        </form>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-0 bg-[#00bfa5] text-white shadow-sm"><CardHeader><CardTitle className="text-sm uppercase tracking-normal">วางแผน</CardTitle><CardDescription className="text-white/80">{planned.length} รายการ</CardDescription></CardHeader></Card>
          <Card className="border-0 bg-[#ff806f] text-white shadow-sm"><CardHeader><CardTitle className="text-sm uppercase tracking-normal">ซื้อแล้ว</CardTitle><CardDescription className="text-white/80">{bought.length} รายการ</CardDescription></CardHeader></Card>
          <Card className="border-0 bg-white shadow-sm"><CardHeader><CardTitle className="text-sm uppercase tracking-normal text-muted-foreground">ยอดใช้จ่าย</CardTitle><CardDescription>{formatMoney(actual || estimated, home?.default_currency)}</CardDescription></CardHeader></Card>
        </div>

        <div className="grid gap-3">
          {items.length ? items.map((item) => (
            <Card key={item.id} className="border-0 shadow-sm">
              <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{getLabel(shoppingStatusLabels, item.status)} · {getLabel(priorityLabels, item.priority)} · {formatMoney(item.actual_price_minor ?? item.estimated_price_minor ?? 0, home?.default_currency)}</CardDescription>
                  {item.vendor ? <CardDescription>{item.vendor}</CardDescription> : null}
                </div>
                <form action={deleteShoppingItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="home_id" value={item.home_id} />
                  <Button size="sm" variant="ghost">{commonText.delete}</Button>
                </form>
              </CardHeader>
              <CardContent>
                <details>
                  <summary className="cursor-pointer text-sm font-medium text-primary">{commonText.edit}</summary>
                  <form action={updateShoppingItem} className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="home_id" value={item.home_id} />
                    <input name="title" defaultValue={item.title} required className="h-10 rounded-md border bg-background px-3 text-sm" />
                    <select name="status" defaultValue={item.status} className="h-10 rounded-md border bg-background px-3 text-sm">{Object.entries(shoppingStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                    <select name="priority" defaultValue={item.priority} className="h-10 rounded-md border bg-background px-3 text-sm">{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                    <select name="room_id" defaultValue={item.room_id ?? ""} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">{commonText.noRoom}</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select>
                    <select name="renovation_project_id" defaultValue={item.renovation_project_id ?? ""} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">{commonText.noProject}</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
                    <input name="estimated_price" type="number" step="0.01" min="0" defaultValue={(item.estimated_price_minor ?? 0) / 100} placeholder="ราคาประเมิน" className="h-10 rounded-md border bg-background px-3 text-sm" />
                    <input name="actual_price" type="number" step="0.01" min="0" defaultValue={(item.actual_price_minor ?? 0) / 100} placeholder="ราคาจริง" className="h-10 rounded-md border bg-background px-3 text-sm" />
                    <input name="vendor" defaultValue={item.vendor ?? ""} placeholder="ร้าน/ผู้ขาย" className="h-10 rounded-md border bg-background px-3 text-sm" />
                    <input name="product_url" defaultValue={item.product_url ?? ""} placeholder="ลิงก์สินค้า" className="h-10 rounded-md border bg-background px-3 text-sm" />
                    <input name="notes" defaultValue={item.notes ?? ""} placeholder="บันทึก" className="h-10 rounded-md border bg-background px-3 text-sm" />
                    <Button type="submit" size="sm">{commonText.save}</Button>
                  </form>
                </details>
              </CardContent>
            </Card>
          )) : (
            <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base">ยังไม่มีรายการซื้อ</CardTitle><CardDescription>เพิ่มของที่วางแผนจะซื้อ</CardDescription></CardHeader></Card>
          )}
        </div>
      </section>

      <Card className="border-0 bg-white shadow-sm">
        <CardHeader><CardTitle className="text-base">เพิ่มรายการซื้อ</CardTitle><CardDescription>ผูกกับห้องหรือโปรเจกต์รีโนเวทเมื่อจำเป็น</CardDescription></CardHeader>
        <CardContent>
          {home ? (
            <form action={createShoppingItem} className="grid gap-3">
              <input type="hidden" name="home_id" value={home.id} />
              <input name="title" placeholder="ผ้าม่าน" required className="h-10 rounded-md border bg-background px-3 text-sm" />
              <div className="grid gap-3 sm:grid-cols-2">
                <select name="status" className="h-10 rounded-md border bg-background px-3 text-sm">{Object.entries(shoppingStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                <select name="priority" className="h-10 rounded-md border bg-background px-3 text-sm">{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              </div>
              <select name="room_id" className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">{commonText.noRoom}</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select>
              <select name="renovation_project_id" className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">{commonText.noProject}</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="estimated_price" type="number" step="0.01" min="0" placeholder="ราคาประเมิน" className="h-10 rounded-md border bg-background px-3 text-sm" />
                <input name="actual_price" type="number" step="0.01" min="0" placeholder="ราคาจริง" className="h-10 rounded-md border bg-background px-3 text-sm" />
              </div>
              <input name="vendor" placeholder="ร้าน/ผู้ขาย" className="h-10 rounded-md border bg-background px-3 text-sm" />
              <input name="product_url" placeholder="ลิงก์สินค้า" className="h-10 rounded-md border bg-background px-3 text-sm" />
              <input name="notes" placeholder="บันทึก" className="h-10 rounded-md border bg-background px-3 text-sm" />
              <Button type="submit">เพิ่มรายการซื้อ</Button>
            </form>
          ) : <p className="text-sm text-muted-foreground">สร้างบ้านก่อนเพิ่มรายการซื้อ</p>}
        </CardContent>
      </Card>
    </div>
  );
}
