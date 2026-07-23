import type { HomeSummary } from "@/features/homes/queries";
import type { Room } from "@/features/rooms/queries";
import { createExpense } from "@/features/expenses/actions";
import { expenseCategoryGroups } from "@/features/expenses/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InstallmentFields } from "@/components/expense/installment-fields";

export function CreateExpenseForm({
  homeId,
  homes,
  rooms,
}: {
  homeId: string;
  homes: HomeSummary[];
  rooms: Room[];
}) {
  return (
    <form action={createExpense} className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="expense-home">บ้าน</Label>
        <select
          id="expense-home"
          name="home_id"
          defaultValue={homeId}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          {homes.map((home) => (
            <option key={home.id} value={home.id}>
              {home.name}
            </option>
          ))}
        </select>
      </div>
      <div className="rounded-md border bg-secondary/20 p-3">
        <p className="text-sm font-semibold">ข้อมูลค่าใช้จ่าย</p>
        <p className="mt-1 text-xs text-muted-foreground">
          ใช้เป็นข้อมูลหลักของรายการนี้
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="expense-title">รายการ</Label>
        <Input
          id="expense-title"
          name="title"
          placeholder="เช่น ค่าแอร์ ตู้เย็น ค่าสำรวจ หรือค่าติดตั้ง"
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expense-amount">จำนวนเงิน</Label>
          <Input
            id="expense-amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="จำนวนเงิน"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expense-date">วันที่จ่าย</Label>
          <Input
            id="expense-date"
            name="expense_date"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="expense-payment-status">สถานะการจ่าย</Label>
          <select
            id="expense-payment-status"
            name="is_paid"
            defaultValue="true"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="true">จ่ายแล้ว</option>
            <option value="false">ยังไม่จ่าย</option>
          </select>
        </div>
      </div>
      <InstallmentFields idPrefix="expense-installment" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expense-category">หมวดหมู่</Label>
          <select
            id="expense-category"
            name="category"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {expenseCategoryGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="expense-room">ห้อง</Label>
          <select
            id="expense-room"
            name="room_id"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">ไม่ระบุห้อง</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expense-appointment-date">วันที่นัดหมาย</Label>
          <Input
            id="expense-appointment-date"
            name="appointment_date"
            type="date"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expense-appointment-time">เวลานัดหมาย</Label>
          <Input
            id="expense-appointment-time"
            name="appointment_time"
            type="time"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="expense-notes">รายละเอียดเพิ่มเติม</Label>
        <textarea
          id="expense-notes"
          name="notes"
          rows={3}
          placeholder="เช่น รายละเอียดงาน ใบเสนอราคา ผู้รับเหมา หรือเงื่อนไขการชำระ"
          className="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <details className="rounded-md border bg-secondary/20 p-3">
        <summary className="cursor-pointer text-sm font-semibold">
          เครื่องใช้ไฟฟ้าและประกัน
        </summary>
        <div className="mt-3 grid gap-3">
          <label htmlFor="create-appliance" className="flex items-start gap-3">
            <input
              id="create-appliance"
              name="create_appliance"
              type="checkbox"
              value="1"
              className="mt-1 size-4 accent-primary"
            />
            <span>
              <span className="block text-sm font-semibold">
                บันทึกเป็นเครื่องใช้ไฟฟ้าด้วย
              </span>
              <span className="block text-xs text-muted-foreground">
                ใช้กับรายการซื้อเครื่องใช้ไฟฟ้า เช่น แอร์ ตู้เย็น เครื่องซักผ้า
              </span>
            </span>
          </label>
          <div className="space-y-2">
            <Label htmlFor="appliance-name">ชื่อเครื่องใช้ไฟฟ้า</Label>
            <Input
              id="appliance-name"
              name="appliance_name"
              placeholder="ถ้าไม่ใส่ จะใช้ชื่อรายการด้านบน"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="appliance-brand">ยี่ห้อ</Label>
              <Input
                id="appliance-brand"
                name="brand"
                placeholder="เช่น Daikin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appliance-model">รุ่น</Label>
              <Input
                id="appliance-model"
                name="model"
                placeholder="รุ่นสินค้า"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="appliance-purchase-date">วันที่ซื้อ</Label>
              <Input
                id="appliance-purchase-date"
                name="purchase_date"
                type="date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appliance-warranty-type">รูปแบบประกัน</Label>
              <select
                id="appliance-warranty-type"
                name="warranty_type"
                defaultValue="none"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="none">ไม่มีประกัน</option>
                <option value="date">ระบุวันหมดประกัน</option>
                <option value="lifetime">ประกันตลอดชีพ</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appliance-warranty-end-date">วันหมดประกัน</Label>
              <Input
                id="appliance-warranty-end-date"
                name="warranty_end_date"
                type="date"
              />
            </div>
          </div>
        </div>
      </details>
      <Button type="submit" pendingText="กำลังเพิ่มรายการ...">
        เพิ่มรายการ
      </Button>
    </form>
  );
}
