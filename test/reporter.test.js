const assert = require("node:assert/strict");
const test = require("node:test");

const CaptainReporter = require("..");

test("does not annotate a test outside a serial suite", () => {
  const annotations = [{ type: "existing" }];
  const playwrightTest = {
    annotations,
    parent: {
      _parallelMode: "default",
      parent: undefined,
    },
  };

  new CaptainReporter().onTestEnd(playwrightTest);

  assert.deepEqual(playwrightTest.annotations, annotations);
});

test("annotates a test with its serial suite location", () => {
  const location = {
    file: "/project/tests/example.spec.js",
    line: 4,
    column: 6,
  };
  const serialSuite = {
    _parallelMode: "serial",
    location,
    parent: undefined,
  };
  const playwrightTest = {
    annotations: [{ type: "existing" }],
    parent: serialSuite,
  };

  new CaptainReporter().onTestEnd(playwrightTest);

  assert.deepEqual(playwrightTest.annotations, [
    { type: "existing" },
    { type: "captain:serial", location },
  ]);
});

test("uses the outermost serial suite location", () => {
  const outerLocation = {
    file: "/project/tests/example.spec.js",
    line: 10,
    column: 6,
  };
  const outerSerialSuite = {
    _parallelMode: "serial",
    location: outerLocation,
    parent: {
      _parallelMode: "default",
      parent: undefined,
    },
  };
  const innerSerialSuite = {
    _parallelMode: "serial",
    location: {
      file: "/project/tests/example.spec.js",
      line: 13,
      column: 8,
    },
    parent: outerSerialSuite,
  };
  const playwrightTest = {
    annotations: [],
    parent: innerSerialSuite,
  };

  new CaptainReporter().onTestEnd(playwrightTest);

  assert.deepEqual(playwrightTest.annotations, [
    { type: "captain:serial", location: outerLocation },
  ]);
});
