import test from "node:test";
import assert from "node:assert/strict";
import { parseCommonArgs, parseDuration, parseHeader } from "../src/core/args.js";

test("parseDuration supports ms, seconds and minutes", () => {
  assert.equal(parseDuration("500ms"), 500);
  assert.equal(parseDuration("2s"), 2000);
  assert.equal(parseDuration("1m"), 60000);
});

test("parseHeader splits on the first colon", () => {
  assert.deepEqual(parseHeader("Authorization: Bearer abc:def"), ["Authorization", "Bearer abc:def"]);
});

test("parseCommonArgs handles repeated headers and method", () => {
  const parsed = parseCommonArgs(["-X", "POST", "-H", "A: 1", "-H", "B: 2", "--timeout", "3s", "https://example.com"]);
  assert.equal(parsed.method, "POST");
  assert.deepEqual(parsed.headers, { A: "1", B: "2" });
  assert.equal(parsed.timeoutMs, 3000);
  assert.deepEqual(parsed.rest, ["https://example.com"]);
});
