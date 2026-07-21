import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateApplianceForm } from "@/components/appliance/create-appliance-form";
import { ApplianceRow } from "@/components/appliance/appliance-row";
import {
  deleteAppliance,
  updateAppliance,
} from "@/features/appliances/actions";
import { listAppliances } from "@/features/appliances/queries";
import { listHomes } from "@/features/homes/queries";
import { listRooms } from "@/features/rooms/queries";
import { formatDate } from "@/lib/format";
import { commonText } from "@/lib/labels";

export default async function AppliancesPage({
  searchParams,
}: {
  searchParams?: Promise<{ homeId?: string }>;
}) {
  const homes = await listHomes();
  const params = await searchParams;
  const home = homes.find((item) => item.id === params?.homeId) ?? homes[0];
  const rooms = await listRooms(home?.id);
  const appliances = await listAppliances(home?.id);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-xl bg-[#ffd36a] p-5 text-[#514227] shadow-sm sm:p-6">
        <p className="text-sm font-medium text-[#705b2f]">ทรัพย์สินภายในบ้าน</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
          เครื่องใช้ไฟฟ้า
        </h1>
        <p className="mt-2 text-sm text-[#705b2f]">
          ติดตามเครื่องใช้ การซื้อ และวันหมดประกัน
        </p>
      </section>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <form
            action="/appliances"
            className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="space-y-2">
              <label htmlFor="appliances-home" className="text-sm font-medium">
                บ้านของเครื่องใช้ไฟฟ้า
              </label>
              <select
                id="appliances-home"
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
          <div className="grid gap-3">
            {appliances.length ? (
              appliances.map((item) => (
                <Card key={item.id} className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <CardDescription>
                      {[
                        item.brand,
                        item.model,
                        item.warranty_end_date
                          ? `ประกันถึง ${formatDate(item.warranty_end_date)}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || commonText.noDetails}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ApplianceRow
                      item={item}
                      rooms={rooms}
                      updateAction={updateAppliance}
                      deleteAction={deleteAppliance}
                    />
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    ยังไม่มีเครื่องใช้ไฟฟ้า
                  </CardTitle>
                  <CardDescription>
                    เพิ่มเครื่องใช้ไฟฟ้ารายการแรก
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </section>
        <Card className="h-fit border-0 bg-white shadow-sm lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-base">เพิ่มเครื่องใช้ไฟฟ้า</CardTitle>
            <CardDescription>เก็บข้อมูลการซื้อและประกัน</CardDescription>
          </CardHeader>
          <CardContent>
            {home ? (
              <CreateApplianceForm
                homeId={home.id}
                homes={homes}
                rooms={rooms}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                สร้างบ้านก่อนเพิ่มเครื่องใช้ไฟฟ้า
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
