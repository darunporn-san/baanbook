import assert from "node:assert/strict";
import {
  getInstallmentEndDate,
  isInstallmentDone,
  isInstallmentDueInMonth,
} from "./installments.ts";

assert.equal(getInstallmentEndDate("2026-07-23", 1), "2026-07-23");
assert.equal(getInstallmentEndDate("2026-07-23", 10), "2027-04-23");
assert.equal(getInstallmentEndDate("2026-01-31", 2), "2026-02-28");
assert.equal(isInstallmentDone("2026-07-23", "2026-07-23"), false);
assert.equal(isInstallmentDone("2026-07-23", "2026-07-24"), true);
assert.equal(
  isInstallmentDueInMonth("2026-07-23", "2027-04-23", "2026-07"),
  true,
);
assert.equal(
  isInstallmentDueInMonth("2026-07-23", "2027-04-23", "2027-05"),
  false,
);
