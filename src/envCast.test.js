const { castBoolean, castNumber, castArray, castJSON, autoCast, castEnv, castEnvWithSchema } = require('./envCast');

describe('castBoolean', () => {
  it('returns true for truthy strings', () => {
    expect(castBoolean('true')).toBe(true);
    expect(castBoolean('1')).toBe(true);
    expect(castBoolean('yes')).toBe(true);
    expect(castBoolean('on')).toBe(true);
  });

  it('returns false for falsy strings', () => {
    expect(castBoolean('false')).toBe(false);
    expect(castBoolean('0')).toBe(false);
    expect(castBoolean('no')).toBe(false);
    expect(castBoolean('off')).toBe(false);
  });

  it('returns null for non-boolean strings', () => {
    expect(castBoolean('hello')).toBeNull();
    expect(castBoolean('2')).toBeNull();
  });
});

describe('castNumber', () => {
  it('casts numeric strings', () => {
    expect(castNumber('42')).toBe(42);
    expect(castNumber('3.14')).toBe(3.14);
    expect(castNumber('-7')).toBe(-7);
  });

  it('returns null for non-numeric strings', () => {
    expect(castNumber('abc')).toBeNull();
    expect(castNumber('')).toBeNull();
  });
});

describe('castArray', () => {
  it('splits comma-separated values', () => {
    expect(castArray('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('trims whitespace around items', () => {
    expect(castArray('a, b , c')).toEqual(['a', 'b', 'c']);
  });

  it('filters empty segments', () => {
    expect(castArray('a,,b')).toEqual(['a', 'b']);
  });
});

describe('castJSON', () => {
  it('parses valid JSON', () => {
    expect(castJSON('{"x":1}')).toEqual({ x: 1 });
    expect(castJSON('[1,2,3]')).toEqual([1, 2, 3]);
  });

  it('returns null for invalid JSON', () => {
    expect(castJSON('not json')).toBeNull();
  });
});

describe('autoCast', () => {
  it('casts booleans first', () => {
    expect(autoCast('true')).toBe(true);
  });

  it('casts numbers', () => {
    expect(autoCast('99')).toBe(99);
  });

  it('casts JSON objects', () => {
    expect(autoCast('{"a":1}')).toEqual({ a: 1 });
  });

  it('falls back to string', () => {
    expect(autoCast('hello')).toBe('hello');
  });
});

describe('castEnv', () => {
  it('casts all values in a map', () => {
    const result = castEnv({ DEBUG: 'true', PORT: '3000', NAME: 'app' });
    expect(result).toEqual({ DEBUG: true, PORT: 3000, NAME: 'app' });
  });
});

describe('castEnvWithSchema', () => {
  it('casts values according to schema hints', () => {
    const env = { ENABLED: 'yes', PORT: '8080', TAGS: 'a,b,c', META: '{"v":2}', LABEL: 'prod' };
    const schema = { ENABLED: 'boolean', PORT: 'number', TAGS: 'array', META: 'json', LABEL: 'string' };
    const result = castEnvWithSchema(env, schema);
    expect(result.ENABLED).toBe(true);
    expect(result.PORT).toBe(8080);
    expect(result.TAGS).toEqual(['a', 'b', 'c']);
    expect(result.META).toEqual({ v: 2 });
    expect(result.LABEL).toBe('prod');
  });

  it('leaves keys not in schema as strings', () => {
    const result = castEnvWithSchema({ X: '42' }, {});
    expect(result.X).toBe('42');
  });
});
