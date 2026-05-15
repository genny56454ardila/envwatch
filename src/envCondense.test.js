const { stripEmpty, deduplicateLast, stripMatchingDefaults, condenseEnv, serializeCondensed } = require('./envCondense');

function makeMap(obj) {
  return new Map(Object.entries(obj));
}

describe('stripEmpty', () => {
  test('removes keys with empty string values', () => {
    const m = makeMap({ A: 'hello', B: '', C: 'world', D: '' });
    const result = stripEmpty(m);
    expect(result.has('B')).toBe(false);
    expect(result.has('D')).toBe(false);
    expect(result.get('A')).toBe('hello');
    expect(result.get('C')).toBe('world');
  });

  test('returns same map when no empty values', () => {
    const m = makeMap({ X: '1', Y: '2' });
    expect(stripEmpty(m).size).toBe(2);
  });
});

describe('deduplicateLast', () => {
  test('keeps last value for duplicate keys', () => {
    const m = new Map([['A', 'first'], ['B', 'only'], ['A', 'last']]);
    const result = deduplicateLast(m);
    expect(result.get('A')).toBe('last');
    expect(result.size).toBe(2);
  });

  test('preserves order for unique keys', () => {
    const m = makeMap({ X: '1', Y: '2', Z: '3' });
    const keys = [...deduplicateLast(m).keys()];
    expect(keys).toEqual(['X', 'Y', 'Z']);
  });
});

describe('stripMatchingDefaults', () => {
  test('removes keys matching reference values', () => {
    const env = makeMap({ A: 'foo', B: 'bar', C: 'baz' });
    const ref = makeMap({ A: 'foo', C: 'other' });
    const result = stripMatchingDefaults(env, ref);
    expect(result.has('A')).toBe(false);
    expect(result.has('B')).toBe(true);
    expect(result.has('C')).toBe(true);
  });

  test('keeps all keys when reference is empty', () => {
    const env = makeMap({ A: '1', B: '2' });
    expect(stripMatchingDefaults(env, new Map()).size).toBe(2);
  });
});

describe('condenseEnv', () => {
  test('removes empty values by default', () => {
    const m = makeMap({ A: 'val', B: '', C: 'x' });
    const result = condenseEnv(m);
    expect(result.has('B')).toBe(false);
  });

  test('keeps empty values when keepEmpty is true', () => {
    const m = makeMap({ A: 'val', B: '' });
    const result = condenseEnv(m, { keepEmpty: true });
    expect(result.has('B')).toBe(true);
  });
});

describe('serializeCondensed', () => {
  test('serializes map to env format', () => {
    const m = makeMap({ FOO: 'bar', BAZ: 'qux' });
    const out = serializeCondensed(m);
    expect(out).toContain('FOO=bar');
    expect(out).toContain('BAZ=qux');
  });

  test('quotes values with spaces', () => {
    const m = makeMap({ MSG: 'hello world' });
    const out = serializeCondensed(m);
    expect(out).toContain('MSG="hello world"');
  });

  test('returns empty string for empty map', () => {
    expect(serializeCondensed(new Map())).toBe('');
  });
});
