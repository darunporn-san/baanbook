export function getInstallmentEndDate(
  startDate: string | null | undefined,
  months: number | null | undefined,
) {
  if (!startDate || !Number.isInteger(months) || (months ?? 0) < 1) return null;

  const [year, month, day] = startDate.split("-").map(Number);
  if (!year || !month || !day) return null;

  const targetMonth = month - 1 + months! - 1;
  const lastDay = new Date(Date.UTC(year, targetMonth + 1, 0)).getUTCDate();
  const endDate = new Date(Date.UTC(year, targetMonth, Math.min(day, lastDay)));

  return endDate.toISOString().slice(0, 10);
}

export function isInstallmentDone(
  endDate: string | null | undefined,
  today: string,
) {
  return Boolean(endDate && endDate < today);
}

export function isMonthlyInstallmentDone(
  paymentPlanType: string | null,
  installmentMonths: number | null,
  endDate: string | null,
  today: string,
) {
  return Boolean(
    (paymentPlanType === "monthly" || installmentMonths !== null) &&
      isInstallmentDone(endDate, today),
  );
}

export function isInstallmentDueInMonth(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  month: string,
) {
  return Boolean(
    startDate &&
    endDate &&
    startDate.slice(0, 7) <= month &&
    endDate.slice(0, 7) >= month,
  );
}

export function getInstallmentPaidAmount(
  payments: ReadonlyArray<{ amount_minor: number }>,
) {
  return payments.reduce((sum, payment) => sum + payment.amount_minor, 0);
}

export function getInstallmentRemainingAmount(
  totalMinor: number,
  payments: ReadonlyArray<{ amount_minor: number }>,
) {
  return Math.max(0, totalMinor - getInstallmentPaidAmount(payments));
}
