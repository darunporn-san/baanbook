export type MortgageScheduleRow = {
  installment: number;
  dueDate: string;
  cycleNumber: number;
  loanYear: number;
  annualInterestRate: number;
  paymentMinor: number;
  principalMinor: number;
  interestMinor: number;
  balanceMinor: number;
};

export type AdjustedMortgageScheduleRow = MortgageScheduleRow & {
  actualPaymentMinor: number | null;
  extraPaymentMinor: number;
  adjustedPaymentMinor: number;
  adjustedPrincipalMinor: number;
  adjustedInterestMinor: number;
  adjustedBalanceMinor: number;
  balanceBeforeMinor: number;
};

type RateCycle = {
  id: string;
  cycle_number: number;
  start_date: string;
};

type YearlyTerm = {
  mortgage_rate_cycle_id: string;
  loan_year: number;
  annual_interest_rate: number;
  monthly_payment_minor: number | null;
};

function addMonths(value: string, months: number) {
  const [year, month, day] = value.split("-").map(Number);
  const targetMonth = month - 1 + months;
  const lastDay = new Date(Date.UTC(year, targetMonth + 1, 0)).getUTCDate();
  return new Date(
    Date.UTC(year, targetMonth, Math.min(day, lastDay)),
  )
    .toISOString()
    .slice(0, 10);
}

function monthDifference(from: string, to: string) {
  const [fromYear, fromMonth] = from.split("-").map(Number);
  const [toYear, toMonth] = to.split("-").map(Number);
  return (toYear - fromYear) * 12 + toMonth - fromMonth;
}

export function calculateMortgageSchedule({
  principalMinor,
  termMonths,
  startDate,
  cycles,
  terms,
}: {
  principalMinor: number;
  termMonths: number;
  startDate: string;
  cycles: RateCycle[];
  terms: YearlyTerm[];
}) {
  if (
    principalMinor <= 0 ||
    termMonths <= 0 ||
    !startDate ||
    !cycles.length ||
    !terms.length
  ) {
    return [];
  }

  const orderedCycles = [...cycles].sort((a, b) =>
    a.start_date.localeCompare(b.start_date),
  );
  const rows: MortgageScheduleRow[] = [];
  let balanceMinor = principalMinor;

  for (let installment = 1; installment <= termMonths; installment += 1) {
    const dueDate = addMonths(startDate, installment);
    const cycle =
      orderedCycles.filter((item) => item.start_date <= dueDate).at(-1) ??
      orderedCycles[0];
    const loanYear = Math.min(
      4,
      Math.floor(
        Math.max(0, monthDifference(cycle.start_date, dueDate)) / 12,
      ) + 1,
    );
    const term = terms.find(
      (item) =>
        item.mortgage_rate_cycle_id === cycle.id &&
        item.loan_year === loanYear,
    );

    if (!term?.monthly_payment_minor) break;

    const interestMinor = Math.round(
      (balanceMinor * term.annual_interest_rate) / 1200,
    );
    const paymentMinor = Math.min(
      term.monthly_payment_minor,
      balanceMinor + interestMinor,
    );
    const principalPaymentMinor = paymentMinor - interestMinor;
    balanceMinor = Math.max(
      0,
      balanceMinor - principalPaymentMinor,
    );

    rows.push({
      installment,
      dueDate,
      cycleNumber: cycle.cycle_number,
      loanYear,
      annualInterestRate: term.annual_interest_rate,
      paymentMinor,
      principalMinor: principalPaymentMinor,
      interestMinor,
      balanceMinor,
    });

    if (balanceMinor === 0) break;
  }

  return rows;
}

export function adjustMortgageScheduleForPayments({
  principalMinor,
  schedule,
  payments,
}: {
  principalMinor: number;
  schedule: MortgageScheduleRow[];
  payments: {
    payment_date: string;
    amount_minor: number;
    principal_minor: number | null;
    interest_minor: number | null;
  }[];
}) {
  const orderedPayments = [...payments].sort((a, b) =>
    a.payment_date.localeCompare(b.payment_date),
  );
  let balanceMinor = principalMinor;

  // ponytail: payments have no installment id, so chronological order maps them
  // to installments until irregular/multiple payments per installment are needed.
  return schedule.map<AdjustedMortgageScheduleRow>((row, index) => {
    const payment = orderedPayments[index];
    const balanceBeforeMinor = balanceMinor;
    const expectedInterestMinor = Math.round(
      (balanceMinor * row.annualInterestRate) / 1200,
    );
    const scheduledPaymentMinor = Math.min(
      row.paymentMinor,
      balanceMinor + expectedInterestMinor,
    );
    const actualPaymentMinor = payment?.amount_minor ?? null;
    const adjustedPaymentMinor =
      actualPaymentMinor ?? scheduledPaymentMinor;
    const adjustedInterestMinor =
      payment?.interest_minor ??
      Math.min(adjustedPaymentMinor, expectedInterestMinor);
    const adjustedPrincipalMinor =
      payment?.principal_minor ??
      Math.max(0, adjustedPaymentMinor - adjustedInterestMinor);
    const extraPaymentMinor = payment
      ? Math.max(0, adjustedPaymentMinor - row.paymentMinor)
      : 0;

    balanceMinor = Math.max(0, balanceMinor - adjustedPrincipalMinor);

    return {
      ...row,
      actualPaymentMinor,
      extraPaymentMinor,
      adjustedPaymentMinor,
      adjustedPrincipalMinor,
      adjustedInterestMinor,
      adjustedBalanceMinor: balanceMinor,
      balanceBeforeMinor,
    };
  });
}
