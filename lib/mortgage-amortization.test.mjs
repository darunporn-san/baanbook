import assert from "node:assert/strict";
import {
  adjustMortgageScheduleForPayments,
  calculateMortgageInterestSavings,
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
    { annualInterestRate: 12, paymentMinor: 1_010_000 },
  ]),
  1_000,
);

const schedule = calculateMortgageSchedule({
  principalMinor: 10_000_000,
  termMonths: 24,
  startDate: "2026-01-31",
  cycles: [
    { id: "cycle-1", cycle_number: 1, start_date: "2026-01-31" },
    { id: "cycle-2", cycle_number: 2, start_date: "2027-01-31" },
  ],
  terms: [
    {
      mortgage_rate_cycle_id: "cycle-1",
      loan_year: 1,
      annual_interest_rate: 12,
      monthly_payment_minor: 500_000,
    },
    {
      mortgage_rate_cycle_id: "cycle-2",
      loan_year: 1,
      annual_interest_rate: 6,
      monthly_payment_minor: 500_000,
    },
  ],
});

assert.equal(schedule[0].dueDate, "2026-01-31");
assert.equal(schedule[0].interestMinor, 100_000);
assert.equal(schedule[0].principalMinor, 400_000);
assert.equal(schedule[0].balanceMinor, 9_600_000);
assert.equal(schedule[12].cycleNumber, 2);
assert.equal(schedule[12].annualInterestRate, 6);

const adjusted = adjustMortgageScheduleForPayments({
  principalMinor: 10_000_000,
  schedule,
  payments: [
    {
      payment_date: "2026-01-31",
      amount_minor: 700_000,
      principal_minor: 600_000,
      interest_minor: 100_000,
    },
  ],
});

assert.equal(adjusted[0].extraPaymentMinor, 200_000);
assert.equal(adjusted[0].adjustedBalanceMinor, 9_400_000);
assert.equal(adjusted[1].adjustedInterestMinor, 94_000);
