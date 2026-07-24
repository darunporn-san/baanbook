"use client";

import { useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markShoppingItemBought } from "@/features/shopping/actions";
import type { ShoppingItem } from "@/features/shopping/queries";
import { formatMoney } from "@/lib/format";

const fieldClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function MarkShoppingBoughtDialog({
  item,
  currency,
}: {
  item: ShoppingItem;
  currency?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const initialPrice =
    (item.actual_price_minor ?? item.estimated_price_minor ?? 0) / 100;
  const [actualPrice, setActualPrice] = useState(initialPrice);
  const [additionalExpense, setAdditionalExpense] = useState(0);
  const totalMinor = Math.round((actualPrice + additionalExpense) * 100);

  return (
    <>
      <Button
        type="button"
        size="sm"
        onClick={() => dialogRef.current?.showModal()}
      >
        ซื้อแล้ว
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[min(460px,calc(100%-2rem))] rounded-xl border-0 bg-white p-0 text-foreground shadow-2xl backdrop:bg-black/50"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              ยืนยันการซื้อ
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{item.title}</p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="ปิดหน้าต่างยืนยันการซื้อ"
            onClick={() => dialogRef.current?.close()}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form action={markShoppingItemBought} className="grid gap-4 p-5">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="home_id" value={item.home_id} />
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            ราคาจริง
            <input
              name="actual_price"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={actualPrice || ""}
              onChange={(event) => setActualPrice(Number(event.target.value))}
              placeholder="0.00"
              className={fieldClass}
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            ค่าใช้จ่ายเพิ่มเติม (ถ้ามี)
            <input
              name="additional_expense"
              type="number"
              min="0"
              step="0.01"
              value={additionalExpense || ""}
              onChange={(event) =>
                setAdditionalExpense(Number(event.target.value))
              }
              placeholder="0.00"
              className={fieldClass}
            />
          </label>
          <div className="flex items-center justify-between rounded-lg bg-[#e8f5f3] p-4">
            <span className="text-sm text-muted-foreground">
              ยอดรวมที่จะบันทึก
            </span>
            <span className="text-lg font-semibold text-primary">
              {formatMoney(totalMinor, currency)}
            </span>
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => dialogRef.current?.close()}
            >
              ยกเลิก
            </Button>
            <Button type="submit" pendingText="กำลังบันทึก...">
              ยืนยันการซื้อ
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
