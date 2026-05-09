const { sortAlpha, sortByOrder, sortByPrefix, serializeSorted } = require('./envSort');

const sample = {
  ZEBRA: 'z',
  APP_NAME: 'myapp',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  ALPHA: 'a',
  APP_ENV: 'dev',
};

describe('sortAlpha', () => {
  test('sorts keys alphabetically ascending', () => {
    const result = sortAlpha(sample);
    const keys = Object.keys(result);
    expect(keys).toEqual([...keys].sort());
  });

  test('sorts keys alphabetically descending', () => {
    const result = sortAlpha(sample, true);
    const keys = Object.keys(result);
    expect(keys).toEqual([...keys].sort().reverse());
  });

  test('preserves all key-value pairs', () => {
    const result = sortAlpha(sample);
    expect(Object.keys(result).length).toBe(Object.keys(sample).length);
    expect(result['DB_HOST']).toBe('localhost');
  });
});

describe('sortByOrder', () => {
  test('places ordered keys first', () => {
    const order = ['DB_HOST', 'DB_PORT', 'APP_NAME'];
    const result = sortByOrder(sample, order);
    const keys = Object.keys(result);
    expect(keys[0]).toBe('DB_HOST');
    expect(keys[1]).toBe('DB_PORT');
    expect(keys[2]).toBe('APP_NAME');
  });

  test('appends remaining keys sorted alpha', () => {
    const order = ['ZEBRA'];
    const result = sortByOrder(sample, order);
    const keys = Object.keys(result);
    expect(keys[0]).toBe('ZEBRA');
    const rest = keys.slice(1);
    expect(rest).toEqual([...rest].sort());
  });

  test('skips order keys not in envMap', () => {
    const result = sortByOrder(sample, ['MISSING_KEY', 'ALPHA']);
    expect(Object.keys(result)[0]).toBe('ALPHA');
  });
});

describe('sortByPrefix', () => {
  test('groups and sorts by prefix', () => {
    const result = sortByPrefix(sample);
    const keys = Object.keys(result);
    const appIdx = keys.indexOf('APP_ENV');
    const appNameIdx = keys.indexOf('APP_NAME');
    const dbHostIdx = keys.indexOf('DB_HOST');
    const dbPortIdx = keys.indexOf('DB_PORT');
    expect(appIdx).toBeLessThan(dbHostIdx);
    expect(appIdx).toBeLessThan(appNameIdx);
    expect(dbHostIdx).toBeLessThan(dbPortIdx);
  });

  test('handles keys with no underscore', () => {
    const env = { NOPREFIX: '1', APP_X: '2' };
    const result = sortByPrefix(env);
    expect(Object.keys(result)).toContain('NOPREFIX');
  });
});

describe('serializeSorted', () => {
  test('outputs KEY=VALUE lines', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    const out = serializeSorted(env);
    expect(out).toContain('FOO=bar');
    expect(out).toContain('BAZ=qux');
    expect(out.endsWith('\n')).toBe(true);
  });
});
