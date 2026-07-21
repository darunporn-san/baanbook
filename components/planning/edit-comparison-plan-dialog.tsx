"use client";

import { useId, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateComparisonPlan } from "@/features/planning/actions";
import type { ComparisonPlan } from "@/features/planning/queries";

const fieldClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function EditComparisonPlanDialog({
  plan,
  rooms,
}: {
  plan: ComparisonPlan;
  rooms: { id: string; name: string }[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => dialogRef.current?.showModal()}
      >
        แก้ไข
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[min(620px,calc(100%-2rem))] rounded-xl border-0 bg-white p-0 text-foreground shadow-2xl backdrop:bg-black/50"
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              แก้ไขแผนเปรียบเทียบ
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              แก้ชื่อ ห้อง และตำแหน่งที่จะส่งรายการไป
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="ปิดหน้าต่างแก้ไขแผน"
            onClick={() => dialogRef.current?.close()}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form
          action={updateComparisonPlan}
          className="grid gap-4 p-5 sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={plan.id} />
          <input type="hidden" name="home_id" value={plan.home_id} />
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground sm:col-span-2">
            ชื่อแผน
            <input
              name="title"
              defaultValue={plan.title}
              required
              className={fieldClass}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            ห้อง
            <select
              name="room_id"
              defaultValue={plan.room_id ?? ""}
              className={fieldClass}
            >
              <option value="">ไม่ระบุห้อง</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            เมื่อยืนยันแล้วส่งไป
            <select
              name="destination_type"
              defaultValue={plan.destination_type}
              className={fieldClass}
            >
              <option value="shopping">รายการซื้อ — สินค้า/วัสดุ</option>
              <option value="maintenance">
                บำรุงรักษา — ติดตั้ง/ซ่อม/จ้างช่าง
              </option>
              <option value="renovation">รีโนเวท — งานปรับปรุง</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground sm:col-span-2">
            หมายเหตุ
            <input
              name="notes"
              defaultValue={plan.notes ?? ""}
              className={fieldClass}
            />
          </label>
          <div className="flex justify-end gap-2 border-t pt-4 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => dialogRef.current?.close()}
            >
              ยกเลิก
            </Button>
            <Button type="submit">บันทึกการแก้ไข</Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
