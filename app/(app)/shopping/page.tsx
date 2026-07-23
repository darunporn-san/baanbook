import { Button } from "@/components/ui/button";
import { HeaderHomeSwitcher } from "@/components/home/header-home-switcher";
import {
  MobileCreateTrigger,
  ResponsiveCreatePanel,
} from "@/components/ui/mobile-create-dialog";
import { EditShoppingItemDialog } from "@/components/shopping/edit-shopping-item-dialog";
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
import {
  createShoppingItem,
  deleteShoppingItem,
} from "@/features/shopping/actions";
import { listShoppingItems } from "@/features/shopping/queries";
import { formatMoney } from "@/lib/format";
import {
  commonText,
  getLabel,
  priorityLabels,
  shoppingStatusLabels,
} from "@/lib/labels";

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
  const cancelled = items.filter((item) => item.status === "cancelled");
  const estimated = items.reduce(
    (sum, item) => sum + (item.estimated_price_minor ?? 0),
    0,
  );
  const actual = items.reduce(
    (sum, item) => sum + (item.actual_price_minor ?? 0),
    0,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="relative grid gap-5 rounded-xl bg-[#ffd36a] p-5 text-[#514227] shadow-sm sm:p-6 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-sm font-medium text-[#705b2f]">วางแผนการซื้อ</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
            รายการซื้อ
          </h1>
          <p className="mt-2 text-sm text-[#705b2f]">
            ติดตามของที่วางแผนซื้อและซื้อแล้วสำหรับบ้าน
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <p className="text-xs text-[#705b2f]">งบประมาณรวม</p>
              <p className="text-xl font-semibold">
                {formatMoney(estimated, home?.default_currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#705b2f]">จ่ายจริงแล้ว</p>
              <p className="text-xl font-semibold">
                {formatMoney(actual, home?.default_currency)}
              </p>
            </div>
          </div>
        </div>
        <div>
          <HeaderHomeSwitcher
            action="/shopping"
            label="บ้านของรายการซื้อ"
            homes={homes}
            homeId={home?.id}
          />
          {home ? (
            <MobileCreateTrigger
              dialogId="create-shopping-dialog"
              label="เพิ่มรายการซื้อ"
            />
          ) : null}
        </div>
      </section>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">กำลังวางแผน</p>
                  <p className="mt-1 text-2xl font-semibold text-primary">
                    {planned.length}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  รอซื้อ
                </span>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">ซื้อสำเร็จ</p>
                  <p className="mt-1 text-2xl font-semibold text-[#db6556]">
                    {bought.length}
                  </p>
                </div>
                <span className="rounded-full bg-[#fff0ed] px-3 py-1 text-xs font-semibold text-[#b94d40]">
                  ซื้อแล้ว
                </span>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">ยกเลิก</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {cancelled.length}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                  ไม่ซื้อ
                </span>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="flex-row items-end justify-between space-y-0 border-b p-5">
              <div>
                <CardTitle className="text-base">รายการทั้งหมด</CardTitle>
                <CardDescription className="mt-1">
                  ของที่กำลังวางแผนและประวัติการซื้อ
                </CardDescription>
              </div>
              <span className="text-sm font-semibold text-primary">
                {items.length} รายการ
              </span>
            </CardHeader>
            <CardContent className="grid gap-3 p-4">
              {items.length ? (
                items.map((item) => (
                  <div
                    key={item.id}
                    className={`overflow-hidden rounded-lg border bg-white ${
                      item.status === "bought"
                        ? "border-l-4 border-l-[#ff806f]"
                        : item.status === "cancelled"
                          ? "border-l-4 border-l-muted-foreground/30 opacity-70"
                          : "border-l-4 border-l-primary"
                    }`}
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              item.status === "bought"
                                ? "bg-[#fff0ed] text-[#b94d40]"
                                : item.status === "cancelled"
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-primary/10 text-primary"
                            }`}
                          >
                            {getLabel(shoppingStatusLabels, item.status)}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              item.priority === "urgent" ||
                              item.priority === "high"
                                ? "bg-red-50 text-red-700"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {getLabel(priorityLabels, item.priority)}
                          </span>
                        </div>
                        <h2 className="mt-3 font-semibold">{item.title}</h2>
                        <p className="mt-1 text-xl font-semibold text-primary">
                          {formatMoney(
                            item.actual_price_minor ??
                              item.estimated_price_minor ??
                              0,
                            home?.default_currency,
                          )}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {item.vendor ? (
                            <span>ร้าน: {item.vendor}</span>
                          ) : null}
                          {item.room_id ? (
                            <span>
                              ห้อง:{" "}
                              {rooms.find((room) => room.id === item.room_id)
                                ?.name ?? commonText.noRoom}
                            </span>
                          ) : null}
                          {item.renovation_project_id ? (
                            <span>
                              โปรเจกต์:{" "}
                              {projects.find(
                                (project) =>
                                  project.id === item.renovation_project_id,
                              )?.name ?? commonText.noProject}
                            </span>
                          ) : null}
                        </div>
                        {item.notes ? (
                          <p className="mt-3 text-sm text-muted-foreground">
                            {item.notes}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <EditShoppingItemDialog
                          item={item}
                          rooms={rooms}
                          projects={projects}
                        />
                        <form action={deleteShoppingItem}>
                          <input type="hidden" name="id" value={item.id} />
                          <input
                            type="hidden"
                            name="home_id"
                            value={item.home_id}
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
                <div className="rounded-lg border border-dashed bg-secondary/20 p-8 text-center">
                  <p className="font-semibold">ยังไม่มีรายการซื้อ</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    เพิ่มของที่วางแผนจะซื้อจากฟอร์มด้านข้าง
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <ResponsiveCreatePanel
          dialogId="create-shopping-dialog"
          title="เพิ่มรายการซื้อ"
        >
          <Card className="h-fit border-0 bg-white shadow-sm lg:sticky lg:top-20">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base">เพิ่มรายการซื้อ</CardTitle>
              <CardDescription>
                ผูกกับห้องหรือโปรเจกต์รีโนเวทเมื่อจำเป็น
              </CardDescription>
            </CardHeader>
            <CardContent>
              {home ? (
                <form action={createShoppingItem} className="grid gap-4">
                  <input type="hidden" name="home_id" value={home.id} />
                  <label className="grid gap-1.5 text-xs font-medium">
                    ชื่อรายการ
                    <input
                      name="title"
                      placeholder="เช่น ผ้าม่าน โต๊ะกินข้าว"
                      required
                      className="h-10 rounded-md border bg-background px-3 text-sm font-normal"
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-xs font-medium">
                      สถานะ
                      <select
                        name="status"
                        className="h-10 rounded-md border bg-background px-3 text-sm font-normal"
                      >
                        {Object.entries(shoppingStatusLabels).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                    <label className="grid gap-1.5 text-xs font-medium">
                      ความสำคัญ
                      <select
                        name="priority"
                        className="h-10 rounded-md border bg-background px-3 text-sm font-normal"
                      >
                        {Object.entries(priorityLabels).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <label className="grid gap-1.5 text-xs font-medium">
                      ห้อง
                      <select
                        name="room_id"
                        className="h-10 rounded-md border bg-background px-3 text-sm font-normal"
                      >
                        <option value="">{commonText.noRoom}</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1.5 text-xs font-medium">
                      โปรเจกต์รีโนเวท
                      <select
                        name="renovation_project_id"
                        className="h-10 rounded-md border bg-background px-3 text-sm font-normal"
                      >
                        <option value="">{commonText.noProject}</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-xs font-medium">
                      ราคาประเมิน
                      <input
                        name="estimated_price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-10 min-w-0 rounded-md border bg-background px-3 text-sm font-normal"
                      />
                    </label>
                    <label className="grid gap-1.5 text-xs font-medium">
                      ราคาจริง
                      <input
                        name="actual_price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-10 min-w-0 rounded-md border bg-background px-3 text-sm font-normal"
                      />
                    </label>
                  </div>
                  <label className="grid gap-1.5 text-xs font-medium">
                    ร้านหรือผู้ขาย
                    <input
                      name="vendor"
                      placeholder="เช่น IKEA, HomePro"
                      className="h-10 rounded-md border bg-background px-3 text-sm font-normal"
                    />
                  </label>
                  <details className="rounded-md border bg-secondary/15 p-3">
                    <summary className="cursor-pointer text-sm font-semibold">
                      รายละเอียดเพิ่มเติม
                    </summary>
                    <div className="mt-3 grid gap-3">
                      <input
                        name="product_url"
                        placeholder="ลิงก์สินค้า"
                        aria-label="ลิงก์สินค้า"
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                      />
                      <textarea
                        name="notes"
                        rows={3}
                        placeholder="บันทึกเพิ่มเติม"
                        aria-label="บันทึกเพิ่มเติม"
                        className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </details>
                  <Button type="submit" pendingText="กำลังเพิ่มรายการ...">
                    เพิ่มรายการซื้อ
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  สร้างบ้านก่อนเพิ่มรายการซื้อ
                </p>
              )}
            </CardContent>
          </Card>
        </ResponsiveCreatePanel>
      </div>
    </div>
  );
}
