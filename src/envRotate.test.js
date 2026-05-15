const { rotateValue, rotateEnv, getRotatedKeys, serializeEnv } = require('./envRotate');

describe('rotateValue', () => {
  test('returns next value in list', () => {
    expect(rotateValue('a', ['a', 'b', 'c'])).toBe('b');
  });

  test('wraps around at end of list', () => {
    expect(rotateValue('c', ['a', 'b', 'c'])).toBe('a');
  });

  test('returns first value if current not in list', () => {
    expect(rotateValue('x', ['a', 'b', 'c'])).toBe('a');
  });

  test('throws on empty candidates', () => {
    expect(() => rotateValue('a', [])).toThrow();
  });

  test('single candidate always returns itself', () => {
    expect(rotateValue('a', ['a'])).toBe('a');
  });
});

describe('rotateEnv', () => {
  function makeMap(obj) {
    return new Map(Object.entries(obj));
  }

  test('rotates matching keys', () => {
    const env = makeMap({ NODE_ENV: 'development', PORT: '3000' });
    const spec = { NODE_ENV: ['development', 'staging', 'production'] };
    const result = rotateEnv(env, spec);
    expect(result.get('NODE_ENV')).toBe('staging');
    expect(result.get('PORT')).toBe('3000');
  });

  test('does not modify keys not in spec', () => {
    const env = makeMap({ A: '1', B: '2' });
    const result = rotateEnv(env, { A: ['1', '2'] });
    expect(result.get('B')).toBe('2');
  });

  test('skips spec keys absent from env', () => {
    const env = makeMap({ A: '1' });
    const result = rotateEnv(env, { MISSING: ['x', 'y'] });
    expect(result.has('MISSING')).toBe(false);
  });

  test('original map is not mutated', () => {
    const env = makeMap({ X: 'foo' });
    rotateEnv(env, { X: ['foo', 'bar'] });
    expect(env.get('X')).toBe('foo');
  });
});

describe('getRotatedKeys', () => {
  function makeMap(obj) { return new Map(Object.entries(obj)); }

  test('returns changed entries with from/to', () => {
    const env = makeMap({ ENV: 'dev' });
    const changed = getRotatedKeys(env, { ENV: ['dev', 'prod'] });
    expect(changed.ENV).toEqual({ from: 'dev', to: 'prod' });
  });

  test('returns empty object when nothing changes', () => {
    const env = makeMap({ ENV: 'only' });
    const changed = getRotatedKeys(env, { ENV: ['only'] });
    expect(Object.keys(changed)).toHaveLength(0);
  });
});

describe('serializeEnv', () => {
  test('serializes map to KEY=VALUE lines', () => {
    const map = new Map([['A', '1'], ['B', 'hello']]);
    expect(serializeEnv(map)).toBe('A=1\nB=hello');
  });
});
