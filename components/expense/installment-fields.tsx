"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInstallmentEndDate } from "@/lib/installments";

export function InstallmentFields({
  idPrefix,
  defaultMonths,
  defaultAmountMinor,
  defaultStartDate,
  defaultEndDate,
  defaultPaymentPlanType,
}: {
  idPrefix: string;
  defaultMonths?: number | null;
  defaultAmountMinor?: number | null;
  defaultStartDate?: string | null;
  defaultEndDate?: string | null;
  defaultPaymentPlanType?: "monthly" | "staged" | null;
}) {
  const monthsRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const [endDate, setEndDate] = useState(defaultEndDate ?? "");
  const [paymentPlanType, setPaymentPlanType] = useState<"monthly" | "staged">(
    defaultPaymentPlanType ?? "monthly",
  );

  const calculateMonthlyAmount = useCallback(() => {
    const totalAmount = monthsRef.current?.form?.elements.namedItem("amount");
    const months = monthsRef.current?.valueAsNumber;

    if (
      !(totalAmount instanceof HTMLInputElement) ||
      !Number.isFinite(totalAmount.valueAsNumber) ||
      !Number.isInteger(months) ||
      (months ?? 0) <= 0
    ) {
      if (amountRef.current) amountRef.current.value = "";
      return;
    }

    if (amountRef.current) {
      amountRef.current.value = (totalAmount.valueAsNumber / months!).toFixed(
        2,
      );
    }
  }, []);

  const calculateEndDate = useCallback(() => {
    const endDate = getInstallmentEndDate(
      startDateRef.current?.value,
      monthsRef.current?.valueAsNumber,
    );
    setEndDate(endDate ?? "");
  }, []);

  useEffect(() => {
    const totalAmount = monthsRef.current?.form?.elements.namedItem("amount");
    if (!(totalAmount instanceof HTMLInputElement)) return;

    totalAmount.addEventListener("input", calculateMonthlyAmount);
    return () =>
      totalAmount.removeEventListener("input", calculateMonthlyAmount);
  }, [calculateMonthlyAmount]);

  useEffect(() => {
    if (!defaultEndDate) calculateEndDate();
  }, [calculateEndDate, defaultEndDate]);

  return (
    <details className="rounded-md border bg-secondary/20 p-3">
      <summary className="cursor-pointer list-none text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        การผ่อนชำระ (ถ้ามี)
      </summary>
      <p className="mt-1 text-xs text-muted-foreground">
        เลือกผ่อนรายเดือน หรือแบ่งจ่ายเป็นงวดตามความคืบหน้า
      </p>
      <div className="mt-3 flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="payment_plan_type"
            value="monthly"
            checked={paymentPlanType === "monthly"}
            onChange={() => setPaymentPlanType("monthly")}
          />
          เป็นเดือน
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="payment_plan_type"
            value="staged"
            checked={paymentPlanType === "staged"}
            onChange={() => setPaymentPlanType("staged")}
          />
          เป็นงวด
        </label>
      </div>

      {paymentPlanType === "monthly" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-months`}>จำนวนเดือน</Label>
            <Input
              ref={monthsRef}
              id={`${idPrefix}-months`}
              name="installment_months"
              type="number"
              step="1"
              min="1"
              defaultValue={defaultMonths ?? ""}
              placeholder="เช่น 10"
              onInput={() => {
                calculateMonthlyAmount();
                calculateEndDate();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-amount`}>ยอดต่อเดือน</Label>
            <Input
              ref={amountRef}
              id={`${idPrefix}-amount`}
              name="installment_amount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={
                defaultAmountMinor == null ? "" : defaultAmountMinor / 100
              }
              placeholder="บาท/เดือน"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-start-date`}>วันเริ่มจ่าย</Label>
            <Input
              ref={startDateRef}
              id={`${idPrefix}-start-date`}
              name="installment_start_date"
              type="date"
              defaultValue={defaultStartDate ?? ""}
              onInput={calculateEndDate}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-end-date`}>วันสิ้นสุด</Label>
            <Input
              id={`${idPrefix}-end-date`}
              name="installment_end_date"
              type="date"
              value={endDate}
              readOnly
              className="bg-muted/50"
            />
          </div>
        </div>
      ) : (
        <p className="mt-3 rounded-md bg-white p-3 text-sm text-muted-foreground">
          หลังบันทึกรายการ สามารถเพิ่มวันที่และยอดที่จ่ายแต่ละงวด
          ระบบจะคำนวณยอดค้างให้อัตโนมัติ
        </p>
      )}
    </details>
  );
}
