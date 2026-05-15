const {
  isMissing,
  findMissingKeys,
  requireKeys,
  parseRequireFile,
  formatMissingIssues,
} = require('./envRequire');

function makeMap(obj) {
  return new Map(Object.entries(obj));
}

describe('isMissing', () => {
  test('returns true for absent key', () => {
    expect(isMissing(makeMap({ A: '1' }), 'B')).toBe(true);
  });
  test('returns true for empty value', () => {
    expect(isMissing(makeMap({ A: '  ' }), 'A')).toBe(true);
  });
  test('returns false for present non-empty key', () => {
    expect(isMissing(makeMap({ A: 'hello' }), 'A')).toBe(false);
  });
});

describe('findMissingKeys', () => {
  test('returns only missing keys', () => {
    const env = makeMap({ A: '1', B: '' });
    expect(findMissingKeys(env, ['A', 'B', 'C'])).toEqual(['B', 'C']);
  });
  test('returns empty array when all present', () => {
    const env = makeMap({ A: '1', B: '2' });
    expect(findMissingKeys(env, ['A', 'B'])).toEqual([]);
  });
});

describe('requireKeys', () => {
  test('ok true when all keys present', () => {
    const env = makeMap({ PORT: '3000', HOST: 'localhost' });
    const result = requireKeys(env, ['PORT', 'HOST']);
    expect(result.ok).toBe(true);
    expect(result.missing).toEqual([]);
  });
  test('ok false with missing list', () => {
    const env = makeMap({ PORT: '3000' });
    const result = requireKeys(env, ['PORT', 'DB_URL']);
    expect(result.ok).toBe(false);
    expect(result.missing).toContain('DB_URL');
  });
});

describe('parseRequireFile', () => {
  test('parses keys one per line', () => {
    const content = '# required keys\nPORT\nDB_URL\n\nSECRET_KEY\n';
    expect(parseRequireFile(content)).toEqual(['PORT', 'DB_URL', 'SECRET_KEY']);
  });
  test('ignores blank lines and comments', () => {
    expect(parseRequireFile('# comment\n\nKEY\n')).toEqual(['KEY']);
  });
});

describe('formatMissingIssues', () => {
  test('formats each missing key', () => {
    const lines = formatMissingIssues(['DB_URL', 'SECRET']);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch('DB_URL');
    expect(lines[1]).toMatch('SECRET');
  });
});
