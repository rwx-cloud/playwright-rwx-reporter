const path = require("node:path");

module.exports = {
  reporter: [
    [path.resolve(__dirname, "../../..", "index.js")],
    ["json", { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_FILE }],
  ],
  testDir: __dirname,
  testMatch: "metadata.spec.js",
  workers: 1,
};
