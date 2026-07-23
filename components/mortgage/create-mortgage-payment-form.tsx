"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { createMortgagePayment } from "@/features/mortgage/actions";
import { formatDate, formatMoney } from "@/lib/format";
import {
  calculateMortgageInterestSavings,
  type AdjustedMortgageScheduleRow,
  type MortgageScheduleRow,
} from "@/lib/mortgage-amortization";

export function CreateMortgagePaymentForm({
  homeId,
  profileId,
  currency,
  suggestion,
  futureSchedule,
}: {
  homeId: string;
  profileId: string;
  currency: string;
  suggestion?: AdjustedMortgageScheduleRow;
  futureSchedule: Pick<
    MortgageScheduleRow,
    "annualInterestRate" | "paymentMinor"
  >[];
}) {
  const [mode, setMode] = useState<"scheduled" | "custom">(
    suggestion ? "scheduled" : "custom",
  );
  const [amount, setAmount] = useState(
    suggestion ? String(suggestion.adjustedPaymentMinor / 100) : "",
  );
  const amountMinor = Math.max(
    0,
    Math.round((Number(amount) || 0) * 100),
  );
  const interestMinor = suggestion
    ? Math.min(amountMinor, suggestion.adjustedInterestMinor)
    : 0;
  const principalMinor = Math.max(0, amountMinor - interestMinor);
  const extraMinor = suggestion
    ? Math.max(0, amountMinor - suggestion.paymentMinor)
    : 0;
  const balanceAfterMinor = suggestion
    ? Math.max(0, suggestion.balanceBeforeMinor - principalMinor)
    : 0;
  const scheduledBalanceAfterMinor = suggestion
    ? Math.max(
        0,
        suggestion.balanceBeforeMinor -
          (suggestion.paymentMinor - suggestion.adjustedInterestMinor),
      )
    : 0;
  const interestSavingsMinor = calculateMortgageInterestSavings(
    scheduledBalanceAfterMinor,
    extraMinor,
    futureSchedule,
  );

  return (
    <form action={createMortgagePayment} className="grid gap-4">
      <input type="hidden" name="home_id" value={homeId} />
      <input type="hidden" name="mortgage_profile_id" value={profileId} />

      {suggestion ? (
        <div className="rounded-lg bg-primary/10 p-3">
          <p className="text-sm font-semibold text-primary">
            งวดที่ {suggestion.installment} · {formatDate(suggestion.dueDate)}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span>
              ยอดตามงวด {formatMoney(suggestion.paymentMinor, currency)}
            </span>
            <span>
              ดอกเบี้ย{" "}
              {formatMoney(suggestion.adjustedInterestMinor, currency)}
            </span>
          </div>
        </div>
      ) : null}

      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="mb-2 text-xs font-medium">วิธีชำระ</legend>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm">
          <input
            type="radio"
            name="payment_mode"
            value="scheduled"
            checked={mode === "scheduled"}
            disabled={!suggestion}
            onChange={() => {
              setMode("scheduled");
              setAmount(
                suggestion
                  ? String(suggestion.adjustedPaymentMinor / 100)
                  : "",
              );
            }}
          />
          จ่ายตามยอด
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm">
          <input
            type="radio"
            name="payment_mode"
            value="custom"
            checked={mode === "custom"}
            onChange={() => setMode("custom")}
          />
          กำหนดยอดเอง
        </label>
      </fieldset>

      <label className="grid min-w-0 gap-1.5 text-xs font-medium">
        วันที่ชำระ
        <DateInput
          name="payment_date"
          defaultValue={suggestion?.dueDate}
          required
        />
      </label>
      <label className="grid min-w-0 gap-1.5 text-xs font-medium">
        ยอดชำระ
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          max={
            suggestion
              ? (suggestion.balanceBeforeMinor +
                  suggestion.adjustedInterestMinor) /
                100
              : undefined
          }
          value={amount}
          readOnly={mode === "scheduled"}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="ยอดชำระ"
          required
          className="h-10 min-w-0 w-full rounded-md border bg-background px-3 text-sm font-normal read-only:bg-muted/50"
        />
      </label>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <label className="grid min-w-0 gap-1.5 text-xs font-medium">
          เงินต้น
          <input
            name="principal"
            type="number"
            step="0.01"
            min="0"
            value={principalMinor / 100}
            readOnly
            className="h-10 min-w-0 w-full rounded-md border bg-muted/50 px-3 text-sm font-normal"
          />
        </label>
        <label className="grid min-w-0 gap-1.5 text-xs font-medium">
          ดอกเบี้ย
          <input
            name="interest"
            type="number"
            step="0.01"
            min="0"
            value={interestMinor / 100}
            readOnly
            className="h-10 min-w-0 w-full rounded-md border bg-muted/50 px-3 text-sm font-normal"
          />
        </label>
      </div>

      {suggestion ? (
        <div className="grid grid-cols-2 gap-3 rounded-lg border bg-secondary/20 p-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">ยอดโป๊ะ</p>
            <p className="mt-1 font-semibold text-[#b84e40]">
              {formatMoney(extraMinor, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">คงเหลือหลังชำระ</p>
            <p className="mt-1 font-semibold text-primary">
              {formatMoney(balanceAfterMinor, currency)}
            </p>
          </div>
          <div className="col-span-2 border-t pt-3">
            <p className="text-xs text-muted-foreground">
              ดอกเบี้ยลดลงโดยประมาณ
            </p>
            <p className="mt-1 font-semibold text-emerald-700">
              {formatMoney(interestSavingsMinor, currency)}
            </p>
          </div>
        </div>
      ) : null}

      <label className="grid gap-1.5 text-xs font-medium">
        บันทึก
        <textarea
          name="notes"
          placeholder="รายละเอียดเพิ่มเติม"
          rows={3}
          className="min-h-24 resize-y rounded-md border bg-background px-3 py-2 text-sm font-normal"
        />
      </label>
      <Button type="submit" pendingText="กำลังบันทึก...">
        เพิ่มรายการชำระ
      </Button>
    </form>
  );
}
