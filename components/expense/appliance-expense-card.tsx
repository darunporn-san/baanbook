"use client";

import { useState } from "react";
import type { Appliance } from "@/features/appliances/queries";
import type { Expense } from "@/features/expenses/queries";
import type { Room } from "@/features/rooms/queries";
import { getExpenseCategoryLabel } from "@/features/expenses/categories";
import { commonText } from "@/lib/labels";
import { formatDate, formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ApplianceExpenseCard({
  expense,
  appliance,
  rooms,
  appointmentDone = false,
  updateAction,
  deleteAction,
}: {
  expense: Expense | null;
  appliance?: Appliance;
  rooms: Room[];
  appointmentDone?: boolean;
  updateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
}) {
  const [editing, setEditing] = useState(false);
  const homeId = expense?.home_id ?? appliance?.home_id ?? "";
  const roomId = expense?.room_id ?? appliance?.room_id ?? "";
  const roomName = rooms.find((room) => room.id === roomId)?.name;
  const appointmentText = [
    expense?.appointment_date ? formatDate(expense.appointment_date) : null,
    expense?.appointment_time || null,
  ]
    .filter(Boolean)
    .join(" ");

  if (editing) {
    return (
      <form action={updateAction} className="grid gap-5 p-5">
        <input type="hidden" name="expense_id" value={expense?.id ?? ""} />
        <input type="hidden" name="appliance_id" value={appliance?.id ?? ""} />
        <input type="hidden" name="home_id" value={homeId} />

        <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold">แก้ไขเครื่องใช้ไฟฟ้า</p>
            <p className="text-xs text-muted-foreground">
              แก้ค่าใช้จ่าย รายละเอียดเครื่อง และประกันในฟอร์มเดียว
            </p>
          </div>
          {expense ? (
            <p className="text-xl font-semibold text-primary">
              {formatMoney(expense.amount_minor, expense.currency)}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
          <div className="space-y-2">
            <Label
              htmlFor={`appliance-expense-title-${expense?.id ?? appliance?.id}`}
            >
              รายการค่าใช้จ่าย
            </Label>
            <Input
              id={`appliance-expense-title-${expense?.id ?? appliance?.id}`}
              name="title"
              defaultValue={expense?.title ?? appliance?.name ?? ""}
            />
          </div>
          {expense ? (
            <div className="space-y-2">
              <Label htmlFor={`appliance-expense-amount-${expense.id}`}>
                จำนวนเงิน
              </Label>
              <Input
                id={`appliance-expense-amount-${expense.id}`}
                name="amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={expense.amount_minor / 100}
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {expense ? (
            <div className="space-y-2">
              <Label htmlFor={`appliance-expense-date-${expense.id}`}>
                วันที่จ่าย
              </Label>
              <Input
                id={`appliance-expense-date-${expense.id}`}
                name="expense_date"
                type="date"
                defaultValue={expense.expense_date}
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor={`appliance-room-${expense?.id ?? appliance?.id}`}>
              ห้อง
            </Label>
            <select
              id={`appliance-room-${expense?.id ?? appliance?.id}`}
              name="room_id"
              defaultValue={roomId}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">{commonText.noRoom}</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {expense ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`appliance-appointment-date-${expense.id}`}>
                วันที่นัดหมาย
              </Label>
              <Input
                id={`appliance-appointment-date-${expense.id}`}
                name="appointment_date"
                type="date"
                defaultValue={expense.appointment_date ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`appliance-appointment-time-${expense.id}`}>
                เวลานัดหมาย
              </Label>
              <Input
                id={`appliance-appointment-time-${expense.id}`}
                name="appointment_time"
                type="time"
                defaultValue={expense.appointment_time ?? ""}
              />
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 rounded-md border bg-secondary/20 p-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`appliance-name-${appliance?.id ?? expense?.id}`}>
              ชื่อเครื่องใช้ไฟฟ้า
            </Label>
            <Input
              id={`appliance-name-${appliance?.id ?? expense?.id}`}
              name="appliance_name"
              defaultValue={appliance?.name ?? expense?.title ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`appliance-brand-${appliance?.id ?? expense?.id}`}>
              ยี่ห้อ
            </Label>
            <Input
              id={`appliance-brand-${appliance?.id ?? expense?.id}`}
              name="brand"
              defaultValue={appliance?.brand ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`appliance-model-${appliance?.id ?? expense?.id}`}>
              รุ่น
            </Label>
            <Input
              id={`appliance-model-${appliance?.id ?? expense?.id}`}
              name="model"
              defaultValue={appliance?.model ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor={`appliance-purchase-date-${appliance?.id ?? expense?.id}`}
            >
              วันที่ซื้อ
            </Label>
            <Input
              id={`appliance-purchase-date-${appliance?.id ?? expense?.id}`}
              name="purchase_date"
              type="date"
              defaultValue={
                appliance?.purchase_date ?? expense?.expense_date ?? ""
              }
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label
              htmlFor={`appliance-warranty-end-${appliance?.id ?? expense?.id}`}
            >
              วันหมดประกัน
            </Label>
            <Input
              id={`appliance-warranty-end-${appliance?.id ?? expense?.id}`}
              name="warranty_end_date"
              type="date"
              defaultValue={appliance?.warranty_end_date ?? ""}
            />
          </div>
        </div>

        {expense ? (
          <div className="space-y-2">
            <Label htmlFor={`appliance-notes-${expense.id}`}>
              รายละเอียดเพิ่มเติม
            </Label>
            <Input
              id={`appliance-notes-${expense.id}`}
              name="notes"
              defaultValue={expense.notes ?? ""}
              placeholder="เช่น รายละเอียดงาน ใบเสนอราคา หรือข้อมูลช่าง"
            />
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing(false)}
          >
            {commonText.cancel}
          </Button>
          <Button size="sm">{commonText.save}</Button>
        </div>
      </form>
    );
  }

  return (
    <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="grid gap-3">
        {expense ? (
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#e8f5f3] px-3 py-1 text-xs font-semibold text-primary">
                {getExpenseCategoryLabel(expense.category)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(expense.expense_date)}
              </span>
              <span className="text-xs text-muted-foreground">
                {roomName ?? commonText.noRoom}
              </span>
              {appointmentText ? (
                appointmentDone ? (
                  <span className="rounded-full bg-[#e8f5f3] px-3 py-1 text-xs font-semibold text-primary">
                    Done
                  </span>
                ) : (
                  <span className="rounded-full bg-[#fff5d8] px-3 py-1 text-xs font-semibold text-[#705b2f]">
                    นัดหมาย {appointmentText}
                  </span>
                )
              ) : null}
            </div>
            <div>
              <p className="text-base font-semibold">{expense.title}</p>
              <p className="mt-1 text-xl font-semibold text-primary">
                {formatMoney(expense.amount_minor, expense.currency)}
              </p>
              {expense.notes ? (
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {expense.notes}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {appliance ? (
          <div className={expense ? "border-t pt-3" : "grid gap-2"}>
            {!expense ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#e8f5f3] px-3 py-1 text-xs font-semibold text-primary">
                    เครื่องใช้ไฟฟ้า
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {roomName ?? commonText.noRoom}
                  </span>
                </div>
                <div>
                  <p className="text-base font-semibold">{appliance.name}</p>
                  <p className="mt-1 text-xl font-semibold text-primary">
                    {formatMoney(0)}
                  </p>
                </div>
              </>
            ) : (
              <p className="font-medium">{appliance.name}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {[
                appliance.brand,
                appliance.model,
                appliance.warranty_end_date
                  ? `ประกันถึง ${formatDate(appliance.warranty_end_date)}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ") || commonText.noDetails}
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
        >
          {commonText.edit}
        </Button>
        <form action={deleteAction}>
          <input type="hidden" name="expense_id" value={expense?.id ?? ""} />
          <input
            type="hidden"
            name="appliance_id"
            value={appliance?.id ?? ""}
          />
          <input type="hidden" name="home_id" value={homeId} />
          <Button variant="ghost" size="sm">
            {commonText.delete}
          </Button>
        </form>
      </div>
    </div>
  );
}
