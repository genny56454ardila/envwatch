const { lintEnv, hasErrors, formatIssues } = require('./envLint');

describe('lintEnv', () => {
  it('returns no issues for a clean env', () => {
    const parsed = { DATABASE_URL: 'postgres://localhost/db', PORT: '5432' };
    const issues = lintEnv(parsed);
    expect(issues.filter(i => i.rule !== 'noLowercaseKey')).toHaveLength(0);
  });

  it('detects lowercase keys', () => {
    const issues = lintEnv({ db_host: 'localhost' });
    const found = issues.find((i) => i.rule === 'noLowercaseKey');
    expect(found).toBeDefined();
    expect(found.severity).toBe('warning');
  });

  it('detects keys with spaces', () => {
    const issues = lintEnv({ 'BAD KEY': 'value' });
    const found = issues.find((i) => i.rule === 'noSpacesInKey');
    expect(found).toBeDefined();
    expect(found.severity).toBe('error');
  });

  it('detects quoted numbers', () => {
    const issues = lintEnv({ PORT: '"3000"' });
    const found = issues.find((i) => i.rule === 'noQuotedNumbers');
    expect(found).toBeDefined();
  });

  it('detects trailing spaces in values', () => {
    const issues = lintEnv({ HOST: 'localhost   ' });
    const found = issues.find((i) => i.rule === 'noTrailingSpace');
    expect(found).toBeDefined();
  });

  it('respects enabledRules filter', () => {
    const issues = lintEnv({ db_host: 'localhost' }, ['noSpacesInKey']);
    expect(issues).toHaveLength(0);
  });
});

describe('hasErrors', () => {
  it('returns true when there are error-level issues', () => {
    const issues = [{ severity: 'error', key: 'X', rule: 'r', message: 'm' }];
    expect(hasErrors(issues)).toBe(true);
  });

  it('returns false for warnings only', () => {
    const issues = [{ severity: 'warning', key: 'X', rule: 'r', message: 'm' }];
    expect(hasErrors(issues)).toBe(false);
  });
});

describe('formatIssues', () => {
  it('returns friendly message when no issues', () => {
    expect(formatIssues([])).toBe('No issues found.');
  });

  it('formats issues with severity and message', () => {
    const issues = [{ severity: 'warning', key: 'db_host', rule: 'noLowercaseKey', message: 'Key is not uppercase' }];
    const output = formatIssues(issues);
    expect(output).toContain('[WARNING]');
    expect(output).toContain('db_host');
  });
});
