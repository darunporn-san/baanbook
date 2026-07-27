import assert from "node:assert/strict";
import {
  adjustMortgageScheduleForPayments,
  calculateMortgageInterestSavings,
  calculateMortgagePayoffDate,
  calculateMortgageSchedule,
  getMortgageDueRowStatus,
} from "./mortgage-amortization.ts";

assert.equal(
  getMortgageDueRowStatus("2026-07-31", "2026-07-23"),
  "current-month",
);
assert.equal(
  getMortgageDueRowStatus("2026-07-31", "2026-07-28"),
  "urgent",
);
assert.equal(getMortgageDueRowStatus("2026-08-01", "2026-07-29"), "urgent");
assert.equal(
  calculateMortgageInterestSavings(1_000_000, 100_000, [
    { annualInterestRate: 12, interestDays: 30, paymentMinor: 1_010_000 },
  ]),
  986,
);
assert.equal(
  calculateMortgagePayoffDate(1_000_000, [
    {
      annualInterestRate: 12,
      dueDate: "2026-08-31",
      interestDays: 30,
      paymentMinor: 600_000,
    },
    {
      annualInterestRate: 12,
      dueDate: "2026-09-30",
      interestDays: 30,
      paymentMinor: 600_000,
    },
  ]),
  "2026-09-30",
);

const schedule = calculateMortgageSchedule({
  principalMinor: 270_000_000,
  termMonths: 24,
  startDate: "2026-07-22",
  paymentDueDay: 31,
  cycles: [
    { id: "cycle-1", cycle_number: 1, start_date: "2026-07-22" },
  ],
  terms: [
    {
      mortgage_rate_cycle_id: "cycle-1",
      loan_year: 1,
      annual_interest_rate: 2.19,
      monthly_payment_minor: 880_000,
    },
    {
      mortgage_rate_cycle_id: "cycle-1",
      loan_year: 2,
      annual_interest_rate: 2.19,
      monthly_payment_minor: 880_000,
    },
  ],
});

assert.equal(schedule[0].dueDate, "2026-07-31");
assert.equal(schedule[0].interestDays, 9);
assert.equal(schedule[0].interestMinor, 145_800);
assert.equal(schedule[0].principalMinor, 734_200);
assert.equal(schedule[0].balanceMinor, 269_265_800);
assert.equal(schedule[1].dueDate, "2026-08-31");
assert.equal(schedule[1].interestMinor, 500_834);
assert.equal(schedule[1].principalMinor, 379_166);
assert.equal(schedule[1].balanceMinor, 268_886_634);
assert.equal(schedule[2].dueDate, "2026-09-30");
assert.equal(schedule[2].interestMinor, 483_996);
assert.equal(schedule[2].principalMinor, 396_004);
assert.equal(schedule[2].balanceMinor, 268_490_630);

const adjusted = adjustMortgageScheduleForPayments({
  principalMinor: 270_000_000,
  schedule,
  payments: [
    {
      payment_date: "2026-07-31",
      amount_minor: 1_000_000,
      principal_minor: 854_200,
      interest_minor: 145_800,
    },
  ],
});

assert.equal(adjusted[0].extraPaymentMinor, 120_000);
assert.equal(adjusted[0].adjustedBalanceMinor, 269_145_800);
assert.equal(adjusted[1].adjustedInterestMinor, 500_611);
