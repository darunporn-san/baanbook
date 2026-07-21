"use client";

import { useId, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateComparisonOption } from "@/features/planning/actions";
import type { ComparisonOption } from "@/features/planning/queries";

const fieldClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function EditComparisonOptionDialog({
  option,
  planId,
}: {
  option: ComparisonOption;
  planId: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => dialogRef.current?.showModal()}
      >
        แก้ไข
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto max-h-[90vh] w-[min(760px,calc(100%-2rem))] rounded-xl border-0 bg-white p-0 text-foreground shadow-2xl backdrop:bg-black/50"
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              แก้ไขข้อมูลและราคา
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {option.provider_name} · {option.item_name || "ไม่ระบุสินค้า"}
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="ปิดหน้าต่างแก้ไข"
            onClick={() => dialogRef.current?.close()}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form
          action={updateComparisonOption}
          className="grid max-h-[calc(90vh-81px)] gap-4 overflow-y-auto p-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <input type="hidden" name="id" value={option.id} />
          <input type="hidden" name="home_id" value={option.home_id} />
          <input type="hidden" name="comparison_plan_id" value={planId} />
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            ร้าน / ช่าง
            <input
              name="provider_name"
              defaultValue={option.provider_name}
              required
              className={fieldClass}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            สินค้า / รายละเอียด
            <input
              name="item_name"
              defaultValue={option.item_name ?? ""}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            จำนวนสินค้า
            <input
              name="quantity"
              type="number"
              min="1"
              step="1"
              defaultValue={option.quantity}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            รูปแบบราคาสินค้า
            <select
              name="product_price_basis"
              defaultValue={option.product_price_basis}
              className={fieldClass}
            >
              <option value="per_unit">แยกต่อชิ้น</option>
              <option value="total">รวมทั้งหมด</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            ราคาสินค้า
            <input
              name="product_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={option.product_price_minor / 100}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            รูปแบบค่าติดตั้ง
            <select
              name="installation_price_basis"
              defaultValue={option.installation_price_basis}
              className={fieldClass}
            >
              <option value="per_unit">แยกต่อชิ้น</option>
              <option value="total">รวมทั้งหมด</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            ค่าติดตั้ง
            <input
              name="installation_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={option.installation_price_minor / 100}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            ลิงก์สินค้า / ใบเสนอราคา
            <input
              name="product_url"
              type="url"
              defaultValue={option.product_url ?? ""}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            หมายเหตุ
            <input
              name="notes"
              defaultValue={option.notes ?? ""}
              className={fieldClass}
            />
          </label>
          <div className="flex justify-end gap-2 border-t pt-4 sm:col-span-2 lg:col-span-3">
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
