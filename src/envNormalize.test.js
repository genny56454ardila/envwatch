const {
  trimEntries,
  quoteSpacedValues,
  normalizeKeys,
  deduplicateKeys,
  normalizeEnv,
  serializeNormalized,
} = require('./envNormalize');

function makeMap(obj) {
  return new Map(Object.entries(obj));
}

describe('trimEntries', () => {
  it('trims whitespace from keys and values', () => {
    const m = makeMap({ '  FOO  ': '  bar  ', ' BAZ': 'qux ' });
    const result = trimEntries(m);
    expect(result.get('FOO')).toBe('bar');
    expect(result.get('BAZ')).toBe('qux');
  });
});

describe('quoteSpacedValues', () => {
  it('wraps values with spaces in double quotes', () => {
    const m = makeMap({ FOO: 'hello world', BAR: 'nospace' });
    const result = quoteSpacedValues(m);
    expect(result.get('FOO')).toBe('"hello world"');
    expect(result.get('BAR')).toBe('nospace');
  });

  it('does not double-quote already quoted values', () => {
    const m = makeMap({ FOO: '"hello world"', BAR: "'spaced value'" });
    const result = quoteSpacedValues(m);
    expect(result.get('FOO')).toBe('"hello world"');
    expect(result.get('BAR')).toBe("'spaced value'");
  });
});

describe('normalizeKeys', () => {
  it('converts keys to UPPER_SNAKE_CASE', () => {
    const m = makeMap({ 'my-key': 'val', 'another key': 'v2', ALREADY: 'v3' });
    const result = normalizeKeys(m);
    expect(result.has('MY_KEY')).toBe(true);
    expect(result.has('ANOTHER_KEY')).toBe(true);
    expect(result.has('ALREADY')).toBe(true);
  });
});

describe('deduplicateKeys', () => {
  it('keeps last occurrence of duplicate keys', () => {
    const entries = [['FOO', 'first'], ['BAR', 'bar'], ['FOO', 'last']];
    const result = deduplicateKeys(entries);
    expect(result.get('FOO')).toBe('last');
    expect(result.size).toBe(2);
  });
});

describe('normalizeEnv', () => {
  it('applies all steps by default', () => {
    const m = makeMap({ '  my-key  ': '  hello world  ' });
    const result = normalizeEnv(m);
    expect(result.has('MY_KEY')).toBe(true);
    expect(result.get('MY_KEY')).toBe('"hello world"');
  });

  it('respects options flags', () => {
    const m = makeMap({ 'my-key': 'value' });
    const result = normalizeEnv(m, { normalizeKeys: false, quoteSpaces: false });
    expect(result.has('my-key')).toBe(true);
  });
});

describe('serializeNormalized', () => {
  it('serializes map to .env format', () => {
    const m = makeMap({ FOO: 'bar', BAZ: '"hello world"' });
    const output = serializeNormalized(m);
    expect(output).toContain('FOO=bar');
    expect(output).toContain('BAZ="hello world"');
    expect(output.endsWith('\n')).toBe(true);
  });
});
