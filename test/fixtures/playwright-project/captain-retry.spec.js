const assert = require("node:assert/strict");
const { existsSync, readFileSync, writeFileSync } = require("node:fs");
const { test } = require("@playwright/test");

const stateFile = process.env.CAPTAIN_RETRY_STATE_FILE;

test.describe("serial group", () => {
  test.describe.configure({ mode: "serial" });

  test("starts the serial group", async () => {
    const attempts = existsSync(stateFile)
      ? Number(readFileSync(stateFile, "utf8"))
      : 0;

    writeFileSync(stateFile, String(attempts + 1));
  });

  test("passes when the whole serial group is retried", async () => {
    assert.equal(readFileSync(stateFile, "utf8"), "2");
  });
});
