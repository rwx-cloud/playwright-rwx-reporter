# Playwright Captain reporter

`@rwx-cloud/playwright-captain-reporter` adds serial-group retry metadata to
Playwright's built-in JSON report. Captain can use this metadata to retry the
same serial boundary that Playwright retries automatically.

This package is a metadata shim. It does not replace or write the JSON report.

## Install

```sh
npm install --save-dev @rwx-cloud/playwright-captain-reporter
```

## Configure

Put this reporter before Playwright's built-in JSON reporter:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  reporter: [
    ["list"],
    ["@rwx-cloud/playwright-captain-reporter"],
    ["json", { outputFile: "playwright-results.json" }],
  ],
});
```

Reporter order is required. This reporter adds the annotation in `onTestEnd`,
and the JSON reporter that follows it serializes the updated annotations.

For a test inside one or more serial suites, the reporter adds one annotation:

```json
{
  "type": "rwx:serial",
  "location": {
    "file": "/project/tests/example.spec.ts",
    "line": 10,
    "column": 6
  }
}
```

The location is the outermost serial suite. This is a safe retry boundary for
nested serial suites. Tests with no serial ancestor are unchanged.

## Compatibility

The reporter reads `_parallelMode` from Playwright's concrete `Suite` objects.
This property is a private Playwright API and can change without notice.

Compatibility tests cover Playwright 1.50.1 and 1.62.1 on supported Node.js
versions. The package requires Node.js 20.1.0 or later and uses CommonJS.

## Development

Install dependencies and run all checks:

```sh
npm ci
npm run check
```

To run the integration test against one supported Playwright version:

```sh
npm install --no-save --no-package-lock @playwright/test@1.50.1
npm run test:integration
npm ci
```

The final `npm ci` restores the version in `package-lock.json`.
