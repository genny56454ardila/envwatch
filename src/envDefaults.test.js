const { applyDefaults, missingKeys, defaultsFromObject, serializeEnv } = require('./envDefaults');

function makeMap(obj) {
  return new Map(Object.entries(obj));
}

describe('applyDefaults', () => {
  test('fills in missing keys from defaults', () => {
    const env = makeMap({ FOO: 'bar' });
    const defaults = makeMap({ FOO: 'default_foo', BAZ: 'qux' });
    const result = applyDefaults(env, defaults);
    expect(result.get('FOO')).toBe('bar'); // not overwritten
    expect(result.get('BAZ')).toBe('qux'); // filled in
  });

  test('returns a new map, does not mutate original', () => {
    const env = makeMap({ A: '1' });
    const defaults = makeMap({ B: '2' });
    const result = applyDefaults(env, defaults);
    expect(env.has('B')).toBe(false);
    expect(result.has('B')).toBe(true);
  });

  test('returns copy of env when defaults is empty', () => {
    const env = makeMap({ X: 'hello' });
    const result = applyDefaults(env, new Map());
    expect(result.get('X')).toBe('hello');
    expect(result.size).toBe(1);
  });

  test('all defaults applied when env is empty', () => {
    const defaults = makeMap({ A: '1', B: '2' });
    const result = applyDefaults(new Map(), defaults);
    expect(result.size).toBe(2);
    expect(result.get('A')).toBe('1');
  });
});

describe('missingKeys', () => {
  test('returns keys present in defaults but not in env', () => {
    const env = makeMap({ FOO: 'x' });
    const defaults = makeMap({ FOO: 'y', BAR: 'z', BAZ: 'w' });
    expect(missingKeys(env, defaults)).toEqual(['BAR', 'BAZ']);
  });

  test('returns empty array when all defaults are present', () => {
    const env = makeMap({ A: '1', B: '2' });
    const defaults = makeMap({ A: 'x', B: 'y' });
    expect(missingKeys(env, defaults)).toEqual([]);
  });
});

describe('defaultsFromObject', () => {
  test('converts plain object to Map', () => {
    const result = defaultsFromObject({ PORT: '3000', HOST: 'localhost' });
    expect(result instanceof Map).toBe(true);
    expect(result.get('PORT')).toBe('3000');
    expect(result.get('HOST')).toBe('localhost');
  });

  test('coerces values to strings', () => {
    const result = defaultsFromObject({ NUM: 42, FLAG: true });
    expect(result.get('NUM')).toBe('42');
    expect(result.get('FLAG')).toBe('true');
  });
});

describe('serializeEnv', () => {
  test('serializes map to KEY=VALUE lines', () => {
    const env = makeMap({ A: '1', B: 'hello world' });
    const out = serializeEnv(env);
    expect(out).toContain('A=1');
    expect(out).toContain('B=hello world');
  });

  test('empty map returns empty string', () => {
    expect(serializeEnv(new Map())).toBe('');
  });
});
