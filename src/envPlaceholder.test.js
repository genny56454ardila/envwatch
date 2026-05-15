const { isPlaceholder, findPlaceholders, hasPlaceholders, formatPlaceholderIssues } = require('./envPlaceholder');

function makeMap(obj) {
  return new Map(Object.entries(obj));
}

describe('isPlaceholder', () => {
  it('detects angle-bracket placeholders', () => {
    expect(isPlaceholder('<MY_SECRET>')).toBe(true);
    expect(isPlaceholder('<DB_PASSWORD>')).toBe(true);
  });

  it('detects double-brace placeholders', () => {
    expect(isPlaceholder('{{API_KEY}}')).toBe(true);
  });

  it('detects keyword placeholders', () => {
    expect(isPlaceholder('CHANGEME')).toBe(true);
    expect(isPlaceholder('changeme')).toBe(true);
    expect(isPlaceholder('TODO')).toBe(true);
    expect(isPlaceholder('REPLACE_ME')).toBe(true);
    expect(isPlaceholder('YOUR_API_KEY')).toBe(true);
    expect(isPlaceholder('PLACEHOLDER')).toBe(true);
  });

  it('does not flag real values', () => {
    expect(isPlaceholder('my-actual-secret')).toBe(false);
    expect(isPlaceholder('https://example.com')).toBe(false);
    expect(isPlaceholder('true')).toBe(false);
    expect(isPlaceholder('')).toBe(false);
  });
});

describe('findPlaceholders', () => {
  it('returns matching keys', () => {
    const env = makeMap({
      API_KEY: '<YOUR_API_KEY>',
      DB_HOST: 'localhost',
      SECRET: 'CHANGEME',
    });
    const results = findPlaceholders(env);
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.key)).toEqual(expect.arrayContaining(['API_KEY', 'SECRET']));
  });

  it('returns empty array when none found', () => {
    const env = makeMap({ HOST: 'localhost', PORT: '3000' });
    expect(findPlaceholders(env)).toEqual([]);
  });
});

describe('hasPlaceholders', () => {
  it('returns true when placeholders exist', () => {
    const env = makeMap({ TOKEN: '{{TOKEN}}' });
    expect(hasPlaceholders(env)).toBe(true);
  });

  it('returns false when none exist', () => {
    const env = makeMap({ TOKEN: 'abc123' });
    expect(hasPlaceholders(env)).toBe(false);
  });
});

describe('formatPlaceholderIssues', () => {
  it('formats issues as strings', () => {
    const issues = [{ key: 'API_KEY', value: '<YOUR_KEY>' }];
    const lines = formatPlaceholderIssues(issues);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('API_KEY');
    expect(lines[0]).toContain('<YOUR_KEY>');
    expect(lines[0]).toContain('placeholder');
  });
});
