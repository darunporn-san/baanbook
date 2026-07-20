"use client";

import { useState } from "react";
import type { Expense } from "@/features/expenses/queries";
import type { Room } from "@/features/rooms/queries";
import {
  expenseCategoryGroups,
  getExpenseCategoryLabel,
} from "@/features/expenses/categories";
import { commonText } from "@/lib/labels";
import { formatDate, formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ExpenseRow({
  expense,
  rooms,
  appointmentDone = false,
  updateAction,
  deleteAction,
}: {
  expense: Expense;
  rooms: Room[];
  appointmentDone?: boolean;
  updateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
}) {
  const [editing, setEditing] = useState(false);
  const roomName = rooms.find((room) => room.id === expense.room_id)?.name;
  const appointmentText = [
    expense.appointment_date ? formatDate(expense.appointment_date) : null,
    expense.appointment_time || null,
  ]
    .filter(Boolean)
    .join(" ");

  if (editing) {
    return (
      <form action={updateAction} className="grid gap-5 p-5">
        <input type="hidden" name="id" value={expense.id} />
        <input type="hidden" name="home_id" value={expense.home_id} />
        <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold">แก้ไขค่าใช้จ่าย</p>
            <p className="text-xs text-muted-foreground">
              ปรับรายละเอียด หมวด วันที่ และห้องที่เกี่ยวข้อง
            </p>
          </div>
          <p className="text-xl font-semibold text-primary">
            {formatMoney(expense.amount_minor, expense.currency)}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
          <div className="space-y-2">
            <Label htmlFor={`expense-title-${expense.id}`}>รายการ</Label>
            <Input
              id={`expense-title-${expense.id}`}
              name="title"
              defaultValue={expense.title}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`expense-amount-${expense.id}`}>จำนวนเงิน</Label>
            <Input
              id={`expense-amount-${expense.id}`}
              name="amount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={expense.amount_minor / 100}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor={`expense-date-${expense.id}`}>วันที่</Label>
            <Input
              id={`expense-date-${expense.id}`}
              name="expense_date"
              type="date"
              defaultValue={expense.expense_date}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`expense-category-${expense.id}`}>หมวดหมู่</Label>
            <select
              id={`expense-category-${expense.id}`}
              name="category"
              defaultValue={expense.category}
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
            <Label htmlFor={`expense-room-${expense.id}`}>ห้อง</Label>
            <select
              id={`expense-room-${expense.id}`}
              name="room_id"
              defaultValue={expense.room_id ?? ""}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`expense-appointment-date-${expense.id}`}>
              วันที่นัดหมาย
            </Label>
            <Input
              id={`expense-appointment-date-${expense.id}`}
              name="appointment_date"
              type="date"
              defaultValue={expense.appointment_date ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`expense-appointment-time-${expense.id}`}>
              เวลานัดหมาย
            </Label>
            <Input
              id={`expense-appointment-time-${expense.id}`}
              name="appointment_time"
              type="time"
              defaultValue={expense.appointment_time ?? ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`expense-notes-${expense.id}`}>
            รายละเอียดเพิ่มเติม
          </Label>
          <Input
            id={`expense-notes-${expense.id}`}
            name="notes"
            defaultValue={expense.notes ?? ""}
            placeholder="เช่น รายละเอียดงาน ใบเสนอราคา ผู้รับเหมา หรือเงื่อนไขการชำระ"
          />
        </div>

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
    <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="grid gap-3">
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
          <p className="mt-1 text-2xl font-semibold text-primary">
            {formatMoney(expense.amount_minor, expense.currency)}
          </p>
          {expense.notes ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {expense.notes}
            </p>
          ) : null}
        </div>
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
          <input type="hidden" name="id" value={expense.id} />
          <input type="hidden" name="home_id" value={expense.home_id} />
          <Button variant="ghost" size="sm">
            {commonText.delete}
          </Button>
        </form>
      </div>
    </div>
  );
}
