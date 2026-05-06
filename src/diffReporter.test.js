// diffReporter.test.js

const { generateDiffReport, formatDiffLine, printDiffReport } = require('./diffReporter');

describe('generateDiffReport', () => {
  const prev = { A: '1', B: '2', C: '3' };
  const next = { B: '99', C: '3', D: '4' };

  let report;
  beforeEach(() => {
    report = generateDiffReport(prev, next);
  });

  test('detects added keys', () => {
    expect(report.added).toEqual({ D: '4' });
  });

  test('detects removed keys', () => {
    expect(report.removed).toEqual({ A: '1' });
  });

  test('detects changed keys with from/to', () => {
    expect(report.changed).toEqual({ B: { from: '2', to: '99' } });
  });

  test('counts unchanged keys', () => {
    expect(report.unchanged).toBe(1);
  });

  test('includes a timestamp string', () => {
    expect(typeof report.timestamp).toBe('string');
    expect(report.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test('handles empty prev', () => {
    const r = generateDiffReport({}, { X: '1' });
    expect(r.added).toEqual({ X: '1' });
    expect(r.removed).toEqual({});
    expect(r.unchanged).toBe(0);
  });

  test('handles empty next', () => {
    const r = generateDiffReport({ X: '1' }, {});
    expect(r.removed).toEqual({ X: '1' });
    expect(r.added).toEqual({});
  });

  test('handles identical envs', () => {
    const r = generateDiffReport({ A: '1' }, { A: '1' });
    expect(r.added).toEqual({});
    expect(r.removed).toEqual({});
    expect(r.changed).toEqual({});
    expect(r.unchanged).toBe(1);
  });
});

describe('formatDiffLine', () => {
  test('formats added line with + prefix', () => {
    const line = formatDiffLine('added', 'FOO', 'bar');
    expect(line).toContain('+ FOO=bar');
  });

  test('formats removed line with - prefix', () => {
    const line = formatDiffLine('removed', 'FOO', 'bar');
    expect(line).toContain('- FOO=bar');
  });

  test('formats changed line with from/to', () => {
    const line = formatDiffLine('changed', 'FOO', { from: 'old', to: 'new' });
    expect(line).toContain('~ FOO');
    expect(line).toContain('from: old');
    expect(line).toContain('to:   new');
  });
});

describe('printDiffReport', () => {
  test('prints without throwing', () => {
    const report = generateDiffReport({ A: '1' }, { A: '2', B: '3' });
    expect(() => printDiffReport(report)).not.toThrow();
  });

  test('prints no-changes message for empty diff', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const report = generateDiffReport({ A: '1' }, { A: '1' });
    printDiffReport(report);
    const output = spy.mock.calls.flat().join(' ');
    expect(output).toContain('no changes');
    spy.mockRestore();
  });
});
