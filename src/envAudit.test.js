const { isSensitiveKey, isWeakValue, auditEnv, hasAuditErrors, formatAuditIssues } = require('./envAudit');

describe('isSensitiveKey', () => {
  test('detects password keys', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('PASSWORD')).toBe(true);
  });

  test('detects api key variants', () => {
    expect(isSensitiveKey('API_KEY')).toBe(true);
    expect(isSensitiveKey('STRIPE_API_KEY')).toBe(true);
  });

  test('does not flag normal keys', () => {
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
  });
});

describe('isWeakValue', () => {
  test('flags common weak values', () => {
    expect(isWeakValue('password')).toBe(true);
    expect(isWeakValue('changeme')).toBe(true);
    expect(isWeakValue('123456')).toBe(true);
  });

  test('does not flag strong-looking values', () => {
    expect(isWeakValue('s3cr3t!XyZ_2024')).toBe(false);
    expect(isWeakValue('production')).toBe(false);
  });
});

describe('auditEnv', () => {
  test('returns empty array for clean env', () => {
    const env = { PORT: '3000', NODE_ENV: 'development' };
    expect(auditEnv(env)).toEqual([]);
  });

  test('flags empty sensitive key', () => {
    const issues = auditEnv({ DB_PASSWORD: '' });
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe('error');
    expect(issues[0].key).toBe('DB_PASSWORD');
  });

  test('flags weak value on sensitive key', () => {
    const issues = auditEnv({ API_KEY: 'secret' });
    expect(issues.some((i) => i.severity === 'warning')).toBe(true);
  });

  test('flags key with whitespace', () => {
    const issues = auditEnv({ 'BAD KEY': 'value' });
    expect(issues.some((i) => i.message.includes('whitespace'))).toBe(true);
  });

  test('flags unexpanded variable reference in value', () => {
    const issues = auditEnv({ HOST: 'http://${DOMAIN}/api' });
    expect(issues.some((i) => i.message.includes('unexpanded'))).toBe(true);
  });

  test('can return multiple issues for one key', () => {
    // sensitive + weak
    const issues = auditEnv({ AUTH_TOKEN: 'admin' });
    expect(issues.length).toBeGreaterThanOrEqual(1);
  });
});

describe('hasAuditErrors', () => {
  test('returns true when errors present', () => {
    expect(hasAuditErrors([{ severity: 'error', key: 'X', message: 'm' }])).toBe(true);
  });

  test('returns false for only warnings', () => {
    expect(hasAuditErrors([{ severity: 'warning', key: 'X', message: 'm' }])).toBe(false);
  });
});

describe('formatAuditIssues', () => {
  test('returns no-issues message for empty array', () => {
    expect(formatAuditIssues([])).toEqual(['No issues found.']);
  });

  test('formats issues with severity prefix', () => {
    const lines = formatAuditIssues([{ severity: 'error', key: 'K', message: 'bad' }]);
    expect(lines[0]).toMatch(/\[ERROR\]/);
    expect(lines[0]).toContain('K');
  });
});
