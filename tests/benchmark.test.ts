import test from "node:test";
import assert from "node:assert/strict";
import { percentile } from "../src/core/benchmark.js";

test("percentile returns expected values", () => {
  const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  assert.equal(percentile(values, 50), 50);
  assert.equal(percentile(values, 95), 100);
});

test("percentile handles empty arrays", () => {
  assert.equal(percentile([], 50), 0);
});
