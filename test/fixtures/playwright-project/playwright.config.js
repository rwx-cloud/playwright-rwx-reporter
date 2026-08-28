const path = require("node:path");

module.exports = {
  outputDir: process.env.PLAYWRIGHT_TEST_OUTPUT_DIR,
  reporter: [
    [path.resolve(__dirname, "../../..", "index.js")],
    ["json", { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_FILE }],
  ],
  testDir: __dirname,
  testMatch: "metadata.spec.js",
  workers: 1,
};
