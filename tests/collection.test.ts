import test from "node:test";
import assert from "node:assert/strict";
import { loadCollection } from "../src/core/collection.js";

const fs: any = await import("node:fs");

test("loadCollection rejects invalid collections", () => {
  const file = ".afx-invalid-collection-test.json";
  fs.writeFileSync(file, JSON.stringify({ nope: [] }));
  try {
    assert.throws(() => loadCollection(file), /requests array/);
  } finally {
    fs.rmSync(file, { force: true });
  }
});
