const { flattenObject, expandEnvToObject, flattenJsonValues } = require('./envFlatten');

describe('flattenObject', () => {
  test('flattens a simple nested object', () => {
    const obj = { db: { host: 'localhost', port: 5432 } };
    const result = flattenObject(obj);
    expect(result.get('DB_HOST')).toBe('localhost');
    expect(result.get('DB_PORT')).toBe('5432');
  });

  test('flattens with a prefix', () => {
    const obj = { host: 'localhost' };
    const result = flattenObject(obj, 'APP');
    expect(result.get('APP_HOST')).toBe('localhost');
  });

  test('handles deeply nested objects', () => {
    const obj = { a: { b: { c: 'deep' } } };
    const result = flattenObject(obj);
    expect(result.get('A_B_C')).toBe('deep');
  });

  test('handles null values', () => {
    const obj = { key: null };
    const result = flattenObject(obj);
    expect(result.get('KEY')).toBe('');
  });

  test('handles array values as strings', () => {
    const obj = { items: [1, 2, 3] };
    const result = flattenObject(obj);
    expect(result.get('ITEMS')).toBe('1,2,3');
  });

  test('returns empty map for empty object', () => {
    const result = flattenObject({});
    expect(result.size).toBe(0);
  });
});

describe('expandEnvToObject', () => {
  test('expands double-underscore keys into nested object', () => {
    const map = new Map([['DB__HOST', 'localhost'], ['DB__PORT', '5432']]);
    const result = expandEnvToObject(map);
    expect(result.DB.HOST).toBe('localhost');
    expect(result.DB.PORT).toBe('5432');
  });

  test('handles flat keys with no delimiter', () => {
    const map = new Map([['SIMPLE', 'value']]);
    const result = expandEnvToObject(map);
    expect(result.SIMPLE).toBe('value');
  });

  test('handles deeply nested keys', () => {
    const map = new Map([['A__B__C', 'deep']]);
    const result = expandEnvToObject(map);
    expect(result.A.B.C).toBe('deep');
  });

  test('merges sibling keys under same parent', () => {
    const map = new Map([['DB__HOST', 'h'], ['DB__USER', 'u']]);
    const result = expandEnvToObject(map);
    expect(result.DB.HOST).toBe('h');
    expect(result.DB.USER).toBe('u');
  });
});

describe('flattenJsonValues', () => {
  test('flattens JSON object values', () => {
    const map = new Map([['DB', JSON.stringify({ host: 'localhost', port: '5432' })]]);
    const result = flattenJsonValues(map);
    expect(result.get('DB_HOST')).toBe('localhost');
    expect(result.get('DB_PORT')).toBe('5432');
    expect(result.has('DB')).toBe(false);
  });

  test('passes through non-JSON values unchanged', () => {
    const map = new Map([['KEY', 'plain-value']]);
    const result = flattenJsonValues(map);
    expect(result.get('KEY')).toBe('plain-value');
  });

  test('passes through JSON primitives unchanged', () => {
    const map = new Map([['NUM', '42'], ['BOOL', 'true']]);
    const result = flattenJsonValues(map);
    expect(result.get('NUM')).toBe('42');
    expect(result.get('BOOL')).toBe('true');
  });

  test('handles mixed map', () => {
    const map = new Map([
      ['PLAIN', 'hello'],
      ['NESTED', JSON.stringify({ x: '1' })],
    ]);
    const result = flattenJsonValues(map);
    expect(result.get('PLAIN')).toBe('hello');
    expect(result.get('NESTED_X')).toBe('1');
    expect(result.has('NESTED')).toBe(false);
  });
});
