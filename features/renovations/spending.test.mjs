import assert from "node:assert/strict";
import { getRenovationActualAmount } from "./spending.ts";

const expenses = [
  { renovation_project_id: "electric", amount_minor: 3570000 },
  { renovation_project_id: "kitchen", amount_minor: 1200000 },
  { renovation_project_id: null, amount_minor: 9999999 },
];

assert.equal(getRenovationActualAmount(expenses), 4770000);
assert.equal(getRenovationActualAmount(expenses, "electric"), 3570000);
