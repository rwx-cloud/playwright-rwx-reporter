const assert = require("node:assert/strict");
const { mkdtempSync, readFileSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const fixtureRoot = path.join(__dirname, "fixtures", "playwright-project");

function shellQuote(value) {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

function collectSpecs(suites) {
  return suites.flatMap((suite) => [
    ...(suite.specs || []),
    ...collectSpecs(suite.suites || []),
  ]);
}

function rwxSerialAnnotations(spec) {
  assert.equal(spec.tests.length, 1);

  return spec.tests[0].annotations.filter(
    (annotation) => annotation.type === "rwx:serial",
  );
}

test("adds serial retry boundaries to Playwright's JSON report", (t) => {
  const outputDirectory = mkdtempSync(
    path.join(tmpdir(), "playwright-rwx-reporter-"),
  );
  const outputFile = path.join(outputDirectory, "results.json");
  t.after(() => rmSync(outputDirectory, { recursive: true, force: true }));

  const run = spawnSync(
    process.execPath,
    [require.resolve("@playwright/test/cli"), "test"],
    {
      cwd: fixtureRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        PLAYWRIGHT_JSON_OUTPUT_FILE: outputFile,
        PLAYWRIGHT_TEST_OUTPUT_DIR: path.join(outputDirectory, "test-results"),
      },
    },
  );

  assert.equal(
    run.status,
    0,
    `Playwright exited with status ${run.status}\n${run.stdout}\n${run.stderr}`,
  );

  const report = JSON.parse(readFileSync(outputFile, "utf8"));
  const specsByTitle = new Map(
    collectSpecs(report.suites).map((spec) => [spec.title, spec]),
  );
  const fixtureFile = path.join(fixtureRoot, "metadata.spec.js");

  assert.deepEqual(rwxSerialAnnotations(specsByTitle.get("normal test")), []);
  assert.deepEqual(rwxSerialAnnotations(specsByTitle.get("serial test")), [
    {
      type: "rwx:serial",
      location: { file: fixtureFile, line: 5, column: 6 },
    },
  ]);
  assert.deepEqual(
    rwxSerialAnnotations(specsByTitle.get("nested serial test")),
    [
      {
        type: "rwx:serial",
        location: { file: fixtureFile, line: 11, column: 6 },
      },
    ],
  );
});

test("Captain retries the outer serial group", (t) => {
  const captainVersion = spawnSync("captain", ["--version"], {
    encoding: "utf8",
  });

  assert.equal(
    captainVersion.status,
    0,
    "captain is not on PATH. Install it with `mise install`.",
  );
  assert.equal(captainVersion.stdout.trim(), "v2.8.7");

  const outputDirectory = mkdtempSync(
    path.join(tmpdir(), "playwright-rwx-captain-"),
  );
  const outputFile = path.join(outputDirectory, "results.json");
  const stateFile = path.join(outputDirectory, "serial-attempts");
  const configFile = path.join(fixtureRoot, "captain-retry.config.js");
  t.after(() => rmSync(outputDirectory, { recursive: true, force: true }));

  const playwright = [
    shellQuote(process.execPath),
    shellQuote(require.resolve("@playwright/test/cli")),
    "test",
    "--config",
    shellQuote(configFile),
  ].join(" ");
  const retry = `${playwright} {{ tests }} --project '{{ project }}'`;
  const run = spawnSync(
    "captain",
    [
      "run",
      "reporter-playwright",
      "--command",
      playwright,
      "--test-results",
      outputFile,
      "--retries",
      "1",
      "--retry-command",
      retry,
      "--quiet",
    ],
    {
      cwd: outputDirectory,
      encoding: "utf8",
      env: {
        ...process.env,
        CAPTAIN_RETRY_STATE_FILE: stateFile,
        PLAYWRIGHT_JSON_OUTPUT_FILE: outputFile,
        PLAYWRIGHT_TEST_OUTPUT_DIR: path.join(outputDirectory, "test-results"),
      },
    },
  );

  assert.equal(
    run.status,
    0,
    `Captain exited with status ${run.status}\n${run.stdout}\n${run.stderr}`,
  );
  assert.equal(readFileSync(stateFile, "utf8"), "2");
});
