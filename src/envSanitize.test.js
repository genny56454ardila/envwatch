const {
  sanitizeValue,
  sanitizeEnv,
  listSanitizedKeys,
  trimWhitespace,
  stripControlChars,
  removeNullBytes,
  truncate,
} = require('./envSanitize');

function makeMap(obj) {
  return new Map(Object.entries(obj));
}

describe('trimWhitespace', () => {
  it('trims leading and trailing spaces', () => {
    expect(trimWhitespace('  hello  ')).toBe('hello');
  });
  it('handles empty string', () => {
    expect(trimWhitespace('')).toBe('');
  });
});

describe('removeNullBytes', () => {
  it('removes null bytes from string', () => {
    expect(removeNullBytes('foo\x00bar')).toBe('foobar');
  });
  it('leaves normal strings unchanged', () => {
    expect(removeNullBytes('hello')).toBe('hello');
  });
});

describe('stripControlChars', () => {
  it('removes control characters', () => {
    expect(stripControlChars('hello\x01world')).toBe('helloworld');
  });
  it('preserves tab characters', () => {
    expect(stripControlChars('col1\tcol2')).toBe('col1\tcol2');
  });
  it('preserves newlines', () => {
    expect(stripControlChars('line1\nline2')).toBe('line1\nline2');
  });
});

describe('truncate', () => {
  it('truncates values exceeding maxLength', () => {
    expect(truncate('abcdef', 3)).toBe('abc');
  });
  it('leaves short values unchanged', () => {
    expect(truncate('abc', 10)).toBe('abc');
  });
  it('returns value unchanged if maxLength is null', () => {
    expect(truncate('abcdef', null)).toBe('abcdef');
  });
});

describe('sanitizeValue', () => {
  it('trims and strips control chars by default', () => {
    expect(sanitizeValue('  foo\x01bar  ')).toBe('foobar');
  });
  it('respects trim=false', () => {
    expect(sanitizeValue('  foo  ', { trim: false })).toBe('  foo  ');
  });
  it('respects stripControl=false', () => {
    expect(sanitizeValue('foo\x01bar', { stripControl: false })).toBe('foo\x01bar');
  });
  it('truncates to maxLength', () => {
    expect(sanitizeValue('abcdefgh', { maxLength: 4 })).toBe('abcd');
  });
  it('coerces non-string to string', () => {
    expect(sanitizeValue(42)).toBe('42');
  });
});

describe('sanitizeEnv', () => {
  it('sanitizes all values in map', () => {
    const env = makeMap({ KEY: '  value  ', OTHER: 'clean' });
    const result = sanitizeEnv(env);
    expect(result.get('KEY')).toBe('value');
    expect(result.get('OTHER')).toBe('clean');
  });
  it('returns a new map, does not mutate original', () => {
    const env = makeMap({ A: '  x  ' });
    const result = sanitizeEnv(env);
    expect(env.get('A')).toBe('  x  ');
    expect(result.get('A')).toBe('x');
  });
});

describe('listSanitizedKeys', () => {
  it('returns keys whose values changed', () => {
    const original = makeMap({ A: '  hello  ', B: 'clean' });
    const sanitized = sanitizeEnv(original);
    expect(listSanitizedKeys(original, sanitized)).toEqual(['A']);
  });
  it('returns empty array when nothing changed', () => {
    const original = makeMap({ A: 'hello', B: 'world' });
    const sanitized = sanitizeEnv(original);
    expect(listSanitizedKeys(original, sanitized)).toEqual([]);
  });
});
