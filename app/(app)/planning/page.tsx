import Link from "next/link";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditComparisonOptionDialog } from "@/components/planning/edit-comparison-option-dialog";
import { EditComparisonPlanDialog } from "@/components/planning/edit-comparison-plan-dialog";
import { HeaderHomeSwitcher } from "@/components/home/header-home-switcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listHomes } from "@/features/homes/queries";
import {
  confirmComparisonOption,
  createComparisonOption,
  createComparisonPlan,
  deleteComparisonOption,
  deleteComparisonPlan,
} from "@/features/planning/actions";
import { listComparisonPlans } from "@/features/planning/queries";
import { priceTotal } from "@/features/planning/pricing";
import { listRooms } from "@/features/rooms/queries";
import { formatMoney } from "@/lib/format";

const destinationLabels = {
  shopping: "รายการซื้อ",
  maintenance: "บำรุงรักษา",
  renovation: "รีโนเวท",
};

const destinationRoutes = {
  shopping: "/shopping",
  maintenance: "/maintenance",
  renovation: "/renovations",
};

const fieldClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function PlanningPage({
  searchParams,
}: {
  searchParams?: Promise<{ homeId?: string; view?: string; error?: string }>;
}) {
  const homes = await listHomes();
  const params = await searchParams;
  const home = homes.find((item) => item.id === params?.homeId) ?? homes[0];
  const [rooms, plans] = await Promise.all([
    listRooms(home?.id),
    listComparisonPlans(home?.id),
  ]);
  const comparing = plans.filter((plan) => plan.status === "comparing");
  const confirmed = plans.filter((plan) => plan.status === "confirmed");
  const activeView = params?.view === "confirmed" ? "confirmed" : "comparing";
  const visiblePlans = activeView === "confirmed" ? confirmed : comparing;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="grid gap-5 rounded-xl bg-[#246a78] p-5 text-white shadow-sm sm:p-6 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-sm font-medium text-white/70">
            ตัดสินใจก่อนซื้อหรือจ้าง
          </p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
            วางแผนและเทียบราคา
          </h1>
          <p className="mt-2 text-sm text-white/80">
            เทียบราคาสินค้า ค่าติดตั้ง ร้านค้า และช่าง
            ก่อนยืนยันตัวเลือกที่เหมาะสม
          </p>
        </div>
        <HeaderHomeSwitcher
          action="/planning"
          label="บ้านของแผน"
          homes={homes}
          homeId={home?.id}
          hiddenFields={{ view: activeView }}
        />
      </section>

      {params?.error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {params.error}
        </div>
      ) : null}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  กำลังเปรียบเทียบ
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {comparing.length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">ยืนยันแล้ว</p>
                <p className="mt-1 text-2xl font-semibold">
                  {confirmed.length}
                </p>
              </CardContent>
            </Card>
          </div>

          <nav
            className="grid grid-cols-2 rounded-lg bg-secondary p-1"
            aria-label="สถานะแผน"
          >
            {[
              ["comparing", "กำลังเปรียบเทียบ", comparing.length],
              ["confirmed", "ยืนยันแล้ว", confirmed.length],
            ].map(([view, label, count]) => (
              <Link
                key={String(view)}
                href={{
                  pathname: "/planning",
                  query: { homeId: home?.id, view },
                }}
                aria-current={activeView === view ? "page" : undefined}
                className={
                  activeView === view
                    ? "rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-primary shadow-sm"
                    : "rounded-md px-3 py-2 text-center text-sm text-muted-foreground hover:text-foreground"
                }
              >
                {label} ({count})
              </Link>
            ))}
          </nav>

          <div className="grid gap-4">
            {visiblePlans.length ? (
              visiblePlans.map((plan) => {
                const room = rooms.find((item) => item.id === plan.room_id);
                const totals = plan.options.map(
                  (option) =>
                    priceTotal(
                      option.product_price_minor,
                      option.quantity,
                      option.product_price_basis,
                    ) +
                    priceTotal(
                      option.installation_price_minor,
                      option.quantity,
                      option.installation_price_basis,
                    ),
                );
                const lowestTotal = totals.length ? Math.min(...totals) : null;

                return (
                  <Card
                    key={plan.id}
                    className="relative overflow-hidden border-0 shadow-sm"
                  >
                    <div className="absolute right-5 top-5 z-10 flex items-center gap-1 rounded-lg border bg-white/80 p-1 shadow-sm backdrop-blur-sm">
                      {plan.status === "comparing" ? (
                        <EditComparisonPlanDialog
                          plan={plan}
                          rooms={rooms.map(({ id, name }) => ({ id, name }))}
                        />
                      ) : null}
                      <form action={deleteComparisonPlan}>
                        <input type="hidden" name="id" value={plan.id} />
                        <input
                          type="hidden"
                          name="home_id"
                          value={plan.home_id}
                        />
                        <Button size="sm" variant="ghost">
                          ลบแผน
                        </Button>
                      </form>
                    </div>
                    <details open>
                      <summary className="cursor-pointer list-none border-b bg-secondary/35 p-5 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                        <div className="flex min-h-10 flex-wrap items-center gap-2 pr-40">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              plan.status === "confirmed"
                                ? "bg-[#e8f5f3] text-primary"
                                : "bg-[#fff5d8] text-[#705b2f]"
                            }`}
                          >
                            {plan.status === "confirmed"
                              ? "ยืนยันแล้ว"
                              : "กำลังเปรียบเทียบ"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ส่งไป {destinationLabels[plan.destination_type]} ·{" "}
                            {plan.options.length} ตัวเลือก
                          </span>
                        </div>
                        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <CardTitle className="text-xl">
                              {plan.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {[room?.name, plan.notes]
                                .filter(Boolean)
                                .join(" · ") || "ไม่ระบุห้อง"}
                            </CardDescription>
                          </div>
                          <div className="min-w-40 shrink-0 rounded-xl border border-primary/10 bg-[#e8f5f3] px-4 py-3 text-right">
                            <p className="text-[11px] text-muted-foreground">
                              ราคาต่ำสุด ณ ตอนนี้
                            </p>
                            <p className="mt-1 text-lg font-semibold text-primary">
                              {lowestTotal == null
                                ? "ยังไม่มีราคา"
                                : formatMoney(
                                    lowestTotal,
                                    plan.options[0]?.currency ??
                                      home?.default_currency,
                                  )}
                            </p>
                          </div>
                        </div>
                      </summary>
                      <CardContent className="grid gap-3 p-4">
                      {plan.options.length ? (
                        <div className="grid items-start gap-3 xl:grid-cols-2">
                          {plan.options.map((option) => {
                            const productTotal =
                              priceTotal(
                                option.product_price_minor,
                                option.quantity,
                                option.product_price_basis,
                              );
                            const installationTotal = priceTotal(
                              option.installation_price_minor,
                              option.quantity,
                              option.installation_price_basis,
                            );
                            const total = productTotal + installationTotal;
                            const selected =
                              plan.selected_option_id === option.id;

                            return (
                              <div
                                key={option.id}
                                className={`rounded-lg border p-4 ${
                                  selected
                                    ? "border-primary bg-[#f4faf9] ring-1 ring-primary"
                                    : "bg-white"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate font-semibold">
                                      {option.provider_name}
                                    </p>
                                    <p className="mt-1 truncate text-sm text-muted-foreground">
                                      {option.item_name || plan.title}
                                    </p>
                                  </div>
                                  {selected ? (
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                                  ) : lowestTotal === total ? (
                                    <span className="shrink-0 rounded-full bg-[#e8f5f3] px-2 py-1 text-xs font-semibold text-primary">
                                      ราคาต่ำสุด
                                    </span>
                                  ) : null}
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                                  <div className="rounded-md bg-secondary/60 p-2">
                                    <p className="text-[11px] text-muted-foreground">
                                      ราคาสินค้า
                                      {option.product_price_basis === "per_unit"
                                        ? "/ชิ้น"
                                        : "รวม"}
                                    </p>
                                    <p className="mt-1 font-medium">
                                      {formatMoney(
                                        option.product_price_minor,
                                        option.currency,
                                      )}
                                    </p>
                                  </div>
                                  <div className="rounded-md bg-secondary/60 p-2">
                                    <p className="text-[11px] text-muted-foreground">
                                      จำนวน
                                    </p>
                                    <p className="mt-1 font-medium">
                                      {option.quantity.toLocaleString("th-TH")}{" "}
                                      ชิ้น
                                    </p>
                                  </div>
                                  <div className="rounded-md bg-secondary/60 p-2">
                                    <p className="text-[11px] text-muted-foreground">
                                      รวมสินค้า
                                    </p>
                                    <p className="mt-1 font-medium">
                                      {formatMoney(
                                        productTotal,
                                        option.currency,
                                      )}
                                    </p>
                                  </div>
                                  <div className="rounded-md bg-secondary/60 p-2">
                                    <p className="text-[11px] text-muted-foreground">
                                      ค่าติดตั้ง
                                      {option.installation_price_basis ===
                                      "per_unit"
                                        ? "/ชิ้น"
                                        : "รวม"}
                                    </p>
                                    <p className="mt-1 font-medium">
                                      {formatMoney(
                                        option.installation_price_minor,
                                        option.currency,
                                      )}
                                    </p>
                                  </div>
                                  <div className="rounded-md bg-secondary/60 p-2">
                                    <p className="text-[11px] text-muted-foreground">
                                      รวมติดตั้ง
                                    </p>
                                    <p className="mt-1 font-medium">
                                      {formatMoney(
                                        installationTotal,
                                        option.currency,
                                      )}
                                    </p>
                                  </div>
                                  <div className="rounded-md bg-[#fff5d8] p-2 text-[#705b2f]">
                                    <p className="text-[11px] opacity-75">
                                      รวม
                                    </p>
                                    <p className="mt-1 font-semibold">
                                      {formatMoney(total, option.currency)}
                                    </p>
                                  </div>
                                </div>

                                {option.notes ? (
                                  <p className="mt-3 text-sm text-muted-foreground">
                                    {option.notes}
                                  </p>
                                ) : null}

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                                  {option.product_url ? (
                                    <a
                                      href={option.product_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                                    >
                                      ดูรายละเอียด
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                  ) : (
                                    <span />
                                  )}
                                  {plan.status === "comparing" ? (
                                    <div className="flex gap-2">
                                      <EditComparisonOptionDialog
                                        option={option}
                                        planId={plan.id}
                                      />
                                      <form action={deleteComparisonOption}>
                                        <input
                                          type="hidden"
                                          name="id"
                                          value={option.id}
                                        />
                                        <input
                                          type="hidden"
                                          name="home_id"
                                          value={plan.home_id}
                                        />
                                        <Button size="sm" variant="ghost">
                                          ลบ
                                        </Button>
                                      </form>
                                      <form action={confirmComparisonOption}>
                                        <input
                                          type="hidden"
                                          name="home_id"
                                          value={plan.home_id}
                                        />
                                        <input
                                          type="hidden"
                                          name="comparison_plan_id"
                                          value={plan.id}
                                        />
                                        <input
                                          type="hidden"
                                          name="option_id"
                                          value={option.id}
                                        />
                                        <Button size="sm">ยืนยันเลือก</Button>
                                      </form>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                          ยังไม่มีตัวเลือก
                          เพิ่มร้านหรือช่างอย่างน้อยหนึ่งรายเพื่อเริ่มเปรียบเทียบ
                        </div>
                      )}

                      {plan.status === "comparing" ? (
                        <details className="rounded-lg border bg-secondary/25 p-3">
                          <summary className="cursor-pointer text-sm font-semibold text-primary">
                            + เพิ่มร้าน / ช่าง / ตัวเลือก
                          </summary>
                          <form
                            action={createComparisonOption}
                            className="mt-4 grid gap-3 sm:grid-cols-2"
                          >
                            <input
                              type="hidden"
                              name="comparison_plan_id"
                              value={plan.id}
                            />
                            <input
                              type="hidden"
                              name="home_id"
                              value={plan.home_id}
                            />
                            <input
                              name="provider_name"
                              placeholder="ชื่อร้าน / ช่าง"
                              required
                              className={fieldClass}
                            />
                            <input
                              name="item_name"
                              placeholder="สินค้า / รายละเอียดข้อเสนอ"
                              className={fieldClass}
                            />
                            <input
                              name="quantity"
                              type="number"
                              step="1"
                              min="1"
                              defaultValue="1"
                              placeholder="จำนวนสินค้า"
                              className={fieldClass}
                            />
                            <span className="hidden sm:block" />
                            <select
                              name="product_price_basis"
                              defaultValue="per_unit"
                              aria-label="รูปแบบราคาสินค้า"
                              className={fieldClass}
                            >
                              <option value="per_unit">
                                ราคาสินค้า: แยกต่อชิ้น
                              </option>
                              <option value="total">
                                ราคาสินค้า: รวมทั้งหมด
                              </option>
                            </select>
                            <select
                              name="installation_price_basis"
                              defaultValue="total"
                              aria-label="รูปแบบค่าติดตั้ง"
                              className={fieldClass}
                            >
                              <option value="per_unit">
                                ค่าติดตั้ง: แยกต่อชิ้น
                              </option>
                              <option value="total">
                                ค่าติดตั้ง: รวมทั้งหมด
                              </option>
                            </select>
                            <input
                              name="product_price"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="ราคาสินค้า"
                              className={fieldClass}
                            />
                            <input
                              name="installation_price"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="ค่าติดตั้ง"
                              className={fieldClass}
                            />
                            <input
                              name="product_url"
                              type="url"
                              placeholder="ลิงก์สินค้า / ใบเสนอราคา"
                              className={fieldClass}
                            />
                            <input
                              name="notes"
                              placeholder="เงื่อนไข ประกัน หรือหมายเหตุ"
                              className={fieldClass}
                            />
                            <Button
                              type="submit"
                              size="sm"
                              className="sm:col-span-2"
                            >
                              เพิ่มตัวเลือก
                            </Button>
                          </form>
                        </details>
                      ) : plan.destination_id ? (
                        <Button asChild className="w-full sm:w-auto">
                          <Link
                            href={`${destinationRoutes[plan.destination_type]}?homeId=${plan.home_id}`}
                          >
                            เปิดใน {destinationLabels[plan.destination_type]}
                          </Link>
                        </Button>
                      ) : null}
                    </CardContent>
                    </details>
                  </Card>
                );
              })
            ) : (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    {activeView === "confirmed"
                      ? "ยังไม่มีแผนที่ยืนยันแล้ว"
                      : "ยังไม่มีรายการเปรียบเทียบ"}
                  </CardTitle>
                  <CardDescription>
                    สร้างหัวข้อจากฟอร์มด้านขวา
                    แล้วเพิ่มร้านหรือช่างเพื่อเทียบราคา
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </section>

        <Card className="h-fit border-0 bg-white shadow-sm lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-base">สร้างแผนเปรียบเทียบ</CardTitle>
            <CardDescription>
              เลือกปลายทางไว้ก่อน เมื่อยืนยันแล้วระบบจะส่งรายการไปให้
            </CardDescription>
          </CardHeader>
          <CardContent>
            {home ? (
              <form action={createComparisonPlan} className="grid gap-3">
                <input type="hidden" name="home_id" value={home.id} />
                <label className="grid gap-2 text-sm font-medium">
                  หัวข้อที่ต้องการเปรียบเทียบ
                  <input
                    name="title"
                    placeholder="เช่น ซื้อและติดตั้งเครื่องปรับอากาศ"
                    required
                    className={fieldClass}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  ห้อง
                  <select name="room_id" className={fieldClass}>
                    <option value="">ไม่ระบุห้อง</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  เมื่อยืนยันแล้วส่งไป
                  <select name="destination_type" className={fieldClass}>
                    <option value="shopping">รายการซื้อ — สินค้า/วัสดุ</option>
                    <option value="maintenance">
                      บำรุงรักษา — ติดตั้ง/ซ่อม/จ้างช่าง
                    </option>
                    <option value="renovation">รีโนเวท — งานปรับปรุง</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  หมายเหตุ
                  <input name="notes" className={fieldClass} />
                </label>
                <Button type="submit" className="mt-1 w-full">
                  สร้างแผน
                </Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">
                สร้างบ้านก่อนเริ่มวางแผน
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
