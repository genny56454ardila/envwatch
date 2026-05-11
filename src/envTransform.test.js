const {
  keysToUpper,
  keysToLower,
  addPrefix,
  stripPrefix,
  transformValues,
  trimValues,
} = require('./envTransform');

describe('keysToUpper', () => {
  it('converts all keys to uppercase', () => {
    expect(keysToUpper({ foo: '1', Bar: '2' })).toEqual({ FOO: '1', BAR: '2' });
  });

  it('returns empty object unchanged', () => {
    expect(keysToUpper({})).toEqual({});
  });
});

describe('keysToLower', () => {
  it('converts all keys to lowercase', () => {
    expect(keysToLower({ FOO: '1', BAR: '2' })).toEqual({ foo: '1', bar: '2' });
  });
});

describe('addPrefix', () => {
  it('adds prefix to all keys', () => {
    expect(addPrefix({ FOO: '1', BAR: '2' }, 'APP_')).toEqual({
      APP_FOO: '1',
      APP_BAR: '2',
    });
  });

  it('returns copy unchanged when prefix is empty string', () => {
    const map = { FOO: '1' };
    expect(addPrefix(map, '')).toEqual(map);
  });
});

describe('stripPrefix', () => {
  it('strips prefix from matching keys', () => {
    expect(stripPrefix({ APP_FOO: '1', APP_BAR: '2', OTHER: '3' }, 'APP_')).toEqual({
      FOO: '1',
      BAR: '2',
      OTHER: '3',
    });
  });

  it('returns copy unchanged when prefix is empty', () => {
    const map = { FOO: '1' };
    expect(stripPrefix(map, '')).toEqual(map);
  });
});

describe('transformValues', () => {
  it('applies function to every value', () => {
    const result = transformValues({ A: 'hello', B: 'world' }, (v) => v.toUpperCase());
    expect(result).toEqual({ A: 'HELLO', B: 'WORLD' });
  });

  it('passes key as second argument', () => {
    const result = transformValues({ X: 'val' }, (v, k) => `${k}=${v}`);
    expect(result).toEqual({ X: 'X=val' });
  });
});

describe('trimValues', () => {
  it('trims whitespace from all values', () => {
    expect(trimValues({ A: '  hello  ', B: '\tworld\n' })).toEqual({
      A: 'hello',
      B: 'world',
    });
  });
});
