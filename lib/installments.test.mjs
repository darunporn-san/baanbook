import assert from "node:assert/strict";
import {
  getInstallmentEndDate,
  getInstallmentPaidAmount,
  getInstallmentRemainingAmount,
  isInstallmentDone,
  isInstallmentDueInMonth,
  isMonthlyInstallmentDone,
} from "./installments.ts";

assert.equal(getInstallmentEndDate("2026-07-23", 1), "2026-07-23");
assert.equal(getInstallmentEndDate("2026-07-23", 10), "2027-04-23");
assert.equal(getInstallmentEndDate("2026-01-31", 2), "2026-02-28");
assert.equal(isInstallmentDone("2026-07-23", "2026-07-23"), false);
assert.equal(isInstallmentDone("2026-07-23", "2026-07-24"), true);
assert.equal(
  isMonthlyInstallmentDone("monthly", 10, "2027-04-23", "2026-07-29"),
  false,
);
assert.equal(
  isMonthlyInstallmentDone("monthly", 10, "2027-04-23", "2027-04-24"),
  true,
);
assert.equal(
  isInstallmentDueInMonth("2026-07-23", "2027-04-23", "2026-07"),
  true,
);
assert.equal(
  isInstallmentDueInMonth("2026-07-23", "2027-04-23", "2027-05"),
  false,
);
const payments = [{ amount_minor: 250000 }, { amount_minor: 125000 }];
assert.equal(getInstallmentPaidAmount(payments), 375000);
assert.equal(getInstallmentRemainingAmount(1000000, payments), 625000);
assert.equal(getInstallmentRemainingAmount(300000, payments), 0);
