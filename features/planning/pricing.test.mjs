import assert from "node:assert/strict";
import { installationTotal, priceTotal } from "./pricing.ts";

assert.equal(priceTotal(15000, 3, "per_unit"), 45000);
assert.equal(priceTotal(15000, 3, "total"), 15000);
assert.equal(installationTotal(true, 20000, 3, "per_unit"), 60000);
assert.equal(installationTotal(false, 20000, 3, "per_unit"), 0);
