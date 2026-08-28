const { test } = require("@playwright/test");

test("normal test", async () => {});

test.describe("serial group", () => {
  test.describe.configure({ mode: "serial" });

  test("serial test", async () => {});
});

test.describe("outer serial group", () => {
  test.describe.configure({ mode: "serial" });

  test.describe("inner serial group", () => {
    test.describe.configure({ mode: "serial" });

    test("nested serial test", async () => {});
  });
});
