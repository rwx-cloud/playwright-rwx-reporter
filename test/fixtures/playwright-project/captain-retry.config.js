const path = require("node:path");

module.exports = {
  outputDir: process.env.PLAYWRIGHT_TEST_OUTPUT_DIR,
  projects: [
    {
      name: "captain-retry",
      testDir: __dirname,
      testMatch: "captain-retry.spec.js",
    },
  ],
  reporter: [
    [path.resolve(__dirname, "../../..", "index.js")],
    ["json", { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_FILE }],
  ],
  workers: 1,
};
