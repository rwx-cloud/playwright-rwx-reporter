class CaptainReporter {
  onTestEnd(test) {
    let outermostSerialSuite;

    for (let suite = test.parent; suite; suite = suite.parent) {
      if (suite._parallelMode === "serial") {
        outermostSerialSuite = suite;
      }
    }

    if (outermostSerialSuite) {
      test.annotations.push({
        type: "captain:serial",
        location: outermostSerialSuite.location,
      });
    }
  }
}

module.exports = CaptainReporter;
