"use strict";

const logger = require("./logger");

describe("logger", () => {
  let stdoutSpy;
  let stderrSpy;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => {});
    stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => {});
    logger.setLevel("debug");
    logger.setColor(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    logger.setLevel("info");
    logger.setColor(process.stdout.isTTY);
  });

  test("info writes to stdout", () => {
    logger.info("hello world");
    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    expect(stdoutSpy.mock.calls[0][0]).toContain("hello world");
    expect(stdoutSpy.mock.calls[0][0]).toContain("[envwatch]");
  });

  test("error writes to stderr", () => {
    logger.error("something broke");
    expect(stderrSpy).toHaveBeenCalledTimes(1);
    expect(stderrSpy.mock.calls[0][0]).toContain("something broke");
  });

  test("debug is suppressed when level is info", () => {
    logger.setLevel("info");
    logger.debug("verbose stuff");
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  test("debug is shown when level is debug", () => {
    logger.setLevel("debug");
    logger.debug("verbose stuff");
    expect(stdoutSpy).toHaveBeenCalledTimes(1);
  });

  test("setLevel throws on unknown level", () => {
    expect(() => logger.setLevel("verbose")).toThrow("Unknown log level: verbose");
  });

  test("changed logs added var", () => {
    logger.changed("API_KEY", "added");
    const output = stdoutSpy.mock.calls[0][0];
    expect(output).toContain("API_KEY");
    expect(output).toContain("added");
  });

  test("changed logs modified var", () => {
    logger.changed("PORT", "modified");
    const output = stdoutSpy.mock.calls[0][0];
    expect(output).toContain("PORT");
    expect(output).toContain("modified");
  });

  test("warn writes to stdout with warn prefix", () => {
    logger.warn("watch out");
    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    expect(stdoutSpy.mock.calls[0][0]).toContain("[warn]");
  });
});
