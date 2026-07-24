"use client";

import { useId, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RenovationProject } from "@/features/renovations/queries";
import type { Room } from "@/features/rooms/queries";
import { updateShoppingItem } from "@/features/shopping/actions";
import type { ShoppingItem } from "@/features/shopping/queries";
import {
  commonText,
  priorityLabels,
  shoppingStatusLabels,
} from "@/lib/labels";

const fieldClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function EditShoppingItemDialog({
  item,
  rooms,
  projects,
}: {
  item: ShoppingItem;
  rooms: Room[];
  projects: RenovationProject[];
}) {
  const [editing, setEditing] = useState(false);
  const titleId = useId();

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setEditing(true)}
      >
        แก้ไข
      </Button>
      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setEditing(false)}
            aria-label="ปิดหน้าต่างแก้ไข"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-hidden rounded-xl bg-white text-foreground shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
            onKeyDown={(event) =>
              event.key === "Escape" && setEditing(false)
            }
          >
            <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
              <div>
                <h2 id={titleId} className="text-lg font-semibold">
                  แก้ไขรายการซื้อ
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.title}
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="ปิดหน้าต่างแก้ไข"
                onClick={() => setEditing(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form
              action={updateShoppingItem}
              className="grid max-h-[calc(100dvh-7rem)] gap-4 overflow-y-auto p-5 sm:grid-cols-2"
            >
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="home_id" value={item.home_id} />
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground sm:col-span-2">
                ชื่อรายการ
                <input
                  name="title"
                  defaultValue={item.title}
                  required
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                สถานะ
                <select
                  name="status"
                  defaultValue={item.status}
                  className={fieldClass}
                >
                  {Object.entries(shoppingStatusLabels).map(
                    ([value, label]) =>
                      (item.status === "bought"
                        ? value === "bought"
                        : value !== "bought") && (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                  )}
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                ความสำคัญ
                <select
                  name="priority"
                  defaultValue={item.priority}
                  className={fieldClass}
                >
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                ห้อง
                <select
                  name="room_id"
                  defaultValue={item.room_id ?? ""}
                  className={fieldClass}
                >
                  <option value="">{commonText.noRoom}</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                โปรเจกต์รีโนเวท
                <select
                  name="renovation_project_id"
                  defaultValue={item.renovation_project_id ?? ""}
                  className={fieldClass}
                >
                  <option value="">{commonText.noProject}</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                ราคาประเมิน
                <input
                  name="estimated_price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={(item.estimated_price_minor ?? 0) / 100}
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                ราคาจริง
                <input
                  name="actual_price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={(item.actual_price_minor ?? 0) / 100}
                  readOnly={item.status === "bought"}
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                ร้านหรือผู้ขาย
                <input
                  name="vendor"
                  defaultValue={item.vendor ?? ""}
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                ลิงก์สินค้า
                <input
                  name="product_url"
                  type="url"
                  defaultValue={item.product_url ?? ""}
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground sm:col-span-2">
                บันทึก
                <textarea
                  name="notes"
                  defaultValue={item.notes ?? ""}
                  rows={3}
                  className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <div className="flex justify-end gap-2 border-t pt-4 sm:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" pendingText="กำลังบันทึก...">
                  บันทึกการแก้ไข
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
