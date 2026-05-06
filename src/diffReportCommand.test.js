// diffReportCommand.test.js

const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseDiffReportArgs, runDiffReportCommand } = require('./diffReportCommand');

function writeTmp(name, content) {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('parseDiffReportArgs', () => {
  test('parses two file paths', () => {
    const result = parseDiffReportArgs(['/a/.env', '/b/.env']);
    expect(result.file1).toContain('.env');
    expect(result.file2).toContain('.env');
    expect(result.json).toBe(false);
  });

  test('detects --json flag', () => {
    const result = parseDiffReportArgs(['/a/.env', '/b/.env', '--json']);
    expect(result.json).toBe(true);
  });

  test('throws if fewer than two files provided', () => {
    expect(() => parseDiffReportArgs(['/a/.env'])).toThrow('two .env file paths');
  });

  test('throws with no args', () => {
    expect(() => parseDiffReportArgs([])).toThrow();
  });
});

describe('runDiffReportCommand', () => {
  let f1, f2;

  beforeEach(() => {
    f1 = writeTmp('dr-test-a.env', 'FOO=1\nBAR=2\n');
    f2 = writeTmp('dr-test-b.env', 'FOO=99\nBAZ=3\n');
  });

  afterEach(() => {
    try { fs.unlinkSync(f1); } catch (_) {}
    try { fs.unlinkSync(f2); } catch (_) {}
  });

  test('runs without throwing for valid files', async () => {
    await expect(runDiffReportCommand([f1, f2])).resolves.toBeUndefined();
  });

  test('outputs JSON when --json flag is set', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runDiffReportCommand([f1, f2, '--json']);
    const raw = spy.mock.calls[0][0];
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveProperty('added');
    expect(parsed).toHaveProperty('removed');
    expect(parsed).toHaveProperty('changed');
    spy.mockRestore();
  });

  test('sets exitCode on missing file', async () => {
    const prev = process.exitCode;
    await runDiffReportCommand(['/no/such/file.env', f2]);
    expect(process.exitCode).toBe(1);
    process.exitCode = prev;
  });

  test('sets exitCode on bad args', async () => {
    const prev = process.exitCode;
    await runDiffReportCommand([]);
    expect(process.exitCode).toBe(1);
    process.exitCode = prev;
  });
});
