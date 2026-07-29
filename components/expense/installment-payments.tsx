"use client";

import { useState } from "react";
import type { ExpenseInstallmentPayment } from "@/features/expenses/queries";
import {
  getInstallmentPaidAmount,
  getInstallmentRemainingAmount,
} from "@/lib/installments";
import { formatDate, formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitLoadingOverlay } from "@/components/ui/loading-overlay";

export function InstallmentPayments({
  expenseId,
  homeId,
  totalMinor,
  currency,
  isPaid,
  installmentAmountMinor,
  payments,
  today,
  addAction,
  updateAction,
  deleteAction,
}: {
  expenseId: string;
  homeId: string;
  totalMinor: number;
  currency: string;
  isPaid: boolean;
  installmentAmountMinor: number | null;
  payments: ExpenseInstallmentPayment[];
  today: string;
  addAction: (formData: FormData) => void;
  updateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
}) {
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const paidMinor = getInstallmentPaidAmount(payments);
  const remainingMinor = getInstallmentRemainingAmount(totalMinor, payments);
  const suggestedMinor = Math.min(
    remainingMinor,
    installmentAmountMinor ?? remainingMinor,
  );

  return (
    <details className="mt-3 rounded-md border bg-secondary/20 p-3">
      <summary className="cursor-pointer list-none text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        {payments.length
          ? `จ่ายเป็นงวด · จ่ายแล้ว ${formatMoney(paidMinor, currency)} · ค้างอีก ${formatMoney(remainingMinor, currency)}`
          : "จ่ายเป็นงวด · บันทึกวันที่และยอดที่จ่าย"}
      </summary>

      <div className="mt-3 grid gap-2">
        {payments.length ? (
          payments.map((payment) => {
            const editing = editingPaymentId === payment.id;
            const maxAmountMinor =
              totalMinor - (paidMinor - payment.amount_minor);
            const handleUpdate = async (formData: FormData) => {
              await updateAction(formData);
              setEditingPaymentId(null);
            };

            return (
              <div
                key={payment.id}
                className="rounded-md border bg-white p-3 text-sm"
              >
                {editing ? (
                  <form
                    action={handleUpdate}
                    className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                  >
                    <input
                      type="hidden"
                      name="payment_id"
                      value={payment.id}
                    />
                    <input type="hidden" name="expense_id" value={expenseId} />
                    <input type="hidden" name="home_id" value={homeId} />
                    <div className="space-y-2">
                      <Label htmlFor={`edit-payment-date-${payment.id}`}>
                        วันที่จ่าย
                      </Label>
                      <Input
                        id={`edit-payment-date-${payment.id}`}
                        name="payment_date"
                        type="date"
                        defaultValue={payment.payment_date}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-payment-amount-${payment.id}`}>
                        จำนวนเงิน
                      </Label>
                      <Input
                        id={`edit-payment-amount-${payment.id}`}
                        name="amount"
                        type="number"
                        min="0.01"
                        max={maxAmountMinor / 100}
                        step="0.01"
                        defaultValue={payment.amount_minor / 100}
                        required
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPaymentId(null)}
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        pendingText="กำลังบันทึก..."
                      >
                        บันทึก
                      </Button>
                    </div>
                    <SubmitLoadingOverlay label="กำลังแก้ไขงวดที่จ่าย" />
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="min-w-28 text-muted-foreground">
                      {formatDate(payment.payment_date)}
                    </span>
                    <span className="ml-auto font-semibold">
                      {formatMoney(payment.amount_minor, currency)}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPaymentId(payment.id)}
                    >
                      แก้ไข
                    </Button>
                    <form action={deleteAction}>
                      <input
                        type="hidden"
                        name="payment_id"
                        value={payment.id}
                      />
                      <input type="hidden" name="expense_id" value={expenseId} />
                      <input type="hidden" name="home_id" value={homeId} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        pendingText="กำลังลบ..."
                      >
                        ลบ
                      </Button>
                      <SubmitLoadingOverlay label="กำลังลบงวดที่จ่าย" />
                    </form>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-xs text-muted-foreground">
            {isPaid
              ? "รายการนี้ตั้งสถานะเป็นจ่ายแล้ว หากบันทึกงวด ระบบจะเปลี่ยนเป็นกำลังจ่าย"
              : "ยังไม่มีประวัติการจ่ายงวด"}
          </p>
        )}

        {remainingMinor > 0 ? (
          <form
            action={addAction}
            className="mt-1 grid gap-3 rounded-md border bg-white p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <input type="hidden" name="expense_id" value={expenseId} />
            <input type="hidden" name="home_id" value={homeId} />
            <div className="space-y-2">
              <Label htmlFor={`installment-payment-date-${expenseId}`}>
                วันที่จ่าย
              </Label>
              <Input
                id={`installment-payment-date-${expenseId}`}
                name="payment_date"
                type="date"
                defaultValue={today}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`installment-payment-amount-${expenseId}`}>
                จำนวนเงิน
              </Label>
              <Input
                id={`installment-payment-amount-${expenseId}`}
                name="amount"
                type="number"
                min="0.01"
                max={remainingMinor / 100}
                step="0.01"
                defaultValue={suggestedMinor / 100}
                required
              />
            </div>
            <Button type="submit">บันทึกงวด</Button>
            <SubmitLoadingOverlay label="กำลังบันทึกงวดที่จ่าย" />
          </form>
        ) : (
          <p className="text-sm font-semibold text-primary">ชำระครบแล้ว</p>
        )}
      </div>
    </details>
  );
}
